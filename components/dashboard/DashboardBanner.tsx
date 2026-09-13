"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

interface DashboardBannerProps {
  percentage: number;
  missingFields: string[];
}

export function DashboardBanner({
  percentage,
  missingFields,
}: DashboardBannerProps) {
  // If complete, no banner needed on dashboard
  if (percentage >= 100 && missingFields.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/60 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Your profile is {percentage}% complete
              </h3>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                Attention needed
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600">
              Complete missing fields ({missingFields.join(", ") || "General info"}) to unlock more accurate AI job matches.
            </p>
          </div>
        </div>

        <Link
          href="/profile"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-amber-700 sm:self-center shrink-0"
        >
          Complete Profile
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
