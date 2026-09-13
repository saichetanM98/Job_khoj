import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { runCompanyResearch } from "@/agent/researcher";

export const maxDuration = 60;

/**
 * POST /api/agent/research
 * 
 * Executes on-demand company research for a job:
 * 1. Authenticates current user session.
 * 2. Resolves employer website from redirects.
 * 3. Browses public pages via Browserbase & Stagehand.
 * 4. Synthesizes 9-field dossier with LLM cascade.
 * 5. Saves to DB and captures PostHog telemetry.
 */
export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();

    let userId = authData?.user?.id;

    // Local development fallback if testing API without active browser cookie session
    if (!userId) {
      const { data: fallbackProfiles } = await insforge.database
        .from("profiles")
        .select("id")
        .limit(1);

      if (fallbackProfiles && fallbackProfiles.length > 0) {
        userId = fallbackProfiles[0].id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to perform company research." },
        { status: 401 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { jobId } = body;

    if (!jobId || typeof jobId !== "string" || jobId.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid jobId is required." },
        { status: 400 }
      );
    }

    const result = await runCompanyResearch(jobId.trim(), userId);

    return NextResponse.json({
      success: true,
      dossier: result.dossier,
      usedFallback: result.usedFallback,
      failureReason: result.failureReason,
      pagesVisited: result.pagesVisited,
      resolvedDomain: result.resolvedDomain,
    });
  } catch (error: any) {
    console.error("[api/agent/research] Route execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal error occurred during company research.",
      },
      { status: 500 }
    );
  }
}
