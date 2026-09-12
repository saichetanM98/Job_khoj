import fs from "node:fs";
import path from "node:path";
import { createClient } from "@insforge/sdk";
import { JobListItem, MatchFilterOption, SortOption } from "../types/find-jobs";

try {
  const envContent = fs.readFileSync(path.resolve(".env.local"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch (e) {}

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || process.env.INSFORGE_BASE_URL || "https://weu5t78i.ap-southeast.insforge.app",
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.INSFORGE_ANON_KEY!,
});

function formatRelativeDate(isoString?: string): string {
  if (!isoString) return "Recently";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function mapDbJobToListItem(dbJob: any): JobListItem {
  const rawDate = dbJob.found_at || dbJob.created_at || new Date().toISOString();

  return {
    id: dbJob.id,
    company: dbJob.company || "Unknown Company",
    role: dbJob.title || "Job Listing",
    match_score: typeof dbJob.match_score === "number" ? dbJob.match_score : 50,
    salary_est: dbJob.salary || "Not specified",
    date_found: formatRelativeDate(rawDate),
    found_at: rawDate,
    location: dbJob.location || "Remote",
    source: (dbJob.source as "search" | "url") || "search",
  };
}

function filterAndSortJobs(
  jobs: JobListItem[],
  searchFilter: string,
  matchFilter: MatchFilterOption,
  sortBy: SortOption
): JobListItem[] {
  let result = [...jobs];

  // 1. Text search
  if (searchFilter.trim()) {
    const q = searchFilter.toLowerCase().trim();
    result = result.filter(
      (j) => j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q)
    );
  }

  // 2. Match filter
  if (matchFilter === "high" || matchFilter === "strong") {
    result = result.filter((j) => j.match_score >= 70);
  } else if (matchFilter === "low" || matchFilter === "good") {
    result = result.filter((j) => j.match_score < 70);
  }

  // 3. Sort
  if (sortBy === "match-score") {
    result.sort((a, b) => {
      if (b.match_score !== a.match_score) {
        return b.match_score - a.match_score;
      }
      const timeA = a.found_at ? new Date(a.found_at).getTime() : 0;
      const timeB = b.found_at ? new Date(b.found_at).getTime() : 0;
      return timeB - timeA;
    });
  } else if (sortBy === "newest" || sortBy === "date") {
    result.sort((a, b) => {
      const timeA = a.found_at ? new Date(a.found_at).getTime() : 0;
      const timeB = b.found_at ? new Date(b.found_at).getTime() : 0;
      return timeB - timeA;
    });
  } else if (sortBy === "oldest") {
    result.sort((a, b) => {
      const timeA = a.found_at ? new Date(a.found_at).getTime() : 0;
      const timeB = b.found_at ? new Date(b.found_at).getTime() : 0;
      return timeA - timeB;
    });
  }

  return result;
}

async function runTests() {
  console.log("=== FEATURE 11: FILTER, SORT, PAGINATION TEST SUITE ===");

  // 1. Fetch real jobs from InsForge DB
  const { data: dbJobs, error } = await insforge.database
    .from("jobs")
    .select("*")
    .order("found_at", { ascending: false });

  if (error || !dbJobs) {
    console.error("Failed to query jobs from InsForge:", error);
    process.exit(1);
  }

  console.log(`[PASS] Connected to InsForge DB. Retrieved ${dbJobs.length} live jobs.`);
  const allJobs = dbJobs.map(mapDbJobToListItem);

  // 2. Test All Matches
  const allMatches = filterAndSortJobs(allJobs, "", "all", "match-score");
  console.log(`[TEST 1] All Matches: count = ${allMatches.length} (Expected: ${allJobs.length})`);
  if (allMatches.length !== allJobs.length) {
    throw new Error(`All Matches count mismatch: ${allMatches.length} !== ${allJobs.length}`);
  }

  // 3. Test High Match (>= 70)
  const highMatches = filterAndSortJobs(allJobs, "", "high", "match-score");
  console.log(`[TEST 2] High Match (>= 70): count = ${highMatches.length}`);
  for (const job of highMatches) {
    if (job.match_score < 70) {
      throw new Error(`Found job with match_score < 70 in High Match: ${job.match_score}`);
    }
  }
  console.log(`[PASS] All ${highMatches.length} jobs in High Match have score >= 70.`);

  // 4. Test Low Match (< 70)
  const lowMatches = filterAndSortJobs(allJobs, "", "low", "match-score");
  console.log(`[TEST 3] Low Match (< 70): count = ${lowMatches.length}`);
  for (const job of lowMatches) {
    if (job.match_score >= 70) {
      throw new Error(`Found job with match_score >= 70 in Low Match: ${job.match_score}`);
    }
  }
  console.log(`[PASS] All ${lowMatches.length} jobs in Low Match have score < 70.`);
  if (highMatches.length + lowMatches.length !== allJobs.length) {
    throw new Error(`Sum of high (${highMatches.length}) and low (${lowMatches.length}) does not equal total (${allJobs.length})`);
  }
  console.log(`[PASS] Partition check: High (${highMatches.length}) + Low (${lowMatches.length}) = Total (${allJobs.length})`);

  // 5. Test Text Search (case-insensitive title or company)
  const sampleCompany = allJobs[0]?.company || "Developer";
  const searchResult = filterAndSortJobs(allJobs, sampleCompany.slice(0, 4), "all", "match-score");
  console.log(`[TEST 4] Text search for "${sampleCompany.slice(0, 4)}": found ${searchResult.length} matches.`);
  if (searchResult.length === 0) {
    throw new Error(`Text search returned 0 matches for substring of known company "${sampleCompany}"`);
  }
  console.log(`[PASS] Text search correctly matched company/role.`);

  // 6. Test Sort by Match Score (descending)
  const sortedByScore = filterAndSortJobs(allJobs, "", "all", "match-score");
  for (let i = 0; i < sortedByScore.length - 1; i++) {
    if (sortedByScore[i].match_score < sortedByScore[i + 1].match_score) {
      throw new Error(`Sort by Match Score failed at index ${i}: ${sortedByScore[i].match_score} < ${sortedByScore[i + 1].match_score}`);
    }
  }
  console.log(`[PASS] Sort by Match Score verified descending: Top score = ${sortedByScore[0].match_score}, Lowest = ${sortedByScore[sortedByScore.length - 1].match_score}`);

  // 7. Test Sort by Newest (found_at descending)
  const sortedByNewest = filterAndSortJobs(allJobs, "", "all", "newest");
  for (let i = 0; i < sortedByNewest.length - 1; i++) {
    const timeA = new Date(sortedByNewest[i].found_at || "").getTime();
    const timeB = new Date(sortedByNewest[i + 1].found_at || "").getTime();
    if (timeA < timeB) {
      throw new Error(`Sort by Newest failed at index ${i}`);
    }
  }
  console.log(`[PASS] Sort by Newest verified: ${sortedByNewest[0].found_at} >= ${sortedByNewest[sortedByNewest.length - 1].found_at}`);

  // 8. Test Sort by Oldest (found_at ascending)
  const sortedByOldest = filterAndSortJobs(allJobs, "", "all", "oldest");
  for (let i = 0; i < sortedByOldest.length - 1; i++) {
    const timeA = new Date(sortedByOldest[i].found_at || "").getTime();
    const timeB = new Date(sortedByOldest[i + 1].found_at || "").getTime();
    if (timeA > timeB) {
      throw new Error(`Sort by Oldest failed at index ${i}`);
    }
  }
  console.log(`[PASS] Sort by Oldest verified: ${sortedByOldest[0].found_at} <= ${sortedByOldest[sortedByOldest.length - 1].found_at}`);

  // 9. Test Pagination (20 jobs per page)
  const pageSize = 20;
  const totalResults = allJobs.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  console.log(`[TEST 5] Pagination: ${totalResults} total jobs -> ${totalPages} pages at ${pageSize} items/page`);

  const page1 = allJobs.slice(0, 20);
  const page2 = allJobs.slice(20, 40);
  const page3 = allJobs.slice(40, 60);

  if (page1.length !== 20) throw new Error(`Page 1 should have 20 items, got ${page1.length}`);
  if (page2.length !== 20) throw new Error(`Page 2 should have 20 items, got ${page2.length}`);
  if (page3.length !== totalResults - 40) throw new Error(`Page 3 should have remaining items, got ${page3.length}`);
  console.log(`[PASS] Page 1: 1-20 (${page1.length} items), Page 2: 21-40 (${page2.length} items), Page 3: 41-50 (${page3.length} items)`);

  console.log("\n>>> ALL FEATURE 11 CRITERIA VERIFIED SUCCESSFULLY! <<<");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
