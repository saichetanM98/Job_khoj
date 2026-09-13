import React from "react";
import { Building2, ExternalLink } from "lucide-react";

interface JobHeaderCardProps {
  title: string;
  company: string;
  matchScore: number;
  externalUrl?: string;
}

export function JobHeaderCard({
  title,
  company,
  matchScore,
  externalUrl,
}: JobHeaderCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl border border-border bg-surface-secondary flex items-center justify-center text-text-secondary shrink-0">
          <Building2 className="h-7 w-7 text-text-muted" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-semibold text-text-secondary">{company}</span>
            <span className="text-text-muted text-xs">•</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {matchScore}% Match Score
            </span>
          </div>
        </div>
      </div>

      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-sm font-semibold text-text-primary hover:bg-surface-secondary transition shadow-2xs shrink-0 self-start sm:self-center"
        >
          <ExternalLink className="h-4 w-4 text-text-dark" />
          View Job Post
        </a>
      )}
    </div>
  );
}
