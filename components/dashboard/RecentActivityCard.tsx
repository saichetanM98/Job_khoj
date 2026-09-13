"use client";

import React from "react";

import { Clock } from "lucide-react";

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  dotColor: "purple" | "blue" | "green";
}

export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    title: "Found 8 jobs for Frontend Engineer",
    timestamp: "10 mins ago",
    dotColor: "purple",
  },
  {
    id: "act-2",
    title: "Researched Stripe",
    timestamp: "1 hour ago",
    dotColor: "blue",
  },
  {
    id: "act-3",
    title: "Found 12 jobs for React Developer",
    timestamp: "2 hours ago",
    dotColor: "green",
  },
  {
    id: "act-4",
    title: "Researched Vercel",
    timestamp: "Yesterday",
    dotColor: "purple",
  },
  {
    id: "act-5",
    title: "Found 10 jobs for Full Stack Engineer",
    timestamp: "Yesterday",
    dotColor: "green",
  },
];

interface RecentActivityCardProps {
  activities?: ActivityItem[];
}

const DOT_STYLES: Record<
  ActivityItem["dotColor"],
  { background: string; boxShadow: string }
> = {
  purple: {
    background: "#8B5CF6",
    boxShadow: "0 0 0 4px #EDE9FE",
  },
  blue: {
    background: "#3B82F6",
    boxShadow: "0 0 0 4px #DBEAFE",
  },
  green: {
    background: "#10B981",
    boxShadow: "0 0 0 4px #D1FAE5",
  },
};

export function RecentActivityCard({
  activities = MOCK_ACTIVITIES,
}: RecentActivityCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Recent Activity
        </h2>
        {activities.length > 0 && (
          <span className="text-xs font-medium text-slate-400">
            {activities.length} action{activities.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="my-auto flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Clock className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            No activity yet
          </p>
          <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
            Run a job search or research a company to build your activity timeline here.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex-1 space-y-6">
          {activities.map((item, idx) => {
            const isLast = idx === activities.length - 1;
            const dotStyle = DOT_STYLES[item.dotColor] || DOT_STYLES.blue;

            return (
              <div key={item.id} className="relative flex items-start gap-4">
                {/* Connecting line */}
                {!isLast && (
                  <div
                    className="absolute"
                    style={{
                      left: "5px",
                      top: "16px",
                      bottom: "-24px",
                      width: "2px",
                      backgroundColor: "#E2E8F0",
                    }}
                    aria-hidden="true"
                  />
                )}

                {/* Colored Dot with pastel ring */}
                <div className="relative z-10 mt-1 flex h-3 w-3 shrink-0 items-center justify-center">
                  <span
                    className="block h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: dotStyle.background,
                      boxShadow: dotStyle.boxShadow,
                    }}
                  />
                </div>

                {/* Text content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
