import { createClient } from "@insforge/sdk";
import fs from "fs";

function loadEnv() {
  const content = fs.readFileSync(".env.local", "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > -1) {
        process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
}

loadEnv();

interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  dotColor: "purple" | "blue" | "green";
  rawTime: number;
}

function formatRelativeTime(isoDateString?: string | null): string {
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

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;
  const client = createClient({ baseUrl, anonKey });
  const userId = "8ee14b46-0be1-4641-8372-1da3702f9f6d";

  const [runsRes, jobsRes] = await Promise.all([
    client.database
      .from("agent_runs")
      .select("id, job_title_searched, jobs_found, status, started_at, completed_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(10),
    client.database
      .from("jobs")
      .select("id, company, title, found_at, company_research")
      .eq("user_id", userId)
      .not("company_research", "is", null)
      .order("found_at", { ascending: false })
      .limit(10),
  ]);

  const rawActivities: ActivityItem[] = [];

  for (const run of runsRes.data || []) {
    const rawIso = run.completed_at || run.started_at;
    const timeMs = rawIso ? new Date(rawIso).getTime() : 0;
    const titleSearched = run.job_title_searched || "jobs";
    const count = run.jobs_found ?? 0;

    let title = "";
    let dotColor: "purple" | "blue" | "green" = "blue";

    if (run.status === "failed") {
      title = `Search failed for ${titleSearched}`;
      dotColor = "blue";
    } else if (run.status === "running") {
      title = `Searching jobs for ${titleSearched}`;
      dotColor = "blue";
    } else {
      title = count > 0 ? `Found ${count} jobs for ${titleSearched}` : `Searched for ${titleSearched}`;
      dotColor = count > 0 ? "purple" : "blue";
    }

    rawActivities.push({
      id: `run-${run.id}`,
      title,
      timestamp: formatRelativeTime(rawIso),
      dotColor,
      rawTime: timeMs,
    });
  }

  for (const job of jobsRes.data || []) {
    if (!job.company_research) continue;
    const rawIso = job.company_research?.researched_at || job.found_at;
    const timeMs = rawIso ? new Date(rawIso).getTime() : 0;
    const company = job.company || "company";

    rawActivities.push({
      id: `research-${job.id}`,
      title: `Researched ${company}`,
      timestamp: formatRelativeTime(rawIso),
      dotColor: "green",
      rawTime: timeMs,
    });
  }

  rawActivities.sort((a, b) => b.rawTime - a.rawTime);
  const activities = rawActivities.slice(0, 8).map(({ rawTime, ...rest }) => rest);

  console.log("Merged Real Activities (Top 8):");
  console.dir(activities, { depth: null });
}

main().catch(console.error);
