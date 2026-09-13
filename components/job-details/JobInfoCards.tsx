import React from "react";
import { DollarSign, MapPin, Briefcase, Calendar } from "lucide-react";

interface JobInfoCardsProps {
  salary: string;
  location: string;
  jobType: string;
  dateFound: string;
}

export function JobInfoCards({
  salary,
  location,
  jobType,
  dateFound,
}: JobInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Salary Card */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">
            {salary || "$101k – $101k"}
          </p>
          <p className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mt-0.5">
            SALARY EST.
          </p>
        </div>
      </div>

      {/* Location Card */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary truncate" title={location}>
            {location || "Remote"}
          </p>
          <p className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mt-0.5">
            LOCATION
          </p>
        </div>
      </div>

      {/* Job Type Card */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-xl bg-purple-50 text-accent flex items-center justify-center shrink-0">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">
            {jobType || "—"}
          </p>
          <p className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mt-0.5">
            JOB TYPE
          </p>
        </div>
      </div>

      {/* Date Found Card */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center shrink-0">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">
            {dateFound || "1 hour ago"}
          </p>
          <p className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mt-0.5">
            DATE FOUND
          </p>
        </div>
      </div>
    </div>
  );
}
