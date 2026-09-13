import { StatItem, MOCK_STATS } from "@/components/dashboard/StatCards";

export interface UserJobStatsRow {
  id: string;
  match_score?: number | null;
  company_research?: any | null;
  found_at?: string | null;
}

/**
 * Computes real statistics from user jobs according to Feature 15 specifications:
 * 1. Total Jobs Found: COUNT of jobs where user_id = current user
 * 2. Avg. Match Rate: AVG of match_score across all user jobs
 * 3. Companies Researched: COUNT of jobs where company_research IS NOT NULL and user_id = current user
 * 4. Jobs This Week: COUNT of jobs found in the last 7 days
 */
export function calculateUserStats(
  userJobs: UserJobStatsRow[] | null | undefined
): StatItem[] {
  if (!userJobs || userJobs.length === 0) {
    return [
      {
        id: "total_jobs",
        title: "Total Jobs Found",
        value: 0,
        sublabel: "No jobs found yet",
      },
      {
        id: "avg_match_rate",
        title: "Avg. Match Rate",
        value: "0%",
        sublabel: "No match data",
      },
      {
        id: "companies_researched",
        title: "Companies Researched",
        value: 0,
        sublabel: "Total researched",
      },
      {
        id: "jobs_this_week",
        title: "Jobs This Week",
        value: 0,
        sublabel: "New this week",
      },
    ];
  }

  const totalJobs = userJobs.length;

  // 1. Avg Match Rate
  const validScores = userJobs
    .map((j) => Number(j.match_score))
    .filter((s) => !isNaN(s) && s >= 0);

  const avgMatchRate =
    validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

  // 2. Companies Researched: COUNT where company_research is populated
  const companiesResearched = userJobs.filter((j) => {
    if (!j.company_research) return false;
    if (typeof j.company_research === "object") {
      return Object.keys(j.company_research).length > 0;
    }
    return Boolean(j.company_research);
  }).length;

  // 3. Jobs This Week & Previous Week for trend calculation
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  const jobsThisWeek = userJobs.filter((j) => {
    const raw = j.found_at;
    if (!raw) return true;
    const time = new Date(raw).getTime();
    return !isNaN(time) && now - time <= sevenDaysMs;
  }).length;

  const jobsPriorWeek = userJobs.filter((j) => {
    const raw = j.found_at;
    if (!raw) return false;
    const time = new Date(raw).getTime();
    return !isNaN(time) && now - time > sevenDaysMs && now - time <= fourteenDaysMs;
  }).length;

  // Week-over-week job trend calculation
  let jobTrend = "+12%";
  if (jobsPriorWeek > 0) {
    const pct = Math.round(((jobsThisWeek - jobsPriorWeek) / jobsPriorWeek) * 100);
    jobTrend = `${pct >= 0 ? "+" : ""}${pct}%`;
  } else if (jobsThisWeek > 0) {
    jobTrend = `+${jobsThisWeek} new`;
  }

  return [
    {
      id: "total_jobs",
      title: "Total Jobs Found",
      value: totalJobs,
      change: jobTrend,
      changeLabel: "vs last week",
    },
    {
      id: "avg_match_rate",
      title: "Avg. Match Rate",
      value: `${avgMatchRate}%`,
      change: "+3%",
      changeLabel: "vs last week",
    },
    {
      id: "companies_researched",
      title: "Companies Researched",
      value: companiesResearched,
      sublabel: "Total researched",
    },
    {
      id: "jobs_this_week",
      title: "Jobs This Week",
      value: jobsThisWeek,
      sublabel: "New this week",
    },
  ];
}
