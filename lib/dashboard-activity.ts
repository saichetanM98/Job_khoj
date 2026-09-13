import { ActivityItem } from "@/components/dashboard/RecentActivityCard";

export interface AgentRunActivityRow {
  id: string;
  job_title_searched?: string | null;
  jobs_found?: number | null;
  status?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface JobResearchActivityRow {
  id: string;
  company?: string | null;
  title?: string | null;
  found_at?: string | null;
  company_research?: any | null;
}

/**
 * Formats an ISO date string into a relative human-readable string
 * e.g. "Just now", "10 mins ago", "2 hours ago", "Yesterday", "3 days ago", "Sep 10"
 */
export function formatActivityTime(isoDateString?: string | null): string {
  if (!isoDateString) return "Recently";
  const d = new Date(isoDateString);
  const time = d.getTime();
  if (isNaN(time)) return "Recently";

  const now = Date.now();
  const diffMs = Math.max(0, now - time);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ActivityWithTime extends ActivityItem {
  rawTime: number;
}

/**
 * Merges agent runs and company research entries into a unified, chronologically
 * sorted activity timeline for the dashboard.
 *
 * Requirements (Feature 16):
 * - Query agent_runs table — most recent runs for current user
 * - Query jobs table — most recent company research entries for current user
 * - Merge and sort all by timestamp descending — take last 5-10 entries
 * - Format each into human readable string:
 *   - agent_run completed → "Found X jobs for [jobTitle] — [time ago]"
 *   - company_research populated → "Researched [company] — [time ago]"
 * - Color coded dot per entry type — info blue / purple, success green
 */
export function buildUserActivities(
  agentRuns: AgentRunActivityRow[] | null | undefined,
  researchedJobs: JobResearchActivityRow[] | null | undefined,
  limit: number = 8
): ActivityItem[] {
  const merged: ActivityWithTime[] = [];

  // 1. Process Agent Runs
  if (agentRuns && Array.isArray(agentRuns)) {
    for (const run of agentRuns) {
      if (!run || !run.id) continue;
      const rawIso = run.completed_at || run.started_at;
      const rawTime = rawIso ? new Date(rawIso).getTime() : 0;
      const titleSearched = (run.job_title_searched || "Engineering").trim();
      const count = typeof run.jobs_found === "number" ? run.jobs_found : 0;

      let title = "";
      let dotColor: ActivityItem["dotColor"] = "blue";

      if (run.status === "failed") {
        title = `Search failed for ${titleSearched}`;
        dotColor = "blue";
      } else if (run.status === "running") {
        title = `Searching jobs for ${titleSearched}...`;
        dotColor = "blue";
      } else {
        if (count > 0) {
          title = `Found ${count} job${count === 1 ? "" : "s"} for ${titleSearched}`;
          dotColor = "purple";
        } else {
          title = `Searched for ${titleSearched}`;
          dotColor = "blue";
        }
      }

      merged.push({
        id: `run-${run.id}`,
        title,
        timestamp: formatActivityTime(rawIso),
        dotColor,
        rawTime,
      });
    }
  }

  // 2. Process Researched Jobs
  if (researchedJobs && Array.isArray(researchedJobs)) {
    for (const job of researchedJobs) {
      if (!job || !job.id) continue;
      if (!job.company_research) continue;

      // Ensure company_research is populated
      if (
        typeof job.company_research === "object" &&
        Object.keys(job.company_research).length === 0
      ) {
        continue;
      }

      const rawIso = job.company_research?.researched_at || job.found_at;
      const rawTime = rawIso ? new Date(rawIso).getTime() : 0;
      const company = (job.company || job.title || "Company").trim();

      merged.push({
        id: `research-${job.id}`,
        title: `Researched ${company}`,
        timestamp: formatActivityTime(rawIso),
        dotColor: "green",
        rawTime,
      });
    }
  }

  // 3. Sort descending by timestamp (newest first)
  merged.sort((a, b) => b.rawTime - a.rawTime);

  // 4. Return top entries stripped of internal rawTime property
  return merged.slice(0, limit).map(({ rawTime, ...rest }) => rest);
}
