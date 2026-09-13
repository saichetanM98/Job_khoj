"use client";

import React from "react";
import { StatCards, StatItem } from "./StatCards";
import { RecentActivityCard, ActivityItem } from "./RecentActivityCard";
import { CompanyResearchChart, ResearchActivityDataPoint } from "./CompanyResearchChart";
import { JobsOverTimeChart, JobsOverTimeDataPoint } from "./JobsOverTimeChart";
import { MatchDistributionChart, MatchDistributionDataPoint } from "./MatchDistributionChart";
import { DashboardBanner } from "./DashboardBanner";

interface DashboardClientProps {
  completeness?: {
    percentage: number;
    missing: string[];
  };
  stats?: StatItem[];
  activities?: ActivityItem[];
  jobsOverTime?: JobsOverTimeDataPoint[];
  matchDistribution?: MatchDistributionDataPoint[];
  researchActivity?: ResearchActivityDataPoint[];
}

export function DashboardClient({
  completeness,
  stats,
  activities,
  jobsOverTime,
  matchDistribution,
  researchActivity,
}: DashboardClientProps) {
  return (
    <div className="space-y-6">
      {/* 1. Incomplete Profile Banner (if applicable) */}
      {completeness && completeness.percentage < 100 && (
        <DashboardBanner
          percentage={completeness.percentage}
          missingFields={completeness.missing}
        />
      )}

      {/* 2. Top 4 Stat Cards */}
      <StatCards stats={stats} />

      {/* 3. Middle Row: Recent Activity & Company Research Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <RecentActivityCard activities={activities} />
        </div>
        <div className="min-w-0">
          <CompanyResearchChart data={researchActivity} />
        </div>
      </div>

      {/* 4. Bottom Row: Jobs Found Over Time (wide) & Match Score Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 min-w-0">
          <JobsOverTimeChart data={jobsOverTime} />
        </div>
        <div className="lg:col-span-5 min-w-0">
          <MatchDistributionChart data={matchDistribution} />
        </div>
      </div>
    </div>
  );
}
