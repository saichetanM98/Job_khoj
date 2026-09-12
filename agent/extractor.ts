import { getAvailableAIProviders } from "@/lib/openai";
import { UserProfile, WorkExperienceRole, EducationRecord } from "@/types";

export interface ExtractedProfileData {
  full_name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  work_authorization?: string;
  current_title?: string;
  experience_level?: string;
  years_experience?: number;
  skills?: string[];
  industries?: string[];
  work_experience?: WorkExperienceRole[];
  education?: EducationRecord;
  job_titles_seeking?: string[];
  remote_preference?: string;
  salary_expectation?: string;
  preferred_locations?: string[];
  cover_letter_tone?: string;
}

/**
 * Parses raw text extracted from a resume PDF using available AI providers
 * (Groq -> Gemini -> OpenRouter -> OpenAI) with automatic fallback.
 */
export async function extractProfileFromResumeText(
  resumeText: string
): Promise<{ success: boolean; data?: ExtractedProfileData; error?: string }> {
  const providers = getAvailableAIProviders(20000);

  if (providers.length === 0) {
    return {
      success: false,
      error: "No AI provider configured. Please set GEMINI_API_KEY or GROQ_API_KEY.",
    };
  }

  const systemPrompt = `You are an expert AI resume parser. Your job is to extract structured candidate profile data from the provided resume text.

Return ONLY a valid JSON object matching the following structure:
{
  "full_name": string or null,
  "phone": string or null,
  "location": string or null (e.g. "San Francisco, CA" or "London, UK"),
  "linkedin_url": string or null,
  "portfolio_url": string or null (GitHub, personal website, portfolio),
  "work_authorization": "Citizen" | "Permanent Resident" | "Work Visa (H1-B, etc.)" | "Need Sponsorship" | "Other",
  "current_title": string or null (most recent or current job title),
  "experience_level": "Entry" | "Junior" | "Mid-Level" | "Senior" | "Lead" | "Principal" | "Director",
  "years_experience": number (total years of professional experience as an integer),
  "skills": string[] (array of specific technical and domain skills, tools, languages),
  "industries": string[] (array of industries worked in e.g. "FinTech", "E-commerce", "SaaS"),
  "work_experience": [
    {
      "company": string,
      "job_title": string,
      "start_date": string (e.g. "January 2021" or "2021"),
      "end_date": string (e.g. "Present" or "December 2023"),
      "currently_working": boolean,
      "responsibilities": string (concise summary of key impact, achievements, technologies)
    }
  ],
  "education": {
    "highest_degree": string (e.g. "Bachelor's Degree", "Master's Degree", "PhD", "Associate Degree", "High School"),
    "field_of_study": string (e.g. "Computer Science", "Electrical Engineering"),
    "institution": string (university / college name),
    "graduation_year": string (e.g. "2020")
  },
  "job_titles_seeking": string[] (inferred roles or target titles candidate is qualified for),
  "remote_preference": "Remote" | "Hybrid" | "On-site" | "Any",
  "salary_expectation": string or null,
  "preferred_locations": string[] (locations mentioned or target locations),
  "cover_letter_tone": "Formal" | "Conversational" | "Persuasive" | "Direct"
}

Guidelines:
1. Ground all extractions strictly in the resume text. Do not invent employment history, contact details, or degrees.
2. If years of experience is not explicitly stated, calculate it logically from the work history date ranges.
3. Infer experience_level based on years of experience and titles (e.g. 0-2 yrs -> Entry/Junior, 3-5 yrs -> Mid-Level, 5-8 yrs -> Senior, 8+ yrs -> Lead/Principal).
4. Return concise, impactful responsibility summaries for each role.
5. If a field is not found in the resume, provide null or empty array. Default work_authorization to "Citizen", remote_preference to "Any", and cover_letter_tone to "Formal".`;

  const userPrompt = `RESUME TEXT:\n\n${resumeText.slice(0, 12000)}`;

  let lastError = "All AI providers failed.";

  for (const { name, client, model } of providers) {
    try {
      console.log(`[agent/extractor] Attempting extraction with provider: ${name} (${model})...`);

      const response = await client.chat.completions.create({
        model: model,
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`Empty response content from ${name}`);
      }

      const parsed = JSON.parse(content) as ExtractedProfileData;

      // Clean and sanitize output
      const sanitized: ExtractedProfileData = {
        full_name: parsed.full_name || undefined,
        phone: parsed.phone || undefined,
        location: parsed.location || undefined,
        linkedin_url: parsed.linkedin_url || undefined,
        portfolio_url: parsed.portfolio_url || undefined,
        work_authorization: parsed.work_authorization || "Citizen",
        current_title: parsed.current_title || undefined,
        experience_level: parsed.experience_level || "Junior",
        years_experience: typeof parsed.years_experience === "number" ? parsed.years_experience : 0,
        skills: Array.isArray(parsed.skills) ? parsed.skills.filter(Boolean) : [],
        industries: Array.isArray(parsed.industries) ? parsed.industries.filter(Boolean) : [],
        work_experience: Array.isArray(parsed.work_experience)
          ? parsed.work_experience.map((role) => ({
              company: role.company || "",
              job_title: role.job_title || "",
              start_date: role.start_date || "",
              end_date: role.currently_working ? "" : (role.end_date || ""),
              currently_working: Boolean(role.currently_working),
              responsibilities: role.responsibilities || "",
            }))
          : [],
        education: parsed.education
          ? {
              highest_degree: parsed.education.highest_degree || "Bachelor's Degree",
              field_of_study: parsed.education.field_of_study || "",
              institution: parsed.education.institution || "",
              graduation_year: parsed.education.graduation_year || "",
            }
          : undefined,
        job_titles_seeking: Array.isArray(parsed.job_titles_seeking)
          ? parsed.job_titles_seeking.filter(Boolean)
          : [],
        remote_preference: parsed.remote_preference || "Any",
        salary_expectation: parsed.salary_expectation || undefined,
        preferred_locations: Array.isArray(parsed.preferred_locations)
          ? parsed.preferred_locations.filter(Boolean)
          : [],
        cover_letter_tone: parsed.cover_letter_tone || "Formal",
      };

      console.log(`[agent/extractor] Successfully extracted profile via ${name}!`);
      return {
        success: true,
        data: sanitized,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[agent/extractor] Provider ${name} failed: ${msg}. Falling back...`);
      lastError = msg;
    }
  }

  console.error(`[agent/extractor] All AI providers failed. Last error: ${lastError}`);
  return {
    success: false,
    error: `AI extraction failed: ${lastError}`,
  };
}


