/**
 * Dashboard Analytics Engine for JobKhoj (Feature 17)
 * 
 * Aggregates user job discovery, match score distribution, and company research activity
 * with continuous zero-filling, deterministic UTC daily boundaries, and independent empty states.
 * Uses InsForge DB aggregation as the primary guaranteed path with an optional PostHog query adapter.
 */

export interface JobsOverTimeDataPoint {
  day: string;
  count: number;
}

export interface MatchDistributionDataPoint {
  range: string;
  count: number;
}

export interface ResearchActivityDataPoint {
  day: string;
  count: number;
}

export interface DashboardAnalyticsData {
  jobsOverTime: JobsOverTimeDataPoint[];
  matchDistribution: MatchDistributionDataPoint[];
  researchActivity: ResearchActivityDataPoint[];
  source: "insforge_db" | "posthog";
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Format a Date object to standardized "MMM D" (e.g. "Sep 13") in UTC
 */
export function formatUtcMmmD(date: Date): string {
  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

/**
 * Aggregates jobs discovered over the last N days (default 30),
 * zero-filling every consecutive calendar day in UTC.
 */
export function aggregateJobsOverTime(
  jobs: Array<{ found_at?: string | null }>,
  days = 30,
  referenceDate: Date = new Date()
): JobsOverTimeDataPoint[] {
  const buckets: { key: string; label: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const label = formatUtcMmmD(d);
    buckets.push({ key, label, count: 0 });
  }

  const bucketMap = new Map<string, number>();
  buckets.forEach((b, idx) => bucketMap.set(b.key, idx));

  for (const job of jobs) {
    if (!job.found_at) continue;
    try {
      const jobDateKey = new Date(job.found_at).toISOString().slice(0, 10);
      const idx = bucketMap.get(jobDateKey);
      if (idx !== undefined) {
        buckets[idx].count++;
      }
    } catch {
      // Ignore unparseable timestamps
    }
  }

  return buckets.map((b) => ({ day: b.label, count: b.count }));
}

/**
 * Groups jobs into 5 discrete match buckets:
 * 50-60%, 60-70%, 70-80%, 80-90%, 90-100%.
 * Jobs with match scores below 50% are intentionally filtered out.
 */
export function aggregateMatchDistribution(
  jobs: Array<{ match_score?: number | null }>
): MatchDistributionDataPoint[] {
  const buckets = [
    { range: "50-60%", count: 0 },
    { range: "60-70%", count: 0 },
    { range: "70-80%", count: 0 },
    { range: "80-90%", count: 0 },
    { range: "90-100%", count: 0 },
  ];

  for (const job of jobs) {
    if (job.match_score == null) continue;
    const score = Math.round(job.match_score);
    if (score < 50) continue; // Exclude low-relevance sub-50% noise

    if (score >= 90) {
      buckets[4].count++;
    } else if (score >= 80) {
      buckets[3].count++;
    } else if (score >= 70) {
      buckets[2].count++;
    } else if (score >= 60) {
      buckets[1].count++;
    } else if (score >= 50) {
      buckets[0].count++;
    }
  }

  return buckets.map((b) => ({ range: b.range, count: b.count }));
}

/**
 * Aggregates company research events over the last N days (default 7),
 * explicitly bucketed by `company_researched_at` in UTC.
 */
export function aggregateCompanyResearch(
  jobs: Array<{ company_research?: any; company_researched_at?: string | null }>,
  days = 7,
  referenceDate: Date = new Date()
): ResearchActivityDataPoint[] {
  const buckets: { key: string; label: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const label = formatUtcMmmD(d);
    buckets.push({ key, label, count: 0 });
  }

  const bucketMap = new Map<string, number>();
  buckets.forEach((b, idx) => bucketMap.set(b.key, idx));

  for (const job of jobs) {
    if (!job.company_research || !job.company_researched_at) continue;

    // Verify company_research is populated
    if (typeof job.company_research === "object") {
      if (Object.keys(job.company_research).length === 0) continue;
    }

    try {
      const researchDateKey = new Date(job.company_researched_at).toISOString().slice(0, 10);
      const idx = bucketMap.get(researchDateKey);
      if (idx !== undefined) {
        buckets[idx].count++;
      }
    } catch {
      // Ignore unparseable timestamps
    }
  }

  return buckets.map((b) => ({ day: b.label, count: b.count }));
}

/**
 * Optional PostHog Query API adapter.
 * Runs if POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID are configured.
 */
export async function fetchPostHogAnalytics(options: {
  apiKey: string;
  projectId: string;
  host: string;
  userId: string;
}): Promise<Omit<DashboardAnalyticsData, "source"> | null> {
  const { apiKey, projectId, host, userId } = options;

  // Example HogQL query via PostHog API
  const url = `${host.replace(/\/$/, "")}/api/projects/${projectId}/query/`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query: `SELECT event, timestamp, properties FROM events WHERE distinct_id = '${userId}' AND timestamp >= now() - INTERVAL 30 DAY LIMIT 500`,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`PostHog API returned status ${response.status}`);
  }

  const result = await response.json();
  if (!result || !Array.isArray(result.results)) {
    return null;
  }

  // Parse events into data points
  const jobFoundEvents: Array<{ found_at: string; match_score: number }> = [];
  const researchEvents: Array<{ company_research: boolean; company_researched_at: string }> = [];

  for (const row of result.results) {
    const [event, timestamp, propertiesRaw] = row;
    const props = typeof propertiesRaw === "string" ? JSON.parse(propertiesRaw) : propertiesRaw || {};

    if (event === "job_found") {
      jobFoundEvents.push({
        found_at: timestamp,
        match_score: typeof props.matchScore === "number" ? props.matchScore : null,
      });
    } else if (event === "company_researched") {
      researchEvents.push({
        company_research: true,
        company_researched_at: timestamp,
      });
    }
  }

  return {
    jobsOverTime: aggregateJobsOverTime(jobFoundEvents, 30),
    matchDistribution: aggregateMatchDistribution(jobFoundEvents),
    researchActivity: aggregateCompanyResearch(researchEvents, 7),
  };
}

/**
 * Main entrypoint for dashboard analytics:
 * Tries PostHog Query API first if personal read credentials exist,
 * otherwise deterministically aggregates from InsForge DB jobs.
 */
export async function getDashboardAnalytics(params: {
  userJobs: Array<{
    found_at?: string | null;
    match_score?: number | null;
    company_research?: any;
    company_researched_at?: string | null;
  }>;
  userId?: string;
}): Promise<DashboardAnalyticsData> {
  const { userJobs, userId } = params;

  const posthogApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const posthogProjectId = process.env.POSTHOG_PROJECT_ID;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (posthogApiKey && posthogProjectId && userId) {
    try {
      const posthogData = await fetchPostHogAnalytics({
        apiKey: posthogApiKey,
        projectId: posthogProjectId,
        host: posthogHost,
        userId,
      });
      if (posthogData) {
        return { ...posthogData, source: "posthog" };
      }
    } catch (err) {
      console.warn("[DashboardAnalytics] PostHog query failed, resolving via InsForge DB:", err);
    }
  }

  return {
    jobsOverTime: aggregateJobsOverTime(userJobs, 30),
    matchDistribution: aggregateMatchDistribution(userJobs),
    researchActivity: aggregateCompanyResearch(userJobs, 7),
    source: "insforge_db",
  };
}
