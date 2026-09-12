"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { SearchControlsCard } from "@/components/find-jobs/SearchControlsCard";
import { FilterBar } from "@/components/find-jobs/FilterBar";
import { JobResultsTable } from "@/components/find-jobs/JobResultsTable";
import { JobListItem, MatchFilterOption, SortOption } from "@/types/find-jobs";
import { insforge } from "@/lib/insforge-client";

function formatRelativeDate(isoString?: string): string {
  if (!isoString) return "Recently";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function mapDbJobToListItem(dbJob: any): JobListItem {
  const rawDate = dbJob.found_at || dbJob.created_at || new Date().toISOString();

  return {
    id: dbJob.id,
    company: dbJob.company || "Unknown Company",
    role: dbJob.title || "Job Listing",
    match_score: typeof dbJob.match_score === "number" ? dbJob.match_score : 50,
    salary_est: dbJob.salary || "Not specified",
    date_found: formatRelativeDate(rawDate),
    found_at: rawDate,
    location: dbJob.location || "Remote",
    source: (dbJob.source as "search" | "url") || "search",
  };
}

interface FindJobsClientProps {
  initialJobs?: any[];
  userId?: string;
}

export function FindJobsClient({ initialJobs, userId }: FindJobsClientProps) {
  // Search Controls state
  const [jobTitle, setJobTitle] = useState("Frontend Engineer");
  const [location, setLocation] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter Bar state
  const [searchFilter, setSearchFilter] = useState("");
  const [matchFilter, setMatchFilter] = useState<MatchFilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("match-score");

  // Jobs data
  const [allJobs, setAllJobs] = useState<JobListItem[]>(() => {
    if (initialJobs && initialJobs.length > 0) {
      return initialJobs.map(mapDbJobToListItem);
    }
    return [];
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Load existing jobs from InsForge DB
  const loadExistingJobs = useCallback(async () => {
    try {
      let query = insforge.database
        .from("jobs")
        .select("*");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.order("found_at", { ascending: false });

      if (error) {
        console.error("[FindJobsClient] Error loading existing jobs:", error);
        return;
      }

      if (data && data.length > 0) {
        const mapped = data.map(mapDbJobToListItem);
        setAllJobs(mapped);
      }
    } catch (err) {
      console.error("[FindJobsClient] Failed to load jobs:", err);
    }
  }, [userId]);

  useEffect(() => {
    loadExistingJobs();
  }, [loadExistingJobs]);

  // Execute job discovery via /api/agent/find
  const handleSearch = async () => {
    if (!jobTitle.trim()) {
      setStatusMessage("Please enter a job title to search.");
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Searching Adzuna for "${jobTitle.trim()}" in "${location.trim() || "all locations"}"...`);

    try {
      const res = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          location: location.trim(),
          country: "us",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusMessage(`Search failed: ${data.error || "Unable to complete discovery."}`);
        return;
      }

      const stats = data.stats;
      const providerBreakdown = stats?.jobs_scored_groq > 0
        ? `Groq AI (${stats.jobs_scored_groq})`
        : stats?.jobs_scored_gemini > 0
        ? `Gemini AI (${stats.jobs_scored_gemini})`
        : `Heuristic Matching (${stats?.jobs_fallback_scored || 0})`;

      const fallbackNote = stats?.used_fallback ? " (via curated fallback dataset)" : "";

      setStatusMessage(
        `Discovered ${stats?.jobs_returned_by_api || 0} job(s)${fallbackNote}. Saved ${stats?.new_jobs_saved || 0} new match(es). Scored via ${providerBreakdown}.`
      );

      // Refresh jobs from DB and reset page to 1
      setCurrentPage(1);
      await loadExistingJobs();
    } catch (err: any) {
      setStatusMessage(`Network error during discovery: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page whenever search or filters change
  const handleSearchFilterChange = (val: string) => {
    setSearchFilter(val);
    setCurrentPage(1);
  };

  const handleMatchFilterChange = (val: MatchFilterOption) => {
    setMatchFilter(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (val: SortOption) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchFilter("");
    setMatchFilter("all");
    setSortBy("match-score");
    setCurrentPage(1);
  };

  // Filter & Sort jobs dynamically
  const filteredAndSortedJobs = useMemo(() => {
    let result = [...allJobs];

    // 1. Text search: filter by company name or job title (case insensitive)
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      result = result.filter(
        (j) => j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q)
      );
    }

    // 2. Filter by match score:
    // - High Match filter: match_score >= 70
    // - Low Match filter: match_score < 70
    // - All Matches: all jobs
    if (matchFilter === "high" || matchFilter === "strong") {
      result = result.filter((j) => j.match_score >= 70);
    } else if (matchFilter === "low" || matchFilter === "good") {
      result = result.filter((j) => j.match_score < 70);
    }

    // 3. Sort:
    // - Match Score: order by match_score descending
    // - Newest: order by found_at descending
    // - Oldest: order by found_at ascending
    if (sortBy === "match-score") {
      result.sort((a, b) => {
        if (b.match_score !== a.match_score) {
          return b.match_score - a.match_score;
        }
        const timeA = a.found_at ? new Date(a.found_at).getTime() : 0;
        const timeB = b.found_at ? new Date(b.found_at).getTime() : 0;
        return timeB - timeA;
      });
    } else if (sortBy === "newest" || sortBy === "date") {
      result.sort((a, b) => {
        const timeA = a.found_at ? new Date(a.found_at).getTime() : 0;
        const timeB = b.found_at ? new Date(b.found_at).getTime() : 0;
        return timeB - timeA;
      });
    } else if (sortBy === "oldest") {
      result.sort((a, b) => {
        const timeA = a.found_at ? new Date(a.found_at).getTime() : 0;
        const timeB = b.found_at ? new Date(b.found_at).getTime() : 0;
        return timeA - timeB;
      });
    } else if (sortBy === "salary") {
      const parseSalary = (s: string) => parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
      result.sort((a, b) => parseSalary(b.salary_est) - parseSalary(a.salary_est));
    }

    return result;
  }, [allJobs, searchFilter, matchFilter, sortBy]);

  // Paginated view: exactly 20 jobs per page as per specification
  const pageSize = 20;
  const totalResults = filteredAndSortedJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const paginatedJobs = filteredAndSortedJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Top Search Controls Card */}
      <SearchControlsCard
        jobTitle={jobTitle}
        location={location}
        onJobTitleChange={setJobTitle}
        onLocationChange={setLocation}
        onSearch={handleSearch}
        statusMessage={statusMessage}
        isLoading={isLoading}
      />

      {/* Middle Filter Bar */}
      <FilterBar
        searchFilter={searchFilter}
        onSearchFilterChange={handleSearchFilterChange}
        matchFilter={matchFilter}
        onMatchFilterChange={handleMatchFilterChange}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
      />

      {/* Jobs Results Table */}
      <JobResultsTable
        jobs={paginatedJobs}
        totalResults={totalResults}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onClearFilters={handleClearFilters}
        hasActiveFilters={Boolean(searchFilter || matchFilter !== "all")}
      />
    </div>
  );
}
