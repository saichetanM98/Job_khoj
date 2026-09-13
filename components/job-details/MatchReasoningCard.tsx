import React from "react";
import { Sparkles } from "lucide-react";

interface MatchReasoningCardProps {
  matchReason: string;
}

export function MatchReasoningCard({ matchReason }: MatchReasoningCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          AI MATCH REASONING
        </h2>
      </div>

      <p className="mt-4 text-sm text-text-dark leading-relaxed">
        {matchReason}
      </p>
    </div>
  );
}
