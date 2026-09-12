export interface JobListItem {
  id: string;
  company: string;
  role: string;
  match_score: number;
  salary_est: string;
  date_found: string;
  found_at?: string;
  location?: string;
  source?: "search" | "url";
}

export type MatchFilterOption = "all" | "high" | "low" | "strong" | "good";
export type SortOption = "match-score" | "newest" | "oldest" | "date" | "salary";

export const MOCK_JOBS: JobListItem[] = [
  {
    id: "job-1",
    company: "Vercel",
    role: "Senior Frontend Engineer",
    match_score: 94,
    salary_est: "$160k - $200k",
    date_found: "2 hours ago",
    location: "Remote, US",
    source: "search",
  },
  {
    id: "job-2",
    company: "Stripe",
    role: "Staff UI Engineer",
    match_score: 88,
    salary_est: "$180k - $240k",
    date_found: "Yesterday",
    location: "San Francisco, CA (Hybrid)",
    source: "search",
  },
  {
    id: "job-3",
    company: "Linear",
    role: "Product Engineer",
    match_score: 96,
    salary_est: "$150k - $190k",
    date_found: "Yesterday",
    location: "Remote, Worldwide",
    source: "search",
  },
  {
    id: "job-4",
    company: "Notion",
    role: "Frontend Developer",
    match_score: 72,
    salary_est: "$130k - $170k",
    date_found: "2 days ago",
    location: "New York, NY",
    source: "search",
  },
  {
    id: "job-5",
    company: "OpenAI",
    role: "Design Engineer",
    match_score: 91,
    salary_est: "$200k - $280k",
    date_found: "3 days ago",
    location: "San Francisco, CA",
    source: "search",
  },
  {
    id: "job-6",
    company: "Figma",
    role: "Software Engineer, Editor",
    match_score: 85,
    salary_est: "$170k - $220k",
    date_found: "4 days ago",
    location: "San Francisco, CA",
    source: "search",
  },
  // Additional mock items for multi-page demonstration
  {
    id: "job-7",
    company: "Supabase",
    role: "Full Stack Engineer",
    match_score: 89,
    salary_est: "$140k - $180k",
    date_found: "5 days ago",
    location: "Remote, Worldwide",
    source: "search",
  },
  {
    id: "job-8",
    company: "Tailwind Labs",
    role: "Senior Design Technologist",
    match_score: 93,
    salary_est: "$155k - $195k",
    date_found: "6 days ago",
    location: "Remote, North America",
    source: "search",
  },
];
