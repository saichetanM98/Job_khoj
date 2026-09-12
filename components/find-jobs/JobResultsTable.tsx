"use client";

import React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { JobListItem } from "@/types/find-jobs";
import { MatchScoreBar } from "@/components/find-jobs/MatchScoreBar";

interface JobResultsTableProps {
  jobs: JobListItem[];
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

function getVisiblePages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export function JobResultsTable({
  jobs,
  totalResults = 0,
  currentPage = 1,
  totalPages = 1,
  pageSize = 20,
  onPageChange,
  onClearFilters,
  hasActiveFilters = false,
}: JobResultsTableProps) {
  const startResult = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden" data-testid="job-results-container">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                COMPANY
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                ROLE
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                MATCH SCORE
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                SALARY EST.
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                DATE FOUND
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted text-sm">
                  <div className="space-y-2">
                    <p>No jobs found matching your search or filters.</p>
                    {hasActiveFilters && onClearFilters && (
                      <button
                        type="button"
                        onClick={onClearFilters}
                        className="inline-block text-xs font-semibold text-accent hover:text-accent-dark transition underline underline-offset-4 cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-surface-secondary/60 transition group cursor-pointer"
                >
                  {/* Company */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-surface-secondary border border-border flex items-center justify-center text-text-secondary shrink-0 group-hover:border-accent/40 transition">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <Link
                        href={`/find-jobs/${job.id}`}
                        className="font-semibold text-sm text-text-primary hover:text-accent transition"
                      >
                        {job.company}
                      </Link>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
                    <Link
                      href={`/find-jobs/${job.id}`}
                      className="hover:text-accent transition"
                    >
                      {job.role}
                    </Link>
                  </td>

                  {/* Match Score */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <MatchScoreBar score={job.match_score} />
                  </td>

                  {/* Salary Est. */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {job.salary_est}
                  </td>

                  {/* Date Found */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {job.date_found}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-text-secondary" data-testid="pagination-count-label">
          Showing <span className="font-semibold text-text-primary">{startResult}</span> to{" "}
          <span className="font-semibold text-text-primary">{endResult}</span> of{" "}
          <span className="font-semibold text-text-primary">{totalResults}</span> results
        </div>

        <div className="flex items-center gap-1.5" data-testid="pagination-controls">
          {/* Previous */}
          <button
            type="button"
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs sm:text-sm text-text-secondary hover:bg-surface-secondary transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Dynamic Page Buttons */}
          {totalPages <= 1 ? (
            <button
              type="button"
              disabled
              className="rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold border border-accent/60 bg-accent-light/30 text-accent"
            >
              1
            </button>
          ) : (
            visiblePages.map((page, idx) => {
              if (page === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-text-muted text-xs sm:text-sm select-none">
                    ...
                  </span>
                );
              }

              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange?.(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isCurrent
                      ? "border border-accent/60 bg-accent-light/30 text-accent"
                      : "border border-border bg-surface text-text-primary hover:bg-surface-secondary"
                  }`}
                >
                  {page}
                </button>
              );
            })
          )}

          {/* Next */}
          <button
            type="button"
            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || totalResults === 0}
            aria-label="Next page"
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs sm:text-sm text-text-primary hover:bg-surface-secondary transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
