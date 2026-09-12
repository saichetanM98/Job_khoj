"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CompletionBannerProps {
  percentage?: number;
  missingFields?: string[];
}

export function CompletionBanner({
  percentage = 70,
  missingFields = ["PHONE", "LOCATION", "EDUCATION"],
}: CompletionBannerProps) {
  // SVG Progress Ring calculations
  const size = 88;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isComplete = percentage >= 100 && missingFields.length === 0;

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-error shrink-0" />
          )}
          <h2 className="text-lg font-bold text-text-primary">
            {isComplete ? "Profile complete & ready" : "Profile needs attention"}
          </h2>
        </div>
        <p className="mt-1.5 text-sm text-text-secondary max-w-xl">
          {isComplete
            ? "All essential profile fields are complete. Your tailored job recommendations and generated resumes will reflect your full experience."
            : "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes."}
        </p>

        {missingFields.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {missingFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#e11d48] bg-[#fff1f2] border border-[#fecdd3]"
              >
                {field}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-success-foreground bg-success-lightest border border-success-light">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All essential details filled
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center shrink-0 self-center md:self-auto">
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
            aria-label={`Profile completion: ${percentage}%`}
          >
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isComplete ? "#10b981" : "#ef4444"}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-xl font-bold tracking-tight ${
                isComplete ? "text-success" : "text-text-primary"
              }`}
            >
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
