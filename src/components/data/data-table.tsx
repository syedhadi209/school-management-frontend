"use client";

import type { ReactNode } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DataTableShell({
  title,
  count,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onCreate,
  createLabel,
  toolbarExtra,
  children,
}: {
  title: string;
  count: number;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  toolbarExtra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold tabular-nums text-primary">
            {count}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-52 rounded-xl border-border/80 bg-background pl-9 text-sm shadow-none transition-colors focus-visible:ring-primary/20 sm:w-60"
            />
          </div>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "h-9 gap-1.5 rounded-xl border-border/80 bg-background px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            Filter
          </button>
          {toolbarExtra}
          {onCreate ? (
            <button
              type="button"
              onClick={onCreate}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground",
                "shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_-4px_color-mix(in_oklch,var(--primary)_45%,transparent)]",
                "transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_2px_8px_-2px_color-mix(in_oklch,var(--primary)_50%,transparent)]",
                "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-md bg-white/20">
                <Plus className="size-3.5" strokeWidth={2.75} />
              </span>
              {createLabel ?? "Create"}
            </button>
          ) : null}
        </div>
      </div>
      <div className="p-0">{children}</div>
    </div>
  );
}
