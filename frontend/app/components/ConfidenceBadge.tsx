import React from "react";

interface ConfidenceBadgeProps {
  value?: number | null;
}

export function ConfidenceBadge({ value }: ConfidenceBadgeProps) {
  if (value == null) {
    return null;
  }

  const normalized = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(normalized * 100);

  return (
    <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
      {percent}% confidence
    </span>
  );
}
