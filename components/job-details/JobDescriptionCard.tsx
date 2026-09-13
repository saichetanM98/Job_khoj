"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface JobDescriptionCardProps {
  description: string;
  externalUrl?: string;
}

export function JobDescriptionCard({
  description,
  externalUrl,
}: JobDescriptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const text = description || "No job description available.";
  const isLong = text.length > 280;
  const isTruncatedByFeed = text.trim().endsWith("...") || text.trim().endsWith("…");

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <FileText className="h-5 w-5 text-text-secondary" />
        <h2 className="text-base font-bold text-text-primary">
          Job Description
        </h2>
      </div>

      <div className="relative">
        <div
          className={`text-sm text-text-dark leading-relaxed whitespace-pre-line transition-all duration-300 ${
            !isExpanded && isLong ? "max-h-32 overflow-hidden" : "max-h-none"
          }`}
        >
          {text}
        </div>

        {/* Gradient fade overlay when collapsed */}
        {!isExpanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / Collapse toggle button */}
      {isLong && (
        <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-dark transition cursor-pointer"
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Show more
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {/* Upstream feed truncation note */}
          {isTruncatedByFeed && externalUrl && isExpanded && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-accent font-medium transition"
            >
              <span>View complete posting on employer site</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
