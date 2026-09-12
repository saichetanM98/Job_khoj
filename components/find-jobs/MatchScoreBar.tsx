import React from "react";

interface MatchScoreBarProps {
  score: number;
}

export function MatchScoreBar({ score }: MatchScoreBarProps) {
  // Determine color matching find-jobs.png
  let fillColor = "#10b981"; // Emerald green for 90%+
  if (score >= 80 && score < 90) {
    fillColor = "#2b7fff"; // Info blue for 80-89%
  } else if (score < 80) {
    fillColor = "#ff8904"; // Warning orange for <80%
  }

  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 sm:w-28 h-1.5 bg-[#e7eaf3] rounded-full overflow-hidden shrink-0">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedScore}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
      <span className="text-sm font-semibold text-text-primary tabular-nums min-w-[32px]">
        {clampedScore}%
      </span>
    </div>
  );
}
