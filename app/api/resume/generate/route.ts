import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { createInsforgeServer } from "@/lib/insforge-server";
import { saveProfile, SaveProfileInput } from "@/app/actions/profile";
import { generatePolishedResumeContent } from "@/agent/resume-generator";
import { ResumePdfDocument } from "@/components/resume/ResumePdfDocument";
import { UserProfile } from "@/types";

/**
 * Validates the incoming live profile payload against SaveProfileInput schema.
 * Ensures the generate endpoint cannot be used as a backdoor to write malformed data.
 */
function validateProfilePayload(payload: unknown): { valid: boolean; data?: SaveProfileInput; error?: string } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Profile payload must be a valid JSON object." };
  }

  const p = payload as Record<string, unknown>;

  if (p.full_name !== undefined && p.full_name !== null && typeof p.full_name !== "string") {
    return { valid: false, error: "Field 'full_name' must be a string." };
  }
  if (p.phone !== undefined && p.phone !== null && typeof p.phone !== "string") {
    return { valid: false, error: "Field 'phone' must be a string." };
  }
  if (p.location !== undefined && p.location !== null && typeof p.location !== "string") {
    return { valid: false, error: "Field 'location' must be a string." };
  }
  if (p.current_title !== undefined && p.current_title !== null && typeof p.current_title !== "string") {
    return { valid: false, error: "Field 'current_title' must be a string." };
  }
  if (p.skills !== undefined && p.skills !== null && !Array.isArray(p.skills)) {
    return { valid: false, error: "Field 'skills' must be an array of strings." };
  }
  if (p.work_experience !== undefined && p.work_experience !== null && !Array.isArray(p.work_experience)) {
    return { valid: false, error: "Field 'work_experience' must be an array." };
  }
  if (
    p.education !== undefined &&
    p.education !== null &&
    (typeof p.education !== "object" || Array.isArray(p.education))
  ) {
    return { valid: false, error: "Field 'education' must be an object." };
  }

  return { valid: true, data: p as SaveProfileInput };
}

/**
 * POST /api/resume/generate
 * 
 * Generates an AI-polished, single-page A4 PDF resume from current profile data,
 * stores the rendered buffer in InsForge Storage (`resumes` bucket), updates
 * `profiles.resume_pdf_url`, and returns the public document URL.
 * 
 * Architecture decisions:
 * - save: boolean (preview-without-persisting) is deferred; current behavior always persists.
 * - Live form payload validated against SaveProfileInput before upserting.
 * - AI polish bounded by 15s per-provider timeout and 35s overall budget.
 * - Resilient fallback: returns ai_polished: false with warning banner if LLM is unavailable.
 */
export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email || "";

    // Parse optional live profile payload
    let requestBody: Record<string, unknown> | null = null;
    try {
      requestBody = await req.json();
    } catch {
      // Empty or non-JSON body is valid; will read from DB
      requestBody = null;
    }

    let activeProfile: UserProfile;

    // Check if live profile data was provided in request
    const candidatePayload = requestBody?.profile || requestBody;
    const hasLivePayload =
      candidatePayload &&
      typeof candidatePayload === "object" &&
      Object.keys(candidatePayload).length > 0 &&
      !("action" in candidatePayload && Object.keys(candidatePayload).length === 1);

    if (hasLivePayload) {
      const validation = validateProfilePayload(candidatePayload);
      if (!validation.valid || !validation.data) {
        return NextResponse.json(
          { error: `Invalid profile payload: ${validation.error}` },
          { status: 400 }
        );
      }

      // Save/persist validated profile state (preview-without-persisting is deferred)
      const saveResult = await saveProfile(validation.data);
      if (!saveResult.success || !saveResult.profile) {
        return NextResponse.json(
          { error: saveResult.error || "Failed to update profile data prior to resume generation." },
          { status: 500 }
        );
      }

      activeProfile = saveResult.profile;
    } else {
      // Fetch latest profile from database
      const { data: dbProfile, error: dbError } = await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (dbError) {
        return NextResponse.json({ error: "Failed to load user profile." }, { status: 500 });
      }

      if (!dbProfile) {
        activeProfile = {
          id: userId,
          email: userEmail,
          full_name: "Applicant",
          phone: null,
          location: null,
          current_title: "Professional",
          experience_level: null,
          years_experience: null,
          skills: [],
          industries: [],
          work_experience: [],
          education: null,
          job_titles_seeking: [],
          remote_preference: null,
          preferred_locations: [],
          salary_expectation: null,
          cover_letter_tone: null,
          linkedin_url: null,
          portfolio_url: null,
          work_authorization: null,
          resume_pdf_url: null,
          is_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        activeProfile = dbProfile as UserProfile;
      }
    }

    // Generate polished resume content via AI agent with bounded timeout and fallback
    const { data: resumeData, polished: ai_polished, warning } =
      await generatePolishedResumeContent(activeProfile);

    // Render single-page PDF document to buffer using @react-pdf/renderer
    // Cast to ReactElement to satisfy @react-pdf/renderer's strict DocumentProps typing
    const pdfElement = React.createElement(ResumePdfDocument, {
      data: resumeData,
    }) as unknown as React.ReactElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(pdfElement as any);

    // Convert Buffer to Uint8Array for Blob construction
    const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
    // Delete existing resume file(s) from InsForge Storage before uploading new one
    const candidateOldPaths = [`resumes/${userId}/resume.pdf`, `${userId}/resume.pdf`];
    try {
      await insforge.storage.from("resumes").remove(candidateOldPaths);
    } catch (removeErr) {
      console.warn("[ResumeGeneration] Notice: Old resume deletion skipped or file not found:", removeErr);
    }

    const storagePath = `resumes/${userId}/resume.pdf`;
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(storagePath, pdfBlob);

    if (uploadError || !uploadData) {
      console.error("[ResumeGeneration] Storage upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError?.message || "Failed to upload generated PDF to storage." },
        { status: 500 }
      );
    }

    const resumePdfUrl = uploadData.url;

    // Reliably upsert profiles table with the new resume_pdf_url
    const { error: updateError } = await insforge.database
      .from("profiles")
      .upsert(
        [
          {
            id: userId,
            email: userEmail,
            resume_pdf_url: resumePdfUrl,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "id" }
      );

    if (updateError) {
      console.warn("[ResumeGeneration] Failed to persist resume_pdf_url to profiles:", updateError);
    }

    return NextResponse.json({
      success: true,
      resume_pdf_url: resumePdfUrl,
      ai_polished,
      warning,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[ResumeGeneration] Unhandled error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
