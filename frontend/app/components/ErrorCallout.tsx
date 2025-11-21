import React from "react";

interface ErrorCalloutProps {
  message: string;
}

export function ErrorCallout({ message }: ErrorCalloutProps) {
  return (
    <div className="w-full max-w-xl rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      <p className="font-semibold text-rose-100">Something went wrong</p>
      <p className="mt-1 text-rose-200/80">{message}</p>
    </div>
  );
}
