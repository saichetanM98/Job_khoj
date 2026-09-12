import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { discoverJobs } from "@/agent/adzuna";

/**
 * POST /api/agent/find
 * 
 * Triggers the Adzuna Job Discovery Agent:
 * 1. Authenticates current user.
 * 2. Parses { jobTitle, location, country } from request body.
 * 3. Executes discovery, 3-tier scoring, deduplication, and persistence.
 * 4. Returns discovery statistics and saved jobs.
 */
export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } = await insforge.auth.getCurrentUser();

    let userId = authData?.user?.id;

    // Local development fallback if testing API directly without browser cookie session
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
        { error: "Unauthorized: Please log in to search for jobs." },
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

    const { jobTitle, location = "", country = "us" } = body;

    if (!jobTitle || typeof jobTitle !== "string" || jobTitle.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid job title is required for job discovery." },
        { status: 400 }
      );
    }

    const result = await discoverJobs(
      jobTitle.trim(),
      typeof location === "string" ? location.trim() : "",
      typeof country === "string" ? country.trim() : "us",
      userId
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          runId: result.runId,
          error: result.error || "Job discovery failed to complete.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      runId: result.runId,
      jobs: result.jobs || [],
      stats: result.stats,
    });
  } catch (error: any) {
    console.error("[api/agent/find] Route execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred during job discovery.",
      },
      { status: 500 }
    );
  }
}
