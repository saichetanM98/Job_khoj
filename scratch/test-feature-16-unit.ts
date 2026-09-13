import {
  buildUserActivities,
  formatActivityTime,
  AgentRunActivityRow,
  JobResearchActivityRow,
} from "../lib/dashboard-activity";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log("=== Testing Feature 16: buildUserActivities ===");

// 1. Empty / null input handling
const emptyResult1 = buildUserActivities(null, null);
assert(Array.isArray(emptyResult1) && emptyResult1.length === 0, "Null inputs should return empty array");

const emptyResult2 = buildUserActivities([], []);
assert(Array.isArray(emptyResult2) && emptyResult2.length === 0, "Empty inputs should return empty array");

// 2. Singular vs plural & status handling for agent_runs
const mockRuns: AgentRunActivityRow[] = [
  {
    id: "run-1",
    job_title_searched: "Frontend Engineer",
    jobs_found: 1,
    status: "completed",
    started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "run-2",
    job_title_searched: "Full Stack Engineer",
    jobs_found: 0,
    status: "completed",
    started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "run-3",
    job_title_searched: "DevOps Engineer",
    jobs_found: 0,
    status: "failed",
    started_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "run-4",
    job_title_searched: "Data Scientist",
    jobs_found: 5,
    status: "completed",
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const mockResearchedJobs: JobResearchActivityRow[] = [
  {
    id: "job-1",
    company: "Google",
    found_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    company_research: { companyOverview: "Tech company" },
  },
  {
    id: "job-2",
    company: "Stripe",
    found_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    company_research: { companyOverview: "Fintech company" },
  },
  {
    id: "job-3",
    company: "Ignored Company",
    found_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    company_research: null, // Should be ignored
  },
];

const activities = buildUserActivities(mockRuns, mockResearchedJobs, 10);

console.log("Generated activities count:", activities.length);
activities.forEach((act, idx) => {
  console.log(`[${idx + 1}] ${act.dotColor.toUpperCase()} | ${act.title} — ${act.timestamp}`);
});

// Assertions
assert(activities.length === 6, `Expected 6 activities, got ${activities.length}`);

// First should be run-1 (4 mins ago) -> "Found 1 job for Frontend Engineer" (singular!)
assert(activities[0].title === "Found 1 job for Frontend Engineer", "Singular job text mismatch");
assert(activities[0].dotColor === "purple", "Job found run should have purple dot");

// Second should be job-1 (10 mins ago) -> "Researched Google"
assert(activities[1].title === "Researched Google", "Researched company title mismatch");
assert(activities[1].dotColor === "green", "Company research should have green dot");

// Third should be run-2 (30 mins ago) -> "Searched for Full Stack Engineer"
assert(activities[2].title === "Searched for Full Stack Engineer", "0 jobs searched title mismatch");
assert(activities[2].dotColor === "blue", "0 jobs searched should have blue dot");

// Fourth should be run-3 (60 mins ago) -> "Search failed for DevOps Engineer"
assert(activities[3].title === "Search failed for DevOps Engineer", "Failed run title mismatch");
assert(activities[3].dotColor === "blue", "Failed run should have blue dot");

// Fifth should be job-2 (90 mins ago) -> "Researched Stripe"
assert(activities[4].title === "Researched Stripe", "Researched Stripe title mismatch");
assert(activities[4].dotColor === "green", "Company research should have green dot");

// Sixth should be run-4 (120 mins ago) -> "Found 5 jobs for Data Scientist" (plural)
assert(activities[5].title === "Found 5 jobs for Data Scientist", "Plural jobs title mismatch");
assert(activities[5].dotColor === "purple", "Job found run should have purple dot");

// Test limit truncation
const limited = buildUserActivities(mockRuns, mockResearchedJobs, 3);
assert(limited.length === 3, `Limit 3 should return 3 items, got ${limited.length}`);

console.log("\n✅ All Feature 16 unit tests passed successfully!");
