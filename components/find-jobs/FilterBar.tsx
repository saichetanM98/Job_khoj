"use client";

import React from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { MatchFilterOption, SortOption } from "@/types/find-jobs";

interface FilterBarProps {
  searchFilter: string;
  onSearchFilterChange: (val: string) => void;
  matchFilter: MatchFilterOption;
  onMatchFilterChange: (val: MatchFilterOption) => void;
  sortBy: SortOption;
  onSortByChange: (val: SortOption) => void;
}

export function FilterBar({
  searchFilter,
  onSearchFilterChange,
  matchFilter,
  onMatchFilterChange,
  sortBy,
  onSortByChange,
}: FilterBarProps) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Search Input */}
      <div className="flex items-center gap-2.5 w-full sm:max-w-md relative">
        <Search className="h-4 w-4 text-text-muted shrink-0" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => onSearchFilterChange(e.target.value)}
          placeholder="Filter by company or role..."
          aria-label="Filter by company or role"
          data-testid="job-search-input"
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none pr-6"
        />
        {searchFilter && (
          <button
            type="button"
            onClick={() => onSearchFilterChange("")}
            className="absolute right-0 p-1 text-text-muted hover:text-text-primary transition"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Right Action Dropdowns */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {/* Match Score Filter */}
        <div className="relative">
          <select
            value={matchFilter}
            onChange={(e) => onMatchFilterChange(e.target.value as MatchFilterOption)}
            aria-label="Filter by match score"
            data-testid="match-filter-select"
            className="appearance-none rounded-lg border border-border bg-surface pl-3 pr-8 py-1.5 text-xs sm:text-sm font-medium text-text-primary hover:bg-surface-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition cursor-pointer"
          >
            <option value="all">All Matches</option>
            <option value="high">High Match (≥ 70%)</option>
            <option value="low">Low Match (&lt; 70%)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            aria-label="Sort jobs by"
            data-testid="sort-by-select"
            className="appearance-none rounded-lg border border-border bg-surface pl-3 pr-8 py-1.5 text-xs sm:text-sm font-medium text-text-primary hover:bg-surface-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition cursor-pointer"
          >
            <option value="match-score">Match Score</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
        </div>
      </div>
    </div>
  );
}
