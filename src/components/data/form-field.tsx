"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function FormField({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        {required ? <span className="text-destructive">*</span> : null}
      </div>
      {children}
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
