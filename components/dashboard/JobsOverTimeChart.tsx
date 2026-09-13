"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";

export interface JobsOverTimeDataPoint {
  day: string;
  count: number;
}

export const MOCK_JOBS_OVER_TIME: JobsOverTimeDataPoint[] = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 45 },
  { day: "Wed", count: 32 },
  { day: "Thu", count: 60 },
  { day: "Fri", count: 85 },
  { day: "Sat", count: 40 },
  { day: "Sun", count: 10 },
];

interface JobsOverTimeChartProps {
  data?: JobsOverTimeDataPoint[];
}

export function JobsOverTimeChart({
  data = MOCK_JOBS_OVER_TIME,
}: JobsOverTimeChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEmpty = !data || data.length === 0 || data.every((d) => d.count === 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Jobs Found Over Time
        </h2>
        <span className="text-xs text-slate-400 font-medium">Last 30 Days</span>
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              No jobs found in the last 30 days
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">
              Run a job search to see your discovery timeline and trends plotted here.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260} minHeight={260}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="jobsFoundGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                interval="preserveStartEnd"
                minTickGap={24}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(5, Math.ceil(dataMax * 1.25))]}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const count = payload[0].value as number;
                    return (
                      <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
                        <p className="text-xs font-semibold text-slate-700">
                          {label}
                        </p>
                        <p className="text-xs font-medium text-purple-600">
                          {count} {count === 1 ? "job found" : "jobs found"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#7C3AED"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#jobsFoundGradient)"
                isAnimationActive={false}
                activeDot={{
                  r: 5,
                  fill: "#7C3AED",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
