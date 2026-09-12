export interface WorkExperienceRole {
  company: string;
  job_title: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  responsibilities: string;
}

export interface EducationRecord {
  highest_degree: string;
  field_of_study: string;
  institution: string;
  graduation_year: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: WorkExperienceRole[] | null;
  education: EducationRecord | null;
  job_titles_seeking: string[] | null;
  remote_preference: string | null;
  preferred_locations: string[] | null;
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url: string | null;
  is_complete: boolean;
  created_at?: string;
  updated_at?: string;
}
