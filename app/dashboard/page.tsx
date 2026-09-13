import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/Navbar";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { UserProfile } from "@/types";
import { calculateUserStats, UserJobStatsRow } from "@/lib/dashboard-stats";
import {
  buildUserActivities,
  AgentRunActivityRow,
  JobResearchActivityRow,
} from "@/lib/dashboard-activity";
import { getDashboardAnalytics } from "@/lib/dashboard-analytics";

export const metadata = {
  title: "Dashboard | JobKhoj",
  description: "Your JobKhoj job search and AI research analytics dashboard.",
};

function calculateProfileCompleteness(profile: Partial<UserProfile> | null, userEmail?: string) {
  const missing: string[] = [];

  const hasName = Boolean(profile?.full_name && profile.full_name.trim().length > 0);
  const hasEmail = Boolean((profile?.email && profile.email.trim().length > 0) || userEmail);
  const hasTitle = Boolean(profile?.current_title && profile.current_title.trim().length > 0);
  const hasExpLevel = Boolean(profile?.experience_level && profile.experience_level.trim().length > 0);
  const hasSkills = Boolean(profile?.skills && profile.skills.length > 0);
  const hasWorkExp = Boolean(profile?.work_experience && profile.work_experience.length > 0);
  const hasDegree = Boolean(profile?.education?.highest_degree);

  const hasPhone = Boolean(profile?.phone && profile.phone.trim().length > 0);
  const hasLocation = Boolean(profile?.location && profile.location.trim().length > 0);
  const hasEducationDetails = Boolean(
    profile?.education?.institution &&
    profile?.education?.institution.trim().length > 0 &&
    profile?.education?.graduation_year &&
    profile?.education?.graduation_year.trim().length > 0
  );

  if (!hasPhone) missing.push("PHONE");
  if (!hasLocation) missing.push("LOCATION");
  if (!hasEducationDetails) missing.push("EDUCATION");

  let score = 0;
  if (hasName) score += 1;
  if (hasEmail) score += 1;
  if (hasTitle) score += 1;
  if (hasExpLevel) score += 1;
  if (hasSkills) score += 1;
  if (hasWorkExp) score += 1;
  if (hasDegree) score += 1;
  if (hasPhone) score += 1;
  if (hasLocation) score += 1;
  if (hasEducationDetails) score += 1;

  const percentage = Math.min(100, Math.max(0, Math.round((score / 10) * 100)));

  return { percentage, missing };
}

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  if (!user) {
    redirect("/login");
  }

  // Execute database queries in parallel for peak performance
  let profile: UserProfile | null = null;
  let userJobs: (UserJobStatsRow & JobResearchActivityRow & { company_researched_at?: string | null })[] = [];
  let agentRuns: AgentRunActivityRow[] = [];

  try {
    const [profileRes, jobsRes, runsRes] = await Promise.all([
      insforge.database
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(),
      insforge.database
        .from("jobs")
        .select("id, company, title, match_score, company_research, company_researched_at, found_at")
        .eq("user_id", user.id),
      insforge.database
        .from("agent_runs")
        .select("id, job_title_searched, jobs_found, status, started_at, completed_at")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(10),
    ]);

    if (profileRes.error) {
      console.error("[Dashboard] Error fetching profile:", profileRes.error);
    } else if (profileRes.data) {
      profile = profileRes.data as UserProfile;
    }

    if (jobsRes.error) {
      console.error("[Dashboard] Error fetching jobs:", jobsRes.error);
    } else if (jobsRes.data) {
      userJobs = jobsRes.data as (UserJobStatsRow & JobResearchActivityRow & { company_researched_at?: string | null })[];
    }

    if (runsRes.error) {
      console.error("[Dashboard] Error fetching agent runs:", runsRes.error);
    } else if (runsRes.data) {
      agentRuns = runsRes.data as AgentRunActivityRow[];
    }
  } catch (err) {
    console.error("[Dashboard] Exception fetching dashboard data:", err);
  }

  // Feature 14 & 15: Completeness & Real Stats
  const completeness = calculateProfileCompleteness(profile, user.email);
  const stats = calculateUserStats(userJobs);

  // Feature 16: Merge agent runs & company research into real activity feed
  const researchedJobs = userJobs.filter((j) => {
    if (!j.company_research) return false;
    if (typeof j.company_research === "object") {
      return Object.keys(j.company_research).length > 0;
    }
    return Boolean(j.company_research);
  });
  const activities = buildUserActivities(agentRuns, researchedJobs, 8);

  // Feature 17: Analytics Charts (Jobs Found Over Time, Match Distribution, Research Activity)
  const analytics = await getDashboardAnalytics({
    userJobs,
    userId: user.id,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} activePath="/dashboard" />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-[1440px] mx-auto w-full">
        <DashboardClient
          completeness={completeness}
          stats={stats}
          activities={activities}
          jobsOverTime={analytics.jobsOverTime}
          matchDistribution={analytics.matchDistribution}
          researchActivity={analytics.researchActivity}
        />
      </main>
    </div>
  );
}
