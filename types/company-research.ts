export interface CompanyDossier {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
}

export type ResearchFailureReason =
  | "no_browserbase_key"
  | "bot_detected"
  | "timeout"
  | "redirect_unresolved"
  | "empty_page"
  | "session_quota_exceeded"
  | "stagehand_extraction_failed"
  | "stagehand_llm_unsupported"
  | null;

export interface ResearchAgentResult {
  success: boolean;
  dossier: CompanyDossier;
  usedFallback: boolean;
  failureReason: ResearchFailureReason;
  pagesVisited: number;
  resolvedDomain?: string;
  error?: string;
}

export interface ResearchAgentRequest {
  jobId: string;
}
