import { z } from "zod";
import type { Stagehand } from "@browserbasehq/stagehand";
import { getOpenAIClient } from "@/lib/openai";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";
import {
  CompanyDossier,
  ResearchAgentResult,
  ResearchFailureReason,
} from "@/types/company-research";

/**
 * Strips subdomains from a hostname to find root employer domain.
 * e.g. jobs.stripe.com -> stripe.com, careers.google.com -> google.com
 */
function extractRootDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split(".").filter(Boolean);
  if (parts.length <= 2) return parts.join(".");
  // Handle two-part TLDs like .co.uk, .com.au
  const secondLast = parts[parts.length - 2];
  if (["co", "com", "org", "gov", "edu", "net"].includes(secondLast) && parts.length >= 3) {
    return parts.slice(-3).join(".");
  }
  return parts.slice(-2).join(".");
}

/**
 * Resolves employer canonical homepage URL from Adzuna tracking or source redirect link.
 */
export async function resolveCompanyDomain(
  sourceUrl: string,
  companyName: string
): Promise<{ domainUrl: string | null; isMismatch: boolean }> {
  try {
    if (sourceUrl && sourceUrl !== "#" && sourceUrl.startsWith("http")) {
      try {
        const parsedSource = new URL(sourceUrl);
        const sourceHost = parsedSource.hostname.toLowerCase();

        // If sourceUrl is already a direct non-Adzuna URL, extract root domain immediately
        if (!sourceHost.includes("adzuna.") && !sourceHost.includes("adref.")) {
          const rootDomain = extractRootDomain(sourceHost);
          return { domainUrl: `https://${rootDomain}`, isMismatch: false };
        }
      } catch {
        // Continue to redirect resolution
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(sourceUrl, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        clearTimeout(timeout);

        if (res.url) {
          const finalUrl = new URL(res.url);
          const host = finalUrl.hostname.toLowerCase();

          // Check if it landed beyond Adzuna redirect
          if (!host.includes("adzuna.") && !host.includes("adref.")) {
            const rootDomain = extractRootDomain(host);
            return { domainUrl: `https://${rootDomain}`, isMismatch: false };
          }
        }
      } catch {
        clearTimeout(timeout);
      }
    }

    // Secondary heuristic: try standard company domain from company name
    const sanitized = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (sanitized.length >= 2) {
      const candidate = `https://www.${sanitized}.com`;
      try {
        const check = await fetch(candidate, {
          method: "HEAD",
          signal: AbortSignal.timeout(3000),
        });
        if (check.ok || check.status === 403 || check.status === 401) {
          return { domainUrl: candidate, isMismatch: false };
        }
      } catch {
        // Fallback candidate failed
      }
    }

    return { domainUrl: null, isMismatch: true };
  } catch {
    return { domainUrl: null, isMismatch: true };
  }
}

/**
 * Helper to record entries in agent_logs table with differentiated severity.
 */
async function logAgentEvent(
  insforge: any,
  runId: string,
  userId: string,
  level: "info" | "warning" | "error",
  message: string,
  jobId?: string | null
) {
  try {
    await insforge.database.from("agent_logs").insert([
      {
        run_id: runId,
        user_id: userId,
        level,
        message,
        job_id: jobId || null,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.warn("[agent/researcher] Failed to write agent_log:", err);
  }
}

/**
 * Conducts headless web extraction using Stagehand + Browserbase with timeouts.
 */
async function browseCompanyWebsite(
  domainUrl: string
): Promise<{
  scrapedContent: Record<string, any>;
  pagesVisited: number;
  failureReason: ResearchFailureReason;
}> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    return {
      scrapedContent: {},
      pagesVisited: 0,
      failureReason: "no_browserbase_key",
    };
  }

  // Determine Stagehand model config
  let modelName = "google/gemini-3.5-flash";
  let modelKey = process.env.GEMINI_API_KEY;

  if (!modelKey && process.env.GROQ_API_KEY) {
    modelName = "groq/openai/gpt-oss-120b";
    modelKey = process.env.GROQ_API_KEY;
  } else if (!modelKey && process.env.OPENAI_API_KEY) {
    modelName = "openai/gpt-4o";
    modelKey = process.env.OPENAI_API_KEY;
  }

  if (!modelKey) {
    return {
      scrapedContent: {},
      pagesVisited: 0,
      failureReason: "stagehand_llm_unsupported",
    };
  }

  let stagehand: Stagehand | null = null;
  let pagesVisited = 0;
  const scrapedData: Record<string, any> = {};

  try {
    const { Stagehand, browserbase } = await import("@browserbasehq/stagehand");

    // Stagehand creation with Browserbase environment
    const browser = await browserbase.launch({
      apiKey,
      projectId,
    });

    stagehand = await Stagehand.create({
      browser,
      model: {
        modelName: modelName as any,
        apiKey: modelKey,
      },
    });

    const pages = await stagehand.browser.context.pages();
    const page = pages.length > 0 ? pages[0] : await stagehand.browser.context.newPage();
    
    // Visit homepage
    await page.goto(domainUrl, { timeout: 15000, waitUntil: "domcontentloaded" });
    pagesVisited++;

    // Step 1: Homepage extraction
    const homepageData = await stagehand.extract(
      "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
      z.object({
        oneLiner: z.string().optional().describe("What the company does in one sentence"),
        productSummary: z.string().optional().describe("What they build/sell and who it's for"),
        signals: z.array(z.string()).optional().describe("Funding, notable customers, scale, mission, recent news"),
        pageLinks: z
          .array(
            z.object({
              url: z.string(),
              kind: z.enum([
                "about",
                "careers",
                "blog",
                "engineering",
                "product",
                "team",
                "other",
              ]),
            })
          )
          .optional()
          .describe("Internal links worth visiting"),
      })
    );

    scrapedData.homepage = homepageData;

    // If oneLiner and productSummary are empty — site is blank or parked
    if (!homepageData?.data?.oneLiner && !homepageData?.data?.productSummary) {
      return {
        scrapedContent: scrapedData,
        pagesVisited,
        failureReason: "empty_page",
      };
    }

    // Step 2: Sub-page extraction (up to 2 sub-pages to stay within timeout budget)
    const candidateLinks = (homepageData.data.pageLinks || [])
      .filter((l) => ["about", "engineering", "product", "blog"].includes(l.kind))
      .slice(0, 2);

    for (const link of candidateLinks) {
      if (!link.url) continue;
      try {
        const fullUrl = link.url.startsWith("http")
          ? link.url
          : new URL(link.url, domainUrl).toString();

        await page.goto(fullUrl, { timeout: 10000, waitUntil: "domcontentloaded" });
        pagesVisited++;

        const subPageData = await stagehand.extract(
          "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
          z.object({
            keyPoints: z.array(z.string()).optional(),
            technologies: z.array(z.string()).optional().describe("Specific languages, frameworks, tools, platforms"),
            valuesOrCulture: z.array(z.string()).optional().describe("Stated values, working style, team norms"),
            notable: z.array(z.string()).optional().describe("Customers, funding, scale, projects, awards"),
          })
        );

        scrapedData[`subpage_${link.kind}`] = subPageData?.data || {};
      } catch (subErr) {
        console.warn(`[agent/researcher] Subpage extraction failed for ${link.url}:`, subErr);
      }
    }

    return {
      scrapedContent: scrapedData,
      pagesVisited,
      failureReason: null,
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    let failureReason: ResearchFailureReason = "stagehand_extraction_failed";

    if (msg.includes("429") || msg.includes("quota") || msg.includes("limit")) {
      failureReason = "session_quota_exceeded";
    } else if (msg.includes("Cloudflare") || msg.includes("captcha") || msg.includes("bot")) {
      failureReason = "bot_detected";
    } else if (msg.includes("timeout") || msg.includes("timed out")) {
      failureReason = "timeout";
    }

    return {
      scrapedContent: scrapedData,
      pagesVisited,
      failureReason,
    };
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch {
        // Stagehand session close error safely ignored
      }
    }
  }
}

/**
 * Synthesizes the final 9-field dossier using LLM cascade (Groq -> Gemini -> OpenRouter -> OpenAI).
 */
async function synthesizeDossier(
  companyName: string,
  job: any,
  profile: any,
  websiteResearch: Record<string, any>,
  domainUrl: string | null
): Promise<CompanyDossier> {
  const { client, model } = getOpenAIClient();

  const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY a valid JSON object matching this schema exactly:
{
  "companyOverview": "string",
  "techStack": ["string"],
  "culture": ["string"],
  "whyThisRole": "string",
  "yourEdge": ["string"],
  "gapsToAddress": ["string"],
  "smartQuestions": ["string"],
  "interviewPrep": ["string"],
  "sources": ["string"]
}`;

  const matchedSkills = Array.isArray(job.matched_skills)
    ? job.matched_skills
    : typeof job.matched_skills === "string"
    ? JSON.parse(job.matched_skills || "[]")
    : [];

  const missingSkills = Array.isArray(job.missing_skills)
    ? job.missing_skills
    : typeof job.missing_skills === "string"
    ? JSON.parse(job.missing_skills || "[]")
    : [];

  const candidateSkills = Array.isArray(profile?.skills)
    ? profile.skills
    : typeof profile?.skills === "string"
    ? JSON.parse(profile.skills || "[]")
    : [];

  const userPrompt = `COMPANY RESEARCH (from their public website):
${Object.keys(websiteResearch).length > 0 ? JSON.stringify(websiteResearch, null, 2) : "None available (browsing step unavailable; please synthesize from posting and candidate profile)."}

JOB POSTING:
Title: ${job.title || "Software Engineer"}
Company: ${companyName}
Description: ${job.about_role || "Not provided"}
Matched skills: ${matchedSkills.join(", ") || "General software development"}
Missing skills: ${missingSkills.join(", ") || "None highlighted"}

CANDIDATE PROFILE:
Current title: ${profile?.current_title || "Candidate"}
Experience: ${profile?.years_experience || 3} years, level ${profile?.experience_level || "Mid-Level"}
Skills: ${candidateSkills.join(", ") || "Software Engineering"}
Work history: ${JSON.stringify(profile?.work_experience || [])}`;

  try {
    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    const sources = Array.isArray(parsed.sources) && parsed.sources.length > 0
      ? parsed.sources
      : domainUrl
      ? [domainUrl]
      : ["Synthesized from job posting & candidate profile"];

    return {
      companyOverview:
        parsed.companyOverview ||
        `${companyName} is actively hiring for ${job.title || "this role"} with an emphasis on modern engineering standards.`,
      techStack: Array.isArray(parsed.techStack) && parsed.techStack.length > 0
        ? parsed.techStack
        : matchedSkills.slice(0, 6),
      culture: Array.isArray(parsed.culture) && parsed.culture.length > 0
        ? parsed.culture
        : ["Collaborative engineering team", "Focus on code quality and scalable systems"],
      whyThisRole:
        parsed.whyThisRole ||
        `This role expands ${companyName}'s core engineering capabilities and accelerates product delivery.`,
      yourEdge: Array.isArray(parsed.yourEdge) && parsed.yourEdge.length > 0
        ? parsed.yourEdge
        : matchedSkills.map((s: string) => `Strong demonstrated background in ${s}`),
      gapsToAddress: Array.isArray(parsed.gapsToAddress) && parsed.gapsToAddress.length > 0
        ? parsed.gapsToAddress
        : missingSkills.map((s: string) => `Proactively highlight transferable experience relating to ${s}`),
      smartQuestions: Array.isArray(parsed.smartQuestions) && parsed.smartQuestions.length > 0
        ? parsed.smartQuestions
        : [
            `What are the most critical technical milestones for the team over the next 6 months?`,
            `How does ${companyName} approach technical debt vs feature velocity in this domain?`,
          ],
      interviewPrep: Array.isArray(parsed.interviewPrep) && parsed.interviewPrep.length > 0
        ? parsed.interviewPrep
        : [
            `Review architectural patterns for ${matchedSkills[0] || "backend systems"}`,
            `Prepare concrete STAR stories demonstrating cross-functional delivery`,
          ],
      sources,
    };
  } catch (synthErr) {
    console.error("[agent/researcher] LLM synthesis failed, using safe fallback:", synthErr);
    return {
      companyOverview: `${companyName} is hiring a ${job.title || "Software Engineer"} to support scalable product development.`,
      techStack: matchedSkills.slice(0, 5),
      culture: ["High-ownership culture", "Pragmatic engineering and technical excellence"],
      whyThisRole: `This role plays an important part in ${companyName}'s technical roadmaps.`,
      yourEdge: matchedSkills.map((s: string) => `Direct proficiency in ${s}`),
      gapsToAddress: missingSkills.map((s: string) => `Frame adjacent experience to cover ${s}`),
      smartQuestions: [
        `What does success look like in this role in the first 90 days?`,
        `How does the team collaborate with product and stakeholders on new features?`,
      ],
      interviewPrep: [
        `System design and architectural fundamentals`,
        `Recent project delivery walkthroughs`,
      ],
      sources: domainUrl ? [domainUrl] : ["Synthesized from job posting & candidate profile"],
    };
  }
}

/**
 * Main entry point for the Company Research Agent.
 */
export async function runCompanyResearch(
  jobId: string,
  userId: string
): Promise<ResearchAgentResult> {
  const insforge = await createInsforgeServer();
  const posthog = createPostHogServer();
  const runId = `research-${Date.now()}`;

  let job: any = null;
  let profile: any = null;
  let isDemoJob = false;

  // 1. Fetch Job from DB or check Demo fallback
  if (jobId === "demo-backend-developer" || jobId.startsWith("demo-")) {
    isDemoJob = true;
    job = {
      id: jobId,
      title: "Backend Developer",
      company: "Insight Global",
      about_role:
        "5-8 years of backend development experience. Strong proficiency in Node.js and/or Java (Spring Boot). Experience building and consuming RESTful APIs. Exposure to cloud-based development in AWS.",
      matched_skills: ["Node.js", "RESTful APIs", "AWS", "Problem-solving"],
      missing_skills: ["Java (Spring Boot)"],
      source_url: "https://www.insightglobal.com",
    };
  } else {
    const { data: dbJobs } = await insforge.database
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .limit(1);

    if (dbJobs && dbJobs.length > 0) {
      job = dbJobs[0];
    } else {
      // Fallback lookup if job exists without user constraint (preview/demo)
      const { data: anyJobs } = await insforge.database
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .limit(1);

      if (anyJobs && anyJobs.length > 0) {
        job = anyJobs[0];
      }
    }
  }

  if (!job) {
    throw new Error(`Job not found with ID: ${jobId}`);
  }

  // 2. Fetch User Profile
  const { data: profileRecords } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .limit(1);

  if (profileRecords && profileRecords.length > 0) {
    profile = profileRecords[0];
  }

  await logAgentEvent(
    insforge,
    runId,
    userId,
    "info",
    `Started company research for "${job.company}" (${job.title})`,
    jobId
  );

  // 3. Resolve Company Domain via Redirect Follow
  const { domainUrl, isMismatch } = await resolveCompanyDomain(
    job.source_url || job.external_apply_url || "",
    job.company
  );

  if (isMismatch) {
    await logAgentEvent(
      insforge,
      runId,
      userId,
      "info",
      `Adzuna redirect resolution did not resolve to employer domain for ${job.company}; falling over to synthesis mode`,
      jobId
    );
  } else if (domainUrl) {
    await logAgentEvent(
      insforge,
      runId,
      userId,
      "info",
      `Resolved employer domain for ${job.company}: ${domainUrl}`,
      jobId
    );
  }

  // 4. Web Browsing via Stagehand with 25s Timeout Budget
  let scrapedContent: Record<string, any> = {};
  let pagesVisited = 0;
  let failureReason: ResearchFailureReason = isMismatch ? "redirect_unresolved" : null;

  if (domainUrl && !isMismatch) {
    try {
      const browsePromise = browseCompanyWebsite(domainUrl);
      const timeoutPromise = new Promise<{
        scrapedContent: Record<string, any>;
        pagesVisited: number;
        failureReason: ResearchFailureReason;
      }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              scrapedContent: {},
              pagesVisited: 0,
              failureReason: "timeout",
            }),
          25000
        )
      );

      const browseResult = await Promise.race([browsePromise, timeoutPromise]);
      scrapedContent = browseResult.scrapedContent;
      pagesVisited = browseResult.pagesVisited;
      failureReason = browseResult.failureReason;

      if (failureReason) {
        const severity =
          failureReason === "bot_detected" || failureReason === "empty_page"
            ? "info"
            : failureReason === "timeout"
            ? "warning"
            : "error";

        await logAgentEvent(
          insforge,
          runId,
          userId,
          severity,
          `Browsing ended with reason: ${failureReason}; transitioning to synthesis mode`,
          jobId
        );
      }
    } catch (err: any) {
      failureReason = "stagehand_extraction_failed";
      await logAgentEvent(
        insforge,
        runId,
        userId,
        "warning",
        `Browsing encounter exception: ${err?.message || "Unknown error"}; transitioning to synthesis`,
        jobId
      );
    }
  }

  const usedFallback = failureReason !== null || Object.keys(scrapedContent).length === 0;

  // 5. LLM Synthesis
  const dossier = await synthesizeDossier(
    job.company,
    job,
    profile,
    scrapedContent,
    domainUrl
  );

  // 6. Persistence in InsForge DB (skip for demo jobs)
  if (!isDemoJob) {
    try {
      const { error: updateError } = await insforge.database
        .from("jobs")
        .update({
          company_research: dossier,
          company_researched_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .eq("user_id", userId);

      if (updateError) {
        console.warn("[agent/researcher] Failed to update jobs.company_research:", updateError);
        await logAgentEvent(
          insforge,
          runId,
          userId,
          "error",
          `Failed to persist dossier to DB: ${updateError.message}`,
          jobId
        );
      }
    } catch (dbErr: any) {
      console.warn("[agent/researcher] DB update error:", dbErr);
    }
  }

  // 7. PostHog Telemetry
  try {
    posthog.capture({
      distinctId: userId,
      event: "company_researched",
      properties: {
        userId,
        jobId,
        company: job.company,
        usedFallback,
        failureReason,
        pagesVisited,
      },
    });
    await posthog.shutdown();
  } catch (phErr) {
    console.warn("[agent/researcher] PostHog event capture failed:", phErr);
  }

  await logAgentEvent(
    insforge,
    runId,
    userId,
    "info",
    `Completed company research briefing for ${job.company} (usedFallback: ${usedFallback})`,
    jobId
  );

  return {
    success: true,
    dossier,
    usedFallback,
    failureReason,
    pagesVisited,
    resolvedDomain: domainUrl || undefined,
  };
}
