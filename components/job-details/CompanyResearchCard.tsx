"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Layers,
  HeartHandshake,
  TrendingUp,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { CompanyDossier } from "@/types/company-research";

interface CompanyResearchCardProps {
  jobId: string;
  company: string;
  initialDossier?: CompanyDossier | null;
}

export function CompanyResearchCard({
  jobId,
  company,
  initialDossier,
}: CompanyResearchCardProps) {
  const [dossier, setDossier] = useState<CompanyDossier | null>(initialDossier || null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stages = [
    "Resolving company domain & redirects...",
    "Browsing public company pages via Stagehand...",
    "Synthesizing candidate briefing & edge analysis...",
  ];

  // Check demo session cache on mount if initialDossier wasn't provided
  useEffect(() => {
    if (!dossier && typeof window !== "undefined") {
      const cached = sessionStorage.getItem(`jobpilot_demo_research_${jobId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.companyOverview) {
            setDossier(parsed);
          }
        } catch {
          // Ignore invalid cache
        }
      }
    }
  }, [jobId, dossier]);

  // Handle stage transitions during loading
  useEffect(() => {
    if (!loading) {
      setLoadingStage(0);
      return;
    }

    const t1 = setTimeout(() => setLoadingStage(1), 3500);
    const t2 = setTimeout(() => setLoadingStage(2), 12000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading]);

  const handleTriggerResearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.dossier) {
        throw new Error(data.error || "Failed to generate company research.");
      }

      setDossier(data.dossier);

      // Cache demo jobs in session storage to prevent redundant re-runs
      if (
        (jobId.startsWith("demo-") || jobId === "demo-backend-developer") &&
        typeof window !== "undefined"
      ) {
        sessionStorage.setItem(
          `jobpilot_demo_research_${jobId}`,
          JSON.stringify(data.dossier)
        );
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while researching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-accent shrink-0 border border-purple-100">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Company Research
            </h2>
            <p className="text-xs text-text-secondary">
              Autonomous briefing on {company}
            </p>
          </div>
        </div>

        {dossier && !loading ? (
          <button
            type="button"
            onClick={handleTriggerResearch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-text-secondary text-xs font-semibold hover:bg-surface-secondary hover:text-text-primary transition shadow-2xs cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-run Research
          </button>
        ) : !loading ? (
          <button
            type="button"
            onClick={handleTriggerResearch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent-dark transition shadow-sm cursor-pointer shrink-0"
          >
            <Search className="h-4 w-4" />
            Research Company
          </button>
        ) : null}
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleTriggerResearch}
            className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-semibold hover:bg-red-200 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* State 1: Loading Progress State */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto animate-in fade-in duration-300">
          <div className="relative mb-5">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-accent">
              <Loader2 className="h-7 w-7 animate-spin text-accent" />
            </div>
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
              <Sparkles className="h-3 w-3" />
            </div>
          </div>

          <h3 className="text-sm font-bold text-text-primary mb-1.5">
            Researching {company}...
          </h3>
          <p className="text-xs text-accent font-medium mb-4 min-h-[1.25rem] transition-all">
            {stages[loadingStage]}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {stages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === loadingStage
                    ? "w-6 bg-accent"
                    : idx < loadingStage
                    ? "w-2 bg-emerald-500"
                    : "w-2 bg-border"
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-text-muted mt-3">
            Browsing public pages & compiling structured dossier...
          </p>
        </div>
      )}

      {/* State 2: Empty State */}
      {!dossier && !loading && (
        <div className="py-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="h-12 w-12 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-text-muted mb-4">
            <Building2 className="h-6 w-6 text-text-muted" />
          </div>
          <p className="text-sm font-bold text-text-primary mb-1">
            No research yet
          </p>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mb-4">
            Click &ldquo;Research Company&rdquo; to let the AI browse {company}&apos;s public pages and build a tailored candidate briefing.
          </p>
          <button
            type="button"
            onClick={handleTriggerResearch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-secondary border border-border text-text-primary text-xs font-semibold hover:bg-border transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Start Autonomous Research
          </button>
        </div>
      )}

      {/* State 3: Full 9-Field Dossier View */}
      {dossier && !loading && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-300">
          {/* 1. Company Overview & 4. Why This Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-secondary/50 border border-border/70 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <Building2 className="h-3.5 w-3.5 text-accent" />
                <span>Company Overview</span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">
                {dossier.companyOverview}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-secondary/50 border border-border/70 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                <span>Why This Role</span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">
                {dossier.whyThisRole}
              </p>
            </div>
          </div>

          {/* 2. Tech Stack & 3. Culture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tech Stack */}
            <div className="p-4 rounded-xl bg-surface-secondary/50 border border-border/70 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                <span>Tech Stack</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dossier.techStack && dossier.techStack.length > 0 ? (
                  dossier.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-medium text-text-primary shadow-2xs"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-muted">No tech stack details detected</span>
                )}
              </div>
            </div>

            {/* Culture & Values */}
            <div className="p-4 rounded-xl bg-surface-secondary/50 border border-border/70 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <HeartHandshake className="h-3.5 w-3.5 text-rose-500" />
                <span>Culture & Values</span>
              </div>
              <ul className="space-y-1.5">
                {dossier.culture && dossier.culture.length > 0 ? (
                  dossier.culture.map((c, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-text-muted">No culture details detected</li>
                )}
              </ul>
            </div>
          </div>

          {/* 5. Your Edge & 6. Gaps to Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Your Edge (Green Highlight) */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span>Your Edge in this Role</span>
              </div>
              <ul className="space-y-2">
                {dossier.yourEdge && dossier.yourEdge.length > 0 ? (
                  dossier.yourEdge.map((edge, i) => (
                    <li key={i} className="text-xs text-emerald-950 font-medium flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{edge}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-emerald-900/70">Strong general background for core requirements</li>
                )}
              </ul>
            </div>

            {/* Gaps to Address (Strategic lavender framing) */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-900">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>Gaps to Address (Strategy)</span>
              </div>
              <ul className="space-y-2">
                {dossier.gapsToAddress && dossier.gapsToAddress.length > 0 ? (
                  dossier.gapsToAddress.map((gap, i) => (
                    <li key={i} className="text-xs text-purple-950 flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-purple-900/70">No critical technical gaps identified</li>
                )}
              </ul>
            </div>
          </div>

          {/* 7. Smart Questions & 8. Interview Prep */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Smart Questions */}
            <div className="p-4 rounded-xl bg-surface-secondary/50 border border-border/70 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                <span>Smart Questions to Ask</span>
              </div>
              <ul className="space-y-2">
                {dossier.smartQuestions && dossier.smartQuestions.length > 0 ? (
                  dossier.smartQuestions.map((q, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-accent font-bold">Q{i + 1}.</span>
                      <span className="italic">{q}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-text-muted">No custom questions generated</li>
                )}
              </ul>
            </div>

            {/* Interview Prep */}
            <div className="p-4 rounded-xl bg-surface-secondary/50 border border-border/70 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Interview Preparation Topics</span>
              </div>
              <ul className="space-y-2">
                {dossier.interviewPrep && dossier.interviewPrep.length > 0 ? (
                  dossier.interviewPrep.map((prep, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{prep}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-text-muted">Review core fundamentals for role</li>
                )}
              </ul>
            </div>
          </div>

          {/* 9. Sources Footer */}
          {dossier.sources && dossier.sources.length > 0 && (
            <div className="pt-2 border-t border-border flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
              <span className="font-medium">Sources:</span>
              {dossier.sources.map((src, i) => {
                const isUrl = src.startsWith("http");
                return isUrl ? (
                  <a
                    key={i}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    <span>{src.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ) : (
                  <span key={i} className="text-text-secondary">
                    {src}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
