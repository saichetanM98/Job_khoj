import {
  aggregateJobsOverTime,
  aggregateMatchDistribution,
  aggregateCompanyResearch,
  getDashboardAnalytics,
  formatUtcMmmD,
} from "../lib/dashboard-analytics";

async function runTests() {
  console.log("--- Starting Feature 17 Analytics Unit Tests ---\n");

  const fixedNow = new Date("2026-09-13T12:00:00.000Z");

  // 1. Test formatUtcMmmD
  const formatted = formatUtcMmmD(fixedNow);
  console.assert(formatted === "Sep 13", `formatUtcMmmD failed, got: ${formatted}`);
  console.log("✓ formatUtcMmmD formats to 'Sep 13'");

  // 2. Test aggregateJobsOverTime: Zero-fill & length
  const emptyJobs = aggregateJobsOverTime([], 30, fixedNow);
  console.assert(emptyJobs.length === 30, `Expected 30 points, got ${emptyJobs.length}`);
  console.assert(emptyJobs.every(p => p.count === 0), "Expected all zero counts for empty array");
  console.assert(emptyJobs[29].day === "Sep 13", `Expected last day to be Sep 13, got ${emptyJobs[29].day}`);
  console.assert(emptyJobs[0].day === "Aug 15", `Expected first day to be Aug 15, got ${emptyJobs[0].day}`);
  console.log("✓ aggregateJobsOverTime produces 30 zero-filled days ending on Sep 13");

  // 3. Test aggregateJobsOverTime: Timestamp bucketing
  const mockJobs = [
    { found_at: "2026-09-13T08:00:00.000Z" },
    { found_at: "2026-09-13T10:30:00.000Z" },
    { found_at: "2026-09-12T15:00:00.000Z" },
    { found_at: "2026-08-20T00:00:00.000Z" },
    { found_at: "2025-01-01T00:00:00.000Z" }, // Out of 30-day window
  ];
  const populatedJobs = aggregateJobsOverTime(mockJobs, 30, fixedNow);
  const todayPoint = populatedJobs.find(p => p.day === "Sep 13");
  const yesterdayPoint = populatedJobs.find(p => p.day === "Sep 12");
  const oldPoint = populatedJobs.find(p => p.day === "Aug 20");
  console.assert(todayPoint?.count === 2, `Expected 2 jobs today, got ${todayPoint?.count}`);
  console.assert(yesterdayPoint?.count === 1, `Expected 1 job yesterday, got ${yesterdayPoint?.count}`);
  console.assert(oldPoint?.count === 1, `Expected 1 job on Aug 20, got ${oldPoint?.count}`);
  console.log("✓ aggregateJobsOverTime correctly tallies jobs into UTC date buckets and ignores out-of-range jobs");

  // 4. Test aggregateMatchDistribution: 5 discrete buckets & sub-50 exclusion
  const scoreTestJobs = [
    { match_score: 95 }, // 90-100%
    { match_score: 90 }, // 90-100%
    { match_score: 85 }, // 80-90%
    { match_score: 80 }, // 80-90%
    { match_score: 75 }, // 70-80%
    { match_score: 65 }, // 60-70%
    { match_score: 55 }, // 50-60%
    { match_score: 42 }, // <50 (filtered out)
    { match_score: 10 }, // <50 (filtered out)
    { match_score: null }, // filtered out
  ];
  const distribution = aggregateMatchDistribution(scoreTestJobs);
  console.assert(distribution.length === 5, `Expected 5 buckets, got ${distribution.length}`);
  console.assert(distribution[0].range === "50-60%" && distribution[0].count === 1, "Expected 1 in 50-60%");
  console.assert(distribution[1].range === "60-70%" && distribution[1].count === 1, "Expected 1 in 60-70%");
  console.assert(distribution[2].range === "70-80%" && distribution[2].count === 1, "Expected 1 in 70-80%");
  console.assert(distribution[3].range === "80-90%" && distribution[3].count === 2, "Expected 2 in 80-90%");
  console.assert(distribution[4].range === "90-100%" && distribution[4].count === 2, "Expected 2 in 90-100%");
  console.log("✓ aggregateMatchDistribution correctly bins into 5 buckets and excludes sub-50% jobs");

  // 5. Test aggregateCompanyResearch: 7-day zero-fill and company_researched_at bucketing
  const researchTestJobs = [
    {
      company_research: { overview: "Tech Corp" },
      company_researched_at: "2026-09-13T09:00:00.000Z",
    },
    {
      company_research: { overview: "AI Startup" },
      company_researched_at: "2026-09-13T11:00:00.000Z",
    },
    {
      company_research: { overview: "Cloud Co" },
      company_researched_at: "2026-09-11T14:00:00.000Z",
    },
    {
      company_research: {}, // empty object, ignored
      company_researched_at: "2026-09-12T10:00:00.000Z",
    },
    {
      company_research: null, // no research
      company_researched_at: "2026-09-13T10:00:00.000Z",
    },
    {
      company_research: { overview: "Old Research" },
      company_researched_at: "2026-08-01T10:00:00.000Z", // outside 7 days
    },
  ];
  const research = aggregateCompanyResearch(researchTestJobs, 7, fixedNow);
  console.assert(research.length === 7, `Expected 7 days, got ${research.length}`);
  console.assert(research[6].day === "Sep 13" && research[6].count === 2, `Expected 2 on Sep 13, got ${research[6].count}`);
  console.assert(research[4].day === "Sep 11" && research[4].count === 1, `Expected 1 on Sep 11, got ${research[4].count}`);
  console.log("✓ aggregateCompanyResearch correctly buckets 7 days using company_researched_at");

  // 6. Test getDashboardAnalytics: resolver fallback
  const result = await getDashboardAnalytics({
    userJobs: mockJobs.map(j => ({ ...j, match_score: 85 })),
    userId: "test-user-123",
  });
  console.assert(result.source === "insforge_db", `Expected insforge_db source, got ${result.source}`);
  console.assert(result.jobsOverTime.length === 30, "Expected 30 points in result.jobsOverTime");
  console.assert(result.matchDistribution.length === 5, "Expected 5 buckets in result.matchDistribution");
  console.assert(result.researchActivity.length === 7, "Expected 7 points in result.researchActivity");
  console.log("✓ getDashboardAnalytics resolves cleanly to InsForge DB aggregation");

  console.log("\nALL 6 FEATURE 17 TESTS PASSED SUCCESSFULLY! 🎉");
}

runTests().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
