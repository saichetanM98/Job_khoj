"use client";

import React from "react";

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeLabel?: string;
  sublabel?: string;
}

export const MOCK_STATS: StatItem[] = [
  {
    id: "total_jobs",
    title: "Total Jobs Found",
    value: "284",
    change: "+12%",
    changeLabel: "vs last week",
  },
  {
    id: "avg_match_rate",
    title: "Avg. Match Rate",
    value: "82%",
    change: "+3%",
    changeLabel: "vs last week",
  },
  {
    id: "companies_researched",
    title: "Companies Researched",
    value: "35",
    sublabel: "Total researched",
  },
  {
    id: "jobs_this_week",
    title: "Jobs This Week",
    value: "28",
    sublabel: "New this week",
  },
];

interface StatCardsProps {
  stats?: StatItem[];
}

export function StatCards({ stats = MOCK_STATS }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500">{stat.title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {stat.value}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {stat.change ? (
              <>
                <span className="inline-flex items-center rounded-full bg-[#e6f4ea] px-2 py-0.5 text-xs font-semibold text-[#137333]">
                  {stat.change}
                </span>
                {stat.changeLabel && (
                  <span className="text-xs text-slate-400">
                    {stat.changeLabel}
                  </span>
                )}
              </>
            ) : stat.sublabel ? (
              <span className="text-xs text-slate-400">{stat.sublabel}</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
