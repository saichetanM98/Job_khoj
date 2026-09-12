"use client";

import React from "react";
import { Search, Sparkles } from "lucide-react";

interface SearchControlsCardProps {
  jobTitle: string;
  location: string;
  onJobTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch?: () => void;
  statusMessage?: string | null;
  isLoading?: boolean;
}

export function SearchControlsCard({
  jobTitle,
  location,
  onJobTitleChange,
  onLocationChange,
  onSearch,
  statusMessage = "Found 8 jobs and saved 4 strong matches.",
  isLoading = false,
}: SearchControlsCardProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.();
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-end gap-4">
        {/* Job Title */}
        <div className="flex-1">
          <label
            htmlFor="job-title-input"
            className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-2"
          >
            JOB TITLE
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="job-title-input"
              type="text"
              value={jobTitle}
              onChange={(e) => onJobTitleChange(e.target.value)}
              placeholder="Frontend Engineer"
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex-1">
          <label
            htmlFor="location-input"
            className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-2"
          >
            LOCATION
          </label>
          <input
            id="location-input"
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Remote, New York..."
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
          />
        </div>

        {/* Find Jobs Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto h-[42px] flex items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-medium text-accent-foreground shadow-sm hover:bg-accent-dark transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                <span>Discovering...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Find Jobs</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success / Status Banner */}
      {statusMessage && (
        <div className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3 flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-[#009966] shrink-0" />
          <span className="text-sm font-medium text-[#065f46]">
            {statusMessage}
          </span>
        </div>
      )}
    </section>
  );
}
