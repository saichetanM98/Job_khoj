import { getAvailableAIProviders } from "@/lib/openai";
import { UserProfile, WorkExperienceRole } from "@/types";

export interface PolishedWorkExperience {
  company: string;
  job_title: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  bullets: string[];
}

export interface PolishedEducation {
  highest_degree: string;
  field_of_study?: string;
  institution?: string;
  graduation_year?: string;
}

export interface PolishedResumeData {
  full_name: string;
  current_title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin_url?: string;
    portfolio_url?: string;
  };
  summary: string;
  skills: string[];
  work_experience: PolishedWorkExperience[];
  education: PolishedEducation;
}

export interface GenerateResumeResult {
  data: PolishedResumeData;
  polished: boolean;
  warning?: string;
}

/**
 * Creates unpolished fallback resume data directly from raw UserProfile fields.
 * Used when AI providers are unavailable, timing out, or encountering rate limits.
 */
export function createFallbackResumeData(profile: UserProfile): PolishedResumeData {
  const rawExperience = (profile.work_experience || []) as WorkExperienceRole[];
  
  const mappedExperience: PolishedWorkExperience[] = rawExperience.map((role) => {
    const bullets: string[] = [];
    if (role.responsibilities) {
      // Split responsibilities by newline or bullet characters if present
      const lines = role.responsibilities
        .split(/\r?\n|•|-/)
        .map((l) => l.trim())
        .filter((l) => l.length > 5);

      if (lines.length > 0) {
        bullets.push(...lines.slice(0, 4));
      } else {
        bullets.push(role.responsibilities.trim());
      }
    } else {
      bullets.push(`Executed responsibilities as ${role.job_title} at ${role.company}.`);
    }

    return {
      company: role.company || "Company",
      job_title: role.job_title || "Position",
      start_date: role.start_date || "",
      end_date: role.currently_working ? "Present" : role.end_date || "",
      currently_working: Boolean(role.currently_working),
      bullets,
    };
  });

  const summary = profile.current_title
    ? `${profile.current_title} with ${profile.years_experience ? `${profile.years_experience}+ years of experience` : "demonstrated expertise"}${profile.location ? ` based in ${profile.location}` : ""}. Proven track record in ${profile.skills?.slice(0, 3).join(", ") || "core technical domains"}, delivering scalable solutions and collaborative team success.`
    : "Results-driven professional with demonstrated expertise in delivering high-quality business outcomes and collaborative engineering.";

  return {
    full_name: profile.full_name || "Applicant Name",
    current_title: profile.current_title || "Professional",
    contact: {
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      linkedin_url: profile.linkedin_url || undefined,
      portfolio_url: profile.portfolio_url || undefined,
    },
    summary,
    skills: profile.skills && profile.skills.length > 0 ? profile.skills : ["Problem Solving", "Collaboration"],
    work_experience: mappedExperience,
    education: {
      highest_degree: profile.education?.highest_degree || "Degree",
      field_of_study: profile.education?.field_of_study || undefined,
      institution: profile.education?.institution || undefined,
      graduation_year: profile.education?.graduation_year || undefined,
    },
  };
}

/**
 * AI agent that synthesizes raw profile data into an executive-level,
 * action-driven resume representation using structured JSON mode.
 * 
 * Bounds:
 * - 15 seconds per-provider timeout
 * - 35 seconds total budget across fallback providers
 * - Graceful fallback to raw profile data if all providers fail
 */
export async function generatePolishedResumeContent(
  profile: UserProfile
): Promise<GenerateResumeResult> {
  const startTime = Date.now();
  const PER_PROVIDER_TIMEOUT = 15000;
  const TOTAL_BUDGET = 35000;

  const providers = getAvailableAIProviders(PER_PROVIDER_TIMEOUT);

  if (providers.length === 0) {
    return {
      data: createFallbackResumeData(profile),
      polished: false,
      warning: "AI polish unavailable — resume generated from your saved profile data. Try again shortly.",
    };
  }

  const prompt = `Candidate Profile:
- Full Name: ${profile.full_name || "Applicant"}
- Professional Title: ${profile.current_title || "Professional"}
- Email: ${profile.email || ""}
- Phone: ${profile.phone || ""}
- Location: ${profile.location || ""}
- LinkedIn: ${profile.linkedin_url || ""}
- Portfolio / GitHub: ${profile.portfolio_url || ""}
- Experience Level: ${profile.experience_level || "Mid-Level"} (${profile.years_experience || 0} years)
- Skills: ${(profile.skills || []).join(", ")}
- Target Roles: ${(profile.job_titles_seeking || []).join(", ")}
- Education: ${profile.education?.highest_degree || ""} in ${profile.education?.field_of_study || ""} from ${profile.education?.institution || ""} (${profile.education?.graduation_year || ""})
- Experience: ${JSON.stringify(profile.work_experience || [], null, 2)}
`;

  const systemPrompt = `You are a world-class executive resume strategist and technical recruiter.
Transform the candidate profile into a compelling, professional, single-page resume dataset.

Rules:
1. "summary": Exactly 3-4 impactful sentences highlighting core competencies, notable domain depth, and measurable value. Do NOT write generic fluff.
2. "skills": Curate and organize the top 10-16 most relevant technical and professional skills as concise string tokens.
3. "work_experience": For each role, refine the candidate's responsibilities into 2-4 quantified, action-oriented bullet points starting with strong past-tense action verbs (e.g., "Architected", "Spearheaded", "Engineered", "Optimized", "Delivered").
4. "education": Keep clean and properly formatted.
5. Return ONLY a valid JSON object matching this schema:
{
  "full_name": string,
  "current_title": string,
  "contact": {
    "email": string,
    "phone": string,
    "location": string,
    "linkedin_url": string or null,
    "portfolio_url": string or null
  },
  "summary": string,
  "skills": string[],
  "work_experience": [
    {
      "company": string,
      "job_title": string,
      "start_date": string,
      "end_date": string,
      "currently_working": boolean,
      "bullets": string[]
    }
  ],
  "education": {
    "highest_degree": string,
    "field_of_study": string or null,
    "institution": string or null,
    "graduation_year": string or null
  }
}`;

  for (const { name, client, model } of providers) {
    const elapsed = Date.now() - startTime;
    if (elapsed >= TOTAL_BUDGET) {
      console.warn(`[ResumeGenerator] Overall budget of ${TOTAL_BUDGET}ms exceeded after trying previous providers.`);
      break;
    }

    try {
      console.log(`[ResumeGenerator] Attempting AI polish with provider: ${name} (${model})...`);
      
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const content = response.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error(`Empty response content from ${name}`);
      }

      const parsed = JSON.parse(content) as PolishedResumeData;

      // Basic schema integrity check
      if (
        typeof parsed.full_name === "string" &&
        typeof parsed.summary === "string" &&
        Array.isArray(parsed.work_experience) &&
        Array.isArray(parsed.skills)
      ) {
        console.log(`[ResumeGenerator] Successfully polished resume via ${name}!`);
        return {
          data: {
            ...parsed,
            contact: {
              email: parsed.contact?.email || profile.email || "",
              phone: parsed.contact?.phone || profile.phone || "",
              location: parsed.contact?.location || profile.location || "",
              linkedin_url: parsed.contact?.linkedin_url || profile.linkedin_url || undefined,
              portfolio_url: parsed.contact?.portfolio_url || profile.portfolio_url || undefined,
            },
          },
          polished: true,
        };
      } else {
        throw new Error(`Malformed JSON structure received from ${name}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[ResumeGenerator] Provider ${name} failed: ${errorMsg}. Falling back...`);
    }
  }

  // Graceful fallback when all providers fail or time out
  console.warn("[ResumeGenerator] All AI providers failed or timed out. Using unpolished profile fallback.");
  return {
    data: createFallbackResumeData(profile),
    polished: false,
    warning: "AI polish unavailable — resume generated from your saved profile data. Try again shortly.",
  };
}
