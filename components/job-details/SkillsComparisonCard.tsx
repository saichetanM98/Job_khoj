import React from "react";
import { Check, X } from "lucide-react";

interface SkillsComparisonCardProps {
  matchedSkills: string[];
  missingSkills: string[];
}

export function SkillsComparisonCard({
  matchedSkills,
  missingSkills,
}: SkillsComparisonCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-5">
      <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
        REQUIRED SKILLS VS YOUR PROFILE
      </h2>

      {/* You have section */}
      <div>
        <p className="text-xs font-medium text-text-secondary mb-2.5">
          You have
        </p>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.length > 0 ? (
            matchedSkills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80"
              >
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                {skill}
              </span>
            ))
          ) : (
            <span className="text-xs text-text-muted italic">
              No matching skills identified
            </span>
          )}
        </div>
      </div>

      {/* Gap skills section */}
      <div>
        <p className="text-xs font-medium text-text-secondary mb-2.5">
          Gap skills
        </p>
        <div className="flex flex-wrap gap-2">
          {missingSkills.length > 0 ? (
            missingSkills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f5f3ff] text-accent-dark border border-purple-200/80"
              >
                <X className="h-3.5 w-3.5 text-accent stroke-[2.5]" />
                {skill}
              </span>
            ))
          ) : (
            <span className="text-xs text-text-muted italic">
              No skill gaps found
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
