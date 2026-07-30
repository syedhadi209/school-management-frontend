"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TablePagination({
  page,
  total,
  pageSize = 20,
  hasNext,
  hasPrevious,
  onPageChange,
}: {
  page: number;
  total: number;
  pageSize?: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
      <p className="text-muted-foreground">
        Showing {from}-{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8")}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-12 text-center text-muted-foreground">Page {page}</span>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8")}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
