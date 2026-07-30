"use client";

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FormModal({
  open,
  title,
  description,
  loading,
  submitLabel,
  error,
  onOpenChange,
  onSubmit,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  loading?: boolean;
  submitLabel: string;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-5 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
        <div className="space-y-5 py-1">{children}</div>
        <DialogFooter>
          <button
            type="button"
            className={buttonVariants({ variant: "outline" })}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "default" }), "btn-cta min-w-24")}
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : submitLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
