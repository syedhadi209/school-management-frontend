"use client";

import type { ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";
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

export type FormModalStep = {
  id: string;
  label: string;
};

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
  steps,
  currentStep = 0,
  onStepChange,
  onBack,
  showBack = false,
  backLabel = "Back",
  contentClassName,
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
  steps?: FormModalStep[];
  currentStep?: number;
  onStepChange?: (index: number) => void;
  onBack?: () => void;
  showBack?: boolean;
  backLabel?: string;
  contentClassName?: string;
}) {
  const hasSteps = Boolean(steps && steps.length > 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto p-5 sm:max-w-xl",
          hasSteps && "min-h-[34rem]",
          contentClassName
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {hasSteps ? (
          <nav aria-label="Form steps" className="flex items-center gap-2">
            {steps!.map((step, index) => {
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              const canJump = isComplete || index === currentStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!canJump || !onStepChange}
                  onClick={() => {
                    if (canJump && onStepChange) onStepChange(index);
                  }}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors",
                    isActive && "border-primary/40 bg-primary/10 text-foreground",
                    isComplete && "border-emerald-200 bg-emerald-50 text-emerald-900",
                    !isActive && !isComplete && "border-border bg-muted/40 text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]",
                      isActive && "bg-primary text-primary-foreground",
                      isComplete && "bg-emerald-600 text-white",
                      !isActive && !isComplete && "bg-muted-foreground/20"
                    )}
                  >
                    {isComplete ? <Check className="size-3" strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </nav>
        ) : null}

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

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonVariants({ variant: "outline" })}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            {showBack && onBack ? (
              <button
                type="button"
                className={buttonVariants({ variant: "outline" })}
                onClick={onBack}
                disabled={loading}
              >
                {backLabel}
              </button>
            ) : null}
          </div>
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
