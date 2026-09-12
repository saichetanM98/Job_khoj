import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parsePdfText } from "@/lib/pdf-parser";
import { extractProfileFromResumeText } from "@/agent/extractor";

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User not signed in" },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    let pdfBuffer: Buffer | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (file && file.size > 0) {
          if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
            return NextResponse.json(
              { success: false, error: "Only PDF files are supported for resume extraction." },
              { status: 400 }
            );
          }

          const arrayBuffer = await file.arrayBuffer();
          pdfBuffer = Buffer.from(arrayBuffer);
        }
      } catch (formErr) {
        console.error("[resume/extract] Error reading formData:", formErr);
      }
    }

    // If no direct file was sent in formData, retrieve from InsForge Storage
    if (!pdfBuffer) {
      // Try download from bucket directly
      const pathsToTry = [`resumes/${userId}/resume.pdf`, `${userId}/resume.pdf`];
      for (const p of pathsToTry) {
        try {
          const { data: blob, error: downloadErr } = await insforge.storage
            .from("resumes")
            .download(p);

          if (!downloadErr && blob) {
            const arrayBuffer = await blob.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuffer);
            break;
          }
        } catch (e) {
          // continue to next path or URL fetch
        }
      }

      // If still not retrieved, fetch via public URL from database
      if (!pdfBuffer) {
        const { data: profile } = await insforge.database
          .from("profiles")
          .select("resume_pdf_url")
          .eq("id", userId)
          .maybeSingle();

        if (profile?.resume_pdf_url) {
          try {
            const res = await fetch(profile.resume_pdf_url);
            if (res.ok) {
              const arrayBuffer = await res.arrayBuffer();
              pdfBuffer = Buffer.from(arrayBuffer);
            }
          } catch (fetchErr) {
            console.error("[resume/extract] Failed to fetch stored resume PDF from URL:", fetchErr);
          }
        }
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No resume PDF provided or found on file. Please upload a resume first.",
        },
        { status: 400 }
      );
    }

    // 1. Extract text from PDF buffer
    const parseResult = await parsePdfText(pdfBuffer);
    if (!parseResult.success || !parseResult.text) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error || "Could not extract text from this PDF. Please try a different file.",
        },
        { status: 400 }
      );
    }

    // 2. Structured AI extraction using GPT-4o
    const extractResult = await extractProfileFromResumeText(parseResult.text);
    if (!extractResult.success || !extractResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: extractResult.error || "Failed to extract profile information with AI.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: extractResult.data,
    });
  } catch (error) {
    console.error("[resume/extract]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while extracting resume profile." },
      { status: 500 }
    );
  }
}
