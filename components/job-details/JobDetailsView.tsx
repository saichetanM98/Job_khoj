import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { JobDetails } from "@/types/job-details";
import { JobHeaderCard } from "./JobHeaderCard";
import { JobInfoCards } from "./JobInfoCards";
import { MatchReasoningCard } from "./MatchReasoningCard";
import { SkillsComparisonCard } from "./SkillsComparisonCard";
import { JobDescriptionCard } from "./JobDescriptionCard";
import { CompanyResearchCard } from "./CompanyResearchCard";

interface JobDetailsViewProps {
  job: JobDetails;
}

export function JobDetailsView({ job }: JobDetailsViewProps) {
  const applyUrl = job.external_apply_url || job.source_url || "#";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back to Jobs navigation link */}
      <div>
        <Link
          href="/find-jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Jobs
        </Link>
      </div>

      {/* 1. Job Header Card */}
      <JobHeaderCard
        title={job.title}
        company={job.company}
        matchScore={job.match_score}
        externalUrl={applyUrl}
      />

      {/* 2. Info Cards Row */}
      <JobInfoCards
        salary={job.salary}
        location={job.location}
        jobType={job.job_type}
        dateFound={job.date_found}
      />

      {/* 3. AI Match Reasoning Card */}
      <MatchReasoningCard matchReason={job.match_reason} />

      {/* 4. Required Skills vs Your Profile */}
      <SkillsComparisonCard
        matchedSkills={job.matched_skills}
        missingSkills={job.missing_skills}
      />

      {/* 5. Job Description Card */}
      <JobDescriptionCard
        description={job.about_role}
        externalUrl={applyUrl}
      />

      {/* 6. Company Research Card (Full 9-field dossier with Stagehand & fallback) */}
      <CompanyResearchCard
        jobId={job.id}
        company={job.company}
        initialDossier={job.company_research}
      />

      {/* 7. Bottom Apply Action Button */}
      <div>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 rounded-xl bg-accent text-accent-foreground font-semibold text-center hover:bg-accent-dark transition shadow-sm block text-sm sm:text-base"
        >
          Apply Now at {job.company}
        </a>
      </div>
    </div>
  );
}
