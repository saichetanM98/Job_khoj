import { CompanyDossier } from "./company-research";

export interface JobDetails {
  id: string;
  title: string;
  company: string;
  match_score: number;
  salary: string;
  location: string;
  job_type: string;
  date_found: string;
  found_at?: string;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
  about_role: string;
  external_apply_url?: string;
  source_url?: string;
  company_research?: CompanyDossier | null;
}

export function formatRelativeDate(isoDateString?: string | null): string {
  if (!isoDateString) return "1 hour ago";
  const d = new Date(isoDateString);
  if (isNaN(d.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return "1 hour ago";
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

export const DEMO_JOB_DETAILS: JobDetails = {
  id: "demo-backend-developer",
  title: "Backend Developer",
  company: "Insight Global",
  match_score: 85,
  salary: "$101k – $101k",
  location: "Newark, Essex County",
  job_type: "—",
  date_found: "1 hour ago",
  found_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  match_reason:
    "The candidate possesses a strong background in backend development with over 10 years of experience, which exceeds the job's requirement of 5-8 years. They have expertise in Node.js, RESTful APIs, and AWS, aligning well with the job's technical requirements. The candidate's prior work also demonstrates proficiency in cloud-based systems and an ability to work across multiple technologies. However, a lack of explicit experience in Java (Spring Boot) represents a gap in the job's demands.",
  matched_skills: [
    "Node.js",
    "RESTful APIs",
    "AWS",
    "Problem-solving",
    "Backend development",
  ],
  missing_skills: ["Java (Spring Boot)"],
  about_role:
    "Job Description - 5-8 years of backend development experience - Strong proficiency in Node.js and/or Java (Spring Boot) - Experience building and consuming RESTful APIs - Exposure to cloud-based development in AWS (deployments, monitoring, logging) - Ability to work across multiple technologies and systems - Strong problem-solving skills and attention to detail - Effective communication skills and willingness to collaborate across teams We are a company committed to creating diverse and inclusive workplaces for all employees.",
  external_apply_url: "https://www.insightglobal.com",
  source_url: "https://www.insightglobal.com",
  company_research: null,
};

export function mapDbJobToJobDetails(dbJob: any): JobDetails {
  const rawDate = dbJob.found_at || dbJob.created_at || new Date().toISOString();
  
  // Format salary
  let formattedSalary = dbJob.salary;
  if (!formattedSalary || formattedSalary === "Not specified") {
    formattedSalary = "$101k – $101k";
  }

  // Format job type
  let formattedJobType = "—";
  if (dbJob.job_type && dbJob.job_type !== "fulltime") {
    formattedJobType = dbJob.job_type;
  }

  // Ensure matched and missing skills arrays
  const matchedSkills: string[] = Array.isArray(dbJob.matched_skills)
    ? dbJob.matched_skills
    : typeof dbJob.matched_skills === "string"
    ? JSON.parse(dbJob.matched_skills || "[]")
    : [];

  const missingSkills: string[] = Array.isArray(dbJob.missing_skills)
    ? dbJob.missing_skills
    : typeof dbJob.missing_skills === "string"
    ? JSON.parse(dbJob.missing_skills || "[]")
    : [];

  return {
    id: dbJob.id,
    title: dbJob.title || "Software Engineer",
    company: dbJob.company || "Company",
    match_score: typeof dbJob.match_score === "number" ? dbJob.match_score : 85,
    salary: formattedSalary,
    location: dbJob.location || "Remote",
    job_type: formattedJobType,
    date_found: formatRelativeDate(rawDate),
    found_at: rawDate,
    match_reason:
      dbJob.match_reason ||
      "The candidate profile aligns well with the technical stack and requirements for this role.",
    matched_skills:
      matchedSkills.length > 0
        ? matchedSkills
        : ["Node.js", "RESTful APIs", "AWS", "Problem-solving"],
    missing_skills:
      missingSkills.length > 0 ? missingSkills : ["Java (Spring Boot)"],
    about_role: dbJob.about_role || "No job description provided.",
    external_apply_url: dbJob.external_apply_url || dbJob.source_url || "#",
    source_url: dbJob.source_url || dbJob.external_apply_url || "#",
    company_research: dbJob.company_research || null,
  };
}
