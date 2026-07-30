"use client";

import { cn } from "@/lib/utils";

export interface StatusTab {
  key: string;
  label: string;
  count?: number;
}

export function StatusTabs({
  tabs,
  activeKey,
  onChange,
}: {
  tabs: StatusTab[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            activeKey === tab.key
              ? "bg-primary/10 text-primary border-primary/20"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px]">{tab.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
