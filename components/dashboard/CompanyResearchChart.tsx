"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Building2 } from "lucide-react";

export interface ResearchActivityDataPoint {
  day: string;
  count: number;
}

export const MOCK_RESEARCH_ACTIVITY: ResearchActivityDataPoint[] = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 5 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 8 },
  { day: "Fri", count: 12 },
  { day: "Sat", count: 4 },
  { day: "Sun", count: 1 },
];

interface CompanyResearchChartProps {
  data?: ResearchActivityDataPoint[];
}

export function CompanyResearchChart({
  data = MOCK_RESEARCH_ACTIVITY,
}: CompanyResearchChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEmpty = !data || data.length === 0 || data.every((d) => d.count === 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Company Research Activity
        </h2>
        <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
      </div>

      <div
        className="mt-6 w-full"
        style={{ height: 260, minHeight: 260, position: "relative" }}
      >
        {!mounted ? (
          <div className="flex h-[260px] w-full items-center justify-center">
            <div className="h-48 w-full animate-pulse rounded-lg bg-slate-50" />
          </div>
        ) : isEmpty ? (
          <div className="flex h-[260px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-slate-50/50 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-accent mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              No company research in the last 7 days
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">
              Research companies from your discovered jobs to generate AI briefings and track activity here.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260} minHeight={260}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax * 1.25))]}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const count = payload[0].value as number;
                    return (
                      <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
                        <p className="text-xs font-semibold text-slate-700">
                          {label}
                        </p>
                        <p className="text-xs font-medium text-accent">
                          {count} {count === 1 ? "researched" : "researched"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                fill="#5096FF"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
