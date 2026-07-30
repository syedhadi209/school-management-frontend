"use client";

import { cn } from "@/lib/utils";

export function CapacityBar({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const ratio = capacity > 0 ? Math.min((enrolled / capacity) * 100, 100) : 0;
  const tone =
    ratio >= 85 ? "bg-red-500" : ratio >= 60 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="min-w-28">
      <p className="text-sm font-medium">
        {enrolled}/{capacity}
      </p>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}
