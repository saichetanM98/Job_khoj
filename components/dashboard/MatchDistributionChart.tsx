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
import { BarChart3 } from "lucide-react";

export interface MatchDistributionDataPoint {
  range: string;
  count: number;
}

export const MOCK_MATCH_DISTRIBUTION: MatchDistributionDataPoint[] = [
  { range: "50-60%", count: 5 },
  { range: "60-70%", count: 15 },
  { range: "70-80%", count: 45 },
  { range: "80-90%", count: 85 },
  { range: "90-100%", count: 35 },
];

interface MatchDistributionChartProps {
  data?: MatchDistributionDataPoint[];
}

export function MatchDistributionChart({
  data = MOCK_MATCH_DISTRIBUTION,
}: MatchDistributionChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEmpty = !data || data.length === 0 || data.every((d) => d.count === 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Match Score Distribution
        </h2>
        <span className="text-xs text-slate-400 font-medium">All Jobs</span>
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              No match scores recorded yet
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">
              Discovered jobs scored by AI will be categorized into match ranges here.
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
                dataKey="range"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
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
                cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const count = payload[0].value as number;
                    return (
                      <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
                        <p className="text-xs font-semibold text-slate-700">
                          Match: {label}
                        </p>
                        <p className="text-xs font-medium text-emerald-600">
                          {count} {count === 1 ? "job" : "jobs"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                fill="#10B981"
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
