import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

/**
 * GET /api/resume/download
 * 
 * Securely downloads the user's resume PDF from InsForge Storage
 * using an authorized session request and returns it as a binary download attachment.
 */
export async function GET() {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to download your resume." },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    const pathsToTry = [`resumes/${userId}/resume.pdf`, `${userId}/resume.pdf`];
    let pdfBlob: Blob | null = null;

    for (const path of pathsToTry) {
      try {
        const { data: blob, error: downloadErr } = await insforge.storage
          .from("resumes")
          .download(path);

        if (!downloadErr && blob && blob.size > 0) {
          pdfBlob = blob;
          break;
        }
      } catch {
        // try next candidate path
      }
    }

    // Fallback to checking profile table for stored URL
    if (!pdfBlob) {
      const { data: profile } = await insforge.database
        .from("profiles")
        .select("resume_pdf_url")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.resume_pdf_url) {
        try {
          const res = await fetch(profile.resume_pdf_url);
          if (res.ok) {
            pdfBlob = await res.blob();
          }
        } catch (fetchErr) {
          console.error("[ResumeDownload] Failed to fetch stored resume URL:", fetchErr);
        }
      }
    }

    if (!pdfBlob) {
      return NextResponse.json(
        { error: "No resume found. Please generate or upload a resume first." },
        { status: 404 }
      );
    }

    const arrayBuffer = await pdfBlob.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to download resume";
    console.error("[ResumeDownload] Unexpected error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
