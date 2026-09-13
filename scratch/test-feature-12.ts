import {
  DEMO_JOB_DETAILS,
  formatRelativeDate,
  mapDbJobToJobDetails,
} from "../types/job-details";

function runTests() {
  console.log("=== Running Feature 12 Validation Tests ===");

  // Test 1: Verify DEMO_JOB_DETAILS fields match job-details.png specification
  console.log("\n[Test 1] Validating DEMO_JOB_DETAILS matches job-details.png spec...");
  if (DEMO_JOB_DETAILS.title !== "Backend Developer") {
    throw new Error(`Expected title 'Backend Developer', got '${DEMO_JOB_DETAILS.title}'`);
  }
  if (DEMO_JOB_DETAILS.company !== "Insight Global") {
    throw new Error(`Expected company 'Insight Global', got '${DEMO_JOB_DETAILS.company}'`);
  }
  if (DEMO_JOB_DETAILS.match_score !== 85) {
    throw new Error(`Expected match_score 85, got ${DEMO_JOB_DETAILS.match_score}`);
  }
  if (DEMO_JOB_DETAILS.salary !== "$101k – $101k") {
    throw new Error(`Expected salary '$101k – $101k', got '${DEMO_JOB_DETAILS.salary}'`);
  }
  if (DEMO_JOB_DETAILS.matched_skills.length !== 5) {
    throw new Error(`Expected 5 matched skills, got ${DEMO_JOB_DETAILS.matched_skills.length}`);
  }
  if (!DEMO_JOB_DETAILS.missing_skills.includes("Java (Spring Boot)")) {
    throw new Error("Missing skill 'Java (Spring Boot)' not found in DEMO_JOB_DETAILS");
  }
  console.log("✓ Test 1 Passed: DEMO_JOB_DETAILS accurately replicates job-details.png");

  // Test 2: Date formatting helper
  console.log("\n[Test 2] Validating formatRelativeDate helper...");
  const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  const res1 = formatRelativeDate(oneHourAgo);
  if (!res1.includes("hour")) {
    throw new Error(`Expected relative hours string, got '${res1}'`);
  }

  const yesterday = new Date(Date.now() - 86400 * 1000 * 1.5).toISOString();
  const res2 = formatRelativeDate(yesterday);
  if (res2 !== "Yesterday") {
    throw new Error(`Expected 'Yesterday', got '${res2}'`);
  }
  console.log("✓ Test 2 Passed: Date formatting operates as expected");

  // Test 3: DB Job to JobDetails mapping
  console.log("\n[Test 3] Validating mapDbJobToJobDetails with DB mock record...");
  const sampleDbRecord = {
    id: "test-uuid-1234",
    title: "Full Stack Engineer",
    company: "Acme Corp",
    match_score: 92,
    salary: "$140k - $180k",
    location: "Austin, TX",
    job_type: "fulltime",
    about_role: "We are seeking a talented full stack engineer.",
    match_reason: "High skill overlap with React and TypeScript.",
    matched_skills: ["React", "TypeScript", "Node.js"],
    missing_skills: ["GraphQL"],
    external_apply_url: "https://example.com/apply",
    source_url: "https://example.com/job",
    found_at: new Date().toISOString(),
  };

  const mapped = mapDbJobToJobDetails(sampleDbRecord);
  if (mapped.id !== "test-uuid-1234") throw new Error("ID mapping failed");
  if (mapped.title !== "Full Stack Engineer") throw new Error("Title mapping failed");
  if (mapped.company !== "Acme Corp") throw new Error("Company mapping failed");
  if (mapped.match_score !== 92) throw new Error("Match score mapping failed");
  if (mapped.salary !== "$140k - $180k") throw new Error("Salary mapping failed");
  if (mapped.location !== "Austin, TX") throw new Error("Location mapping failed");
  if (mapped.matched_skills.length !== 3) throw new Error("Matched skills count failed");
  if (mapped.missing_skills.length !== 1) throw new Error("Missing skills count failed");
  console.log("✓ Test 3 Passed: DB record mapping correctly parsed all fields");

  // Test 4: Handles missing/null fields gracefully
  console.log("\n[Test 4] Validating mapDbJobToJobDetails with empty/null DB record...");
  const emptyRecord = {
    id: "empty-uuid",
  };
  const mappedEmpty = mapDbJobToJobDetails(emptyRecord);
  if (!mappedEmpty.salary) throw new Error("Default salary failed");
  if (mappedEmpty.job_type !== "—") throw new Error("Default job_type expected '—'");
  if (mappedEmpty.matched_skills.length === 0) throw new Error("Default matched_skills failed");
  console.log("✓ Test 4 Passed: Graceful fallback for empty/partial records");

  // Test 5: Description complete sentence & length threshold
  console.log("\n[Test 5] Validating description completeness & expansion threshold...");
  if (!DEMO_JOB_DETAILS.about_role.endsWith("workplaces for all employees.")) {
    throw new Error("Expected DEMO_JOB_DETAILS about_role to end with complete sentence.");
  }
  if (DEMO_JOB_DETAILS.about_role.length <= 280) {
    throw new Error("Expected DEMO_JOB_DETAILS about_role to exceed 280 chars to trigger expansion.");
  }
  console.log("✓ Test 5 Passed: Description completes cleanly and activates expansion handling.");

  console.log("\n=== All Feature 12 Validation Tests Passed Successfully! ===");
}

runTests();
