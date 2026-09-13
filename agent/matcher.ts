import OpenAI from "openai";
import { AdzunaJob } from "@/lib/adzuna";
import { UserProfile } from "@/types";

export interface ScoredMatch {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  match_method: "groq" | "llm" | "heuristic_fallback";
  llm_provider: "groq" | "gemini" | null;
}

export interface CircuitBreakerState {
  groqDisabled: boolean;
  geminiDisabled: boolean;
  isFirstJob: boolean;
}

/**
 * Validates candidate LLM response strictly:
 * - matchScore: integer 0-100
 * - matchReason: non-empty string
 * - matchedSkills: string[]
 * - missingSkills: string[]
 */
export function validateScoringResponse(data: any): data is {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
} {
  if (!data || typeof data !== "object") return false;
  if (
    typeof data.matchScore !== "number" ||
    !Number.isInteger(data.matchScore) ||
    data.matchScore < 0 ||
    data.matchScore > 100
  ) {
    return false;
  }
  if (typeof data.matchReason !== "string" || data.matchReason.trim().length === 0) {
    return false;
  }
  if (!Array.isArray(data.matchedSkills) || !data.matchedSkills.every((s: any) => typeof s === "string")) {
    return false;
  }
  if (!Array.isArray(data.missingSkills) || !data.missingSkills.every((s: any) => typeof s === "string")) {
    return false;
  }
  return true;
}

/**
 * Promise timeout helper (6-8s)
 */
function withTimeout<T>(promise: Promise<T>, ms = 7000, providerName = "Provider"): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${providerName} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Builds the prompt evaluating the candidate against the user profile.
 */
function buildScoringPrompt(job: AdzunaJob, profile: UserProfile): string {
  const profileSkills = profile.skills && profile.skills.length > 0 ? profile.skills.join(", ") : "None listed";
  const userTitle = profile.current_title || "Software Engineer";
  const expLevel = profile.experience_level || "Not specified";
  const yearsExp = profile.years_experience !== null ? `${profile.years_experience} years` : "Not specified";
  
  let recentRoles = "None listed";
  if (Array.isArray(profile.work_experience) && profile.work_experience.length > 0) {
    recentRoles = profile.work_experience
      .slice(0, 3)
      .map((w) => `${w.job_title} at ${w.company} (${w.responsibilities || ""})`)
      .join(" | ");
  }

  return `You are an expert AI talent recruiter. Score how well the candidate's profile matches the job posting.

Candidate Profile:
- Current Title: ${userTitle}
- Experience Level: ${expLevel}
- Years of Experience: ${yearsExp}
- Listed Skills: ${profileSkills}
- Recent Roles: ${recentRoles}

Job Posting:
- Title: ${job.title}
- Company: ${job.company.display_name}
- Location: ${job.location.display_name}
- Description Snippet: ${job.description}

Evaluate the alignment. Output ONLY a valid JSON object with the following exact keys:
{
  "matchScore": <integer between 0 and 100>,
  "matchReason": "<one concise paragraph explaining the match strength, relevance of background, and key reasons for the score>",
  "matchedSkills": ["<skill1>", "<skill2>"],
  "missingSkills": ["<skillA>", "<skillB>"]
}`;
}

/**
 * Extracts and parses JSON from raw LLM text
 */
function parseJsonOutput(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Unable to extract valid JSON from LLM output.");
  }
}

/**
 * Heuristic Scorer (Tier 3 fallback - zero external dependencies)
 */
export function scoreHeuristically(job: AdzunaJob, profile: UserProfile): ScoredMatch {
  const profileSkills = (profile.skills || []).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const textToScan = `${job.title} ${job.description}`.toLowerCase();

  if (profileSkills.length === 0) {
    const isTitleMatch = textToScan.includes((profile.current_title || "").toLowerCase().trim());
    const score = isTitleMatch ? 65 : 50;
    return {
      matchScore: score,
      matchReason: `Evaluated using keyword analysis. ${isTitleMatch ? "Target job title aligns with your current title." : "General tech role alignment found."}`,
      matchedSkills: profile.current_title ? [profile.current_title] : [],
      missingSkills: ["Skills not specified on profile"],
      match_method: "heuristic_fallback",
      llm_provider: null,
    };
  }

  const matchedSet = new Set<string>();
  const missingSet = new Set<string>();

  for (const skill of profileSkills) {
    if (textToScan.includes(skill)) {
      matchedSet.add(skill);
    } else {
      missingSet.add(skill);
    }
  }

  const matchedSkills = Array.from(matchedSet);
  const missingSkills = Array.from(missingSet);

  const overlapRatio = profileSkills.length > 0 ? matchedSkills.length / profileSkills.length : 0.5;
  // Scaled score with base relevance 40-95
  const rawScore = Math.round(40 + overlapRatio * 55);
  const matchScore = Math.min(98, Math.max(25, rawScore));

  const matchReason = `Matched on ${matchedSkills.length} of ${profileSkills.length} listed profile skills based on keyword overlap. Identified strengths: ${matchedSkills.slice(0, 3).join(", ") || "related experience"}.`;

  return {
    matchScore,
    matchReason,
    matchedSkills,
    missingSkills,
    match_method: "heuristic_fallback",
    llm_provider: null,
  };
}

/**
 * Scores a single job via Groq (Tier 1)
 */
async function tryGroqScoring(job: AdzunaJob, profile: UserProfile): Promise<ScoredMatch> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey || !groqKey.startsWith("gsk_")) {
    throw new Error("GROQ_API_KEY not configured or invalid.");
  }

  const client = new OpenAI({
    apiKey: groqKey,
    baseURL: "https://api.groq.com/openai/v1",
    maxRetries: 0,
  });

  const prompt = buildScoringPrompt(job, profile);

  const completion = await withTimeout(
    client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a professional recruiting assistant. You always respond in valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    7000,
    "Groq"
  );

  const content = completion.choices[0]?.message?.content || "";
  const parsed = parseJsonOutput(content);

  if (!validateScoringResponse(parsed)) {
    throw new Error("Groq returned malformed response shape.");
  }

  return {
    matchScore: parsed.matchScore,
    matchReason: parsed.matchReason,
    matchedSkills: parsed.matchedSkills,
    missingSkills: parsed.missingSkills,
    match_method: "groq",
    llm_provider: "groq",
  };
}

/**
 * Scores a single job via Gemini (Tier 2)
 */
async function tryGeminiScoring(job: AdzunaJob, profile: UserProfile): Promise<ScoredMatch> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.trim().length < 10) {
    throw new Error("GEMINI_API_KEY not configured or invalid.");
  }

  const client = new OpenAI({
    apiKey: geminiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    maxRetries: 0,
  });

  const prompt = buildScoringPrompt(job, profile);

  const completion = await withTimeout(
    client.chat.completions.create({
      model: "gemini-3.5-flash",
      messages: [
        { role: "system", content: "You are a professional recruiting assistant. Return only valid JSON adhering to the requested schema." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    7000,
    "Gemini"
  );

  const content = completion.choices[0]?.message?.content || "";
  const parsed = parseJsonOutput(content);

  if (!validateScoringResponse(parsed)) {
    throw new Error("Gemini returned malformed response shape.");
  }

  return {
    matchScore: parsed.matchScore,
    matchReason: parsed.matchReason,
    matchedSkills: parsed.matchedSkills,
    missingSkills: parsed.missingSkills,
    match_method: "llm",
    llm_provider: "gemini",
  };
}

/**
 * Scores a single job with 3-tier fallback and circuit breaker checking.
 */
export async function scoreJobWithFallback(
  job: AdzunaJob,
  profile: UserProfile,
  circuit: CircuitBreakerState,
  onLog?: (level: "info" | "warning" | "error", message: string) => Promise<void>
): Promise<ScoredMatch> {
  const isFirst = circuit.isFirstJob;
  circuit.isFirstJob = false;

  // 1. Try Groq if not disabled
  if (!circuit.groqDisabled) {
    try {
      return await tryGroqScoring(job, profile);
    } catch (groqErr: any) {
      const status = groqErr?.status || groqErr?.statusCode;
      const errMsg = String(groqErr?.message || "");
      const isRateLimitOrAuth = status === 401 || status === 429 || errMsg.includes("401") || errMsg.includes("429");
      
      // Systemic short-circuit if first job returned 401 or 429
      if (isFirst && isRateLimitOrAuth) {
        circuit.groqDisabled = true;
        await onLog?.(
          status === 401 || errMsg.includes("401") ? "error" : "warning",
          `Groq returned 401/429 on initial job. Circuit breaker opened: skipping Groq for remainder of run.`
        );
      } else {
        await onLog?.(
          "warning",
          `Groq scoring failed for "${job.title}": ${groqErr?.message || groqErr}. Falling back to Gemini.`
        );
      }
    }
  }

  // 2. Try Gemini if not disabled
  if (!circuit.geminiDisabled) {
    try {
      return await tryGeminiScoring(job, profile);
    } catch (geminiErr: any) {
      const status = geminiErr?.status || geminiErr?.statusCode;
      const errMsg = String(geminiErr?.message || "");
      const isRateLimitOrAuth = status === 401 || status === 429 || errMsg.includes("401") || errMsg.includes("429");

      if (isFirst && isRateLimitOrAuth) {
        circuit.geminiDisabled = true;
        await onLog?.(
          status === 401 || errMsg.includes("401") ? "error" : "warning",
          `Gemini returned 401/429 on initial job. Circuit breaker opened: skipping Gemini for remainder of run.`
        );
      } else {
        await onLog?.(
          "warning",
          `Gemini scoring failed for "${job.title}": ${geminiErr?.message || geminiErr}. Falling back to heuristic scorer.`
        );
      }
    }
  }

  // 3. Heuristic Scorer (Guaranteed fallback)
  return scoreHeuristically(job, profile);
}

/**
 * Concurrency pool executor: scores jobs in batches of size `limit`
 * Default limit: 2-3 (configured via SCORING_CONCURRENCY)
 */
export async function scoreJobsBatch(
  jobs: AdzunaJob[],
  profile: UserProfile,
  onLog?: (level: "info" | "warning" | "error", message: string) => Promise<void>
): Promise<{
  results: { job: AdzunaJob; scored: ScoredMatch }[];
  stats: {
    jobs_scored_groq: number;
    jobs_scored_gemini: number;
    jobs_fallback_scored: number;
  };
}> {
  const concurrency = Math.max(1, parseInt(process.env.SCORING_CONCURRENCY || "2", 10) || 2);
  const circuit: CircuitBreakerState = {
    groqDisabled: false,
    geminiDisabled: false,
    isFirstJob: true,
  };

  const results: { job: AdzunaJob; scored: ScoredMatch }[] = [];
  const stats = {
    jobs_scored_groq: 0,
    jobs_scored_gemini: 0,
    jobs_fallback_scored: 0,
  };

  // Process with concurrency limit using Promise pool
  let index = 0;
  async function worker() {
    while (index < jobs.length) {
      const currentIndex = index++;
      const job = jobs[currentIndex];
      const scored = await scoreJobWithFallback(job, profile, circuit, onLog);
      results[currentIndex] = { job, scored };

      if (scored.match_method === "groq") {
        stats.jobs_scored_groq++;
      } else if (scored.match_method === "llm" && scored.llm_provider === "gemini") {
        stats.jobs_scored_gemini++;
      } else {
        stats.jobs_fallback_scored++;
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, jobs.length) }, () => worker());
  await Promise.all(workers);

  return { results, stats };
}
