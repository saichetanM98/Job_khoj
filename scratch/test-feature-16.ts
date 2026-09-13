import { createClient } from "@insforge/sdk";
import fs from "fs";

function loadEnv() {
  const content = fs.readFileSync(".env.local", "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://weu5t78i.ap-southeast.insforge.app";
  const anonKey = process.env.NEXT_PUBLIC_INSFORON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;
  const client = createClient({ baseUrl, anonKey });

  const userId = "8ee14b46-0be1-4641-8372-1da3702f9f6d";

  const { data: runs, error: runsError } = await client.database
    .from("agent_runs")
    .select("id, job_title_searched, jobs_found, status, started_at, completed_at")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(10);

  console.log("Agent runs count:", runs?.length, "Error:", runsError);

  const { data: jobs, error: jobsError } = await client.database
    .from("jobs")
    .select("id, company, title, found_at, company_research")
    .eq("user_id", userId)
    .not("company_research", "is", null)
    .order("found_at", { ascending: false })
    .limit(10);

  console.log("Researched jobs count:", jobs?.length, "Error:", jobsError);
  console.log("Runs sample:", JSON.stringify(runs?.[0], null, 2));
  console.log("Jobs sample:", JSON.stringify(jobs?.[0], null, 2));
}

main().catch(console.error);
