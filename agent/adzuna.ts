import { createInsforgeServer } from "@/lib/insforge-server";
import { searchJobs, AdzunaJob } from "@/lib/adzuna";
import { scoreJobsBatch, ScoredMatch } from "@/agent/matcher";
import { createPostHogServer } from "@/lib/posthog-server";
import { UserProfile } from "@/types";

export interface DiscoverJobsResult {
  success: boolean;
  runId?: string;
  jobs?: any[];
  error?: string;
  stats?: {
    jobs_returned_by_api: number;
    new_jobs_saved: number;
    jobs_scored_groq: number;
    jobs_scored_gemini: number;
    jobs_fallback_scored: number;
    used_fallback: boolean;
  };
}

/**
 * Helper to log entries to the agent_logs table in InsForge.
 */
async function logAgentEvent(
  insforge: any,
  runId: string,
  userId: string,
  level: "info" | "warning" | "error",
  message: string,
  jobId?: string | null
) {
  try {
    await insforge.database.from("agent_logs").insert([
      {
        run_id: runId,
        user_id: userId,
        level,
        message,
        job_id: jobId || null,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("[agent/adzuna] Failed to write agent_log:", err);
  }
}

/**
 * Formats salary string from Adzuna min/max numbers
 */
function formatSalary(job: AdzunaJob): string | null {
  if (!job.salary_min) return null;
  const minK = Math.round(job.salary_min / 1000);
  if (!job.salary_max || job.salary_max === job.salary_min) {
    return `$${minK}k`;
  }
  const maxK = Math.round(job.salary_max / 1000);
  return `$${minK}k - $${maxK}k`;
}

/**
 * Main discovery orchestrator for Feature 10 (Adzuna Job Discovery).
 * Adheres strictly to library-docs.md and build-plan specifications.
 */
export async function discoverJobs(
  jobTitle: string,
  location: string = "",
  country: string = "us",
  userId: string
): Promise<DiscoverJobsResult> {
  const insforge = await createInsforgeServer();
  const posthog = createPostHogServer();

  let runId: string = "";

  try {
    // 1. Create agent_runs row with status='running'
    const { data: runRecord, error: runError } = await insforge.database
      .from("agent_runs")
      .insert([
        {
          user_id: userId,
          status: "running",
          job_title_searched: jobTitle,
          location_searched: location || "",
          country_searched: country,
          jobs_found: 0,
          used_fallback: false,
          started_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (runError || !runRecord?.id) {
      throw new Error(`Failed to create agent_run record: ${runError?.message || "Unknown error"}`);
    }

    runId = runRecord.id;

    // Track search started in PostHog
    posthog.capture({
      distinctId: userId,
      event: "job_search_started",
      properties: {
        userId,
        jobTitle,
        location,
        country,
        runId,
      },
    });

    await logAgentEvent(
      insforge,
      runId,
      userId,
      "info",
      `Started Adzuna job discovery for "${jobTitle}" in "${location || "anywhere"}" (${country}).`
    );

    // 2. Fetch User Profile for Match Scoring
    const { data: profileData, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profileData) {
      await logAgentEvent(
        insforge,
        runId,
        userId,
        "warning",
        "Could not load full user profile. Proceeding with default scoring baseline."
      );
    }

    const profile: UserProfile = profileData || {
      id: userId,
      full_name: null,
      email: null,
      phone: null,
      location: null,
      current_title: jobTitle,
      experience_level: null,
      years_experience: null,
      skills: [],
      industries: [],
      work_experience: [],
      education: null,
      job_titles_seeking: [jobTitle],
      remote_preference: null,
      preferred_locations: [],
      salary_expectation: null,
      cover_letter_tone: null,
      linkedin_url: null,
      portfolio_url: null,
      work_authorization: null,
      resume_pdf_url: null,
      is_complete: false,
    };

    // 3. Call Adzuna Client (with mock fallback handling)
    const searchResult = await searchJobs(jobTitle, location, country);
    const { results: rawJobs, isFallback, fallbackReason, warningLevel } = searchResult;

    if (isFallback) {
      await logAgentEvent(
        insforge,
        runId,
        userId,
        warningLevel || "info",
        `Adzuna fallback activated: ${fallbackReason}`
      );
    }

    await logAgentEvent(
      insforge,
      runId,
      userId,
      "info",
      `Fetched ${rawJobs.length} job listing(s) from ${isFallback ? "mock fallback dataset" : "Adzuna API"}.`
    );

    // 4. Deduplication Check against existing jobs for this user
    const { data: existingJobsData } = await insforge.database
      .from("jobs")
      .select("id, adzuna_job_id, source_url, scored_at, match_score, match_reason, matched_skills, missing_skills, match_method, llm_provider")
      .eq("user_id", userId);

    const existingJobs = existingJobsData || [];

    // Map existing jobs by adzuna_job_id or source_url
    const existingMap = new Map<string, any>();
    for (const ej of existingJobs) {
      if (ej.adzuna_job_id) {
        existingMap.set(ej.adzuna_job_id, ej);
      }
      if (ej.source_url) {
        existingMap.set(ej.source_url, ej);
      }
    }

    const profileUpdatedAt = profile.updated_at ? new Date(profile.updated_at).getTime() : 0;

    const jobsToScore: AdzunaJob[] = [];
    const jobsWithExistingScores: { job: AdzunaJob; existing: any }[] = [];

    for (const job of rawJobs) {
      const existing = existingMap.get(job.id) || existingMap.get(job.redirect_url);
      if (existing) {
        const scoredAtTime = existing.scored_at ? new Date(existing.scored_at).getTime() : 0;
        // Only re-score if profile was updated after the job was scored
        if (profileUpdatedAt > scoredAtTime) {
          jobsToScore.push(job);
        } else {
          jobsWithExistingScores.push({ job, existing });
        }
      } else {
        jobsToScore.push(job);
      }
    }

    // 5. Run Concurrent Match Scoring on jobs requiring scoring
    const onMatcherLog = async (level: "info" | "warning" | "error", message: string) => {
      await logAgentEvent(insforge, runId, userId, level, message);
    };

    const { results: newlyScoredResults, stats: scoringStats } = await scoreJobsBatch(
      jobsToScore,
      profile,
      onMatcherLog
    );

    const scoredMap = new Map<string, ScoredMatch>();
    for (const item of newlyScoredResults) {
      scoredMap.set(item.job.id, item.scored);
    }

    const nowIso = new Date().toISOString();
    const rowsToInsert: any[] = [];
    const rowsToUpdate: any[] = [];

    // 6. Partition into Inserts vs Updates
    let genuinelyNewCount = 0;

    for (const job of rawJobs) {
      const existing = existingMap.get(job.id) || existingMap.get(job.redirect_url);
      const formattedSalary = formatSalary(job);

      if (existing) {
        // Job already exists: prepare update
        const newlyScored = scoredMap.get(job.id);
        const updatePayload: any = {
          id: existing.id,
          run_id: runId,
          last_seen_run_id: runId,
          last_seen_at: nowIso,
          salary: formattedSalary,
        };

        if (newlyScored) {
          updatePayload.match_score = newlyScored.matchScore;
          updatePayload.match_reason = newlyScored.matchReason;
          updatePayload.matched_skills = newlyScored.matchedSkills;
          updatePayload.missing_skills = newlyScored.missingSkills;
          updatePayload.match_method = newlyScored.match_method;
          updatePayload.llm_provider = newlyScored.llm_provider;
          updatePayload.scored_at = nowIso;
        }

        rowsToUpdate.push(updatePayload);
      } else {
        // Genuinely new job: prepare insert
        genuinelyNewCount++;
        const scoreData = scoredMap.get(job.id) || {
          matchScore: 50,
          matchReason: "Evaluated default match.",
          matchedSkills: [],
          missingSkills: [],
          match_method: "heuristic_fallback" as const,
          llm_provider: null,
        };

        rowsToInsert.push({
          user_id: userId,
          run_id: runId,
          source: "search",
          source_url: job.redirect_url,
          external_apply_url: job.redirect_url,
          adzuna_job_id: job.id,
          title: job.title,
          company: job.company?.display_name || "Unknown Company",
          location: job.location?.display_name || "Remote",
          salary: formattedSalary,
          job_type: job.contract_type || "fulltime",
          about_role: job.description,
          match_score: scoreData.matchScore,
          match_reason: scoreData.matchReason,
          matched_skills: scoreData.matchedSkills,
          missing_skills: scoreData.missingSkills,
          is_fallback: isFallback,
          match_method: scoreData.match_method,
          llm_provider: scoreData.llm_provider,
          last_seen_run_id: runId,
          last_seen_at: nowIso,
          scored_at: nowIso,
          found_at: nowIso,
        });
      }
    }

    // 7. Persist to Database
    let savedJobRecords: any[] = [];

    if (rowsToInsert.length > 0) {
      const { data: insertedData, error: insertError } = await insforge.database
        .from("jobs")
        .insert(rowsToInsert)
        .select();

      if (insertError) {
        throw new Error(`Failed to insert new jobs: ${insertError.message}`);
      }
      savedJobRecords.push(...(insertedData || []));
    }

    if (rowsToUpdate.length > 0) {
      for (const updateItem of rowsToUpdate) {
        const { id, ...fields } = updateItem;
        const { data: updatedData } = await insforge.database
          .from("jobs")
          .update(fields)
          .eq("id", id)
          .select();

        if (updatedData && updatedData.length > 0) {
          savedJobRecords.push(updatedData[0]);
        }
      }
    }

    // 8. Fire PostHog Events for discovered jobs
    for (const jobRec of savedJobRecords) {
      posthog.capture({
        distinctId: userId,
        event: "job_found",
        properties: {
          userId,
          source: "search",
          matchScore: jobRec.match_score,
          jobTitle: jobRec.title,
          company: jobRec.company,
          used_fallback: isFallback,
          match_method: jobRec.match_method,
          llm_provider: jobRec.llm_provider,
        },
      });
    }

    // 9. Update agent_runs row: status='completed' with all metrics
    await insforge.database
      .from("agent_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        jobs_found: rawJobs.length,
        jobs_returned_by_api: rawJobs.length,
        new_jobs_saved: genuinelyNewCount,
        jobs_scored_groq: scoringStats.jobs_scored_groq,
        jobs_scored_gemini: scoringStats.jobs_scored_gemini,
        jobs_fallback_scored: scoringStats.jobs_fallback_scored,
        used_fallback: isFallback,
      })
      .eq("id", runId);

    await logAgentEvent(
      insforge,
      runId,
      userId,
      "info",
      `Completed discovery run. Found ${rawJobs.length} jobs (${genuinelyNewCount} new). Scored: Groq=${scoringStats.jobs_scored_groq}, Gemini=${scoringStats.jobs_scored_gemini}, Heuristic=${scoringStats.jobs_fallback_scored}.`
    );

    return {
      success: true,
      runId,
      jobs: savedJobRecords,
      stats: {
        jobs_returned_by_api: rawJobs.length,
        new_jobs_saved: genuinelyNewCount,
        jobs_scored_groq: scoringStats.jobs_scored_groq,
        jobs_scored_gemini: scoringStats.jobs_scored_gemini,
        jobs_fallback_scored: scoringStats.jobs_fallback_scored,
        used_fallback: isFallback,
      },
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error("[agent/adzuna] Discovery run failed:", err);

    if (runId) {
      await insforge.database
        .from("agent_runs")
        .update({
          status: "failed",
          error_message: errorMsg,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      await logAgentEvent(insforge, runId, userId, "error", `Discovery run failed: ${errorMsg}`);
    }

    return {
      success: false,
      runId,
      error: errorMsg,
    };
  }
}
