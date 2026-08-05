"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { ProfileAvatar } from "@/components/data/profile-image-picker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EntityDetailShell({
  backHref,
  backLabel = "Back",
  title,
  subtitle,
  imageUrl,
  badges,
  actions,
  loading,
  error,
  children,
}: {
  backHref: string;
  backLabel?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  badges?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  error?: string | null;
  children?: ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href={backHref}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex gap-1.5")}
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex gap-1.5")}
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex min-w-0 items-start gap-4">
          <ProfileAvatar size="md" name={title} imageUrl={imageUrl} />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
            {badges ? <div className="mt-3 flex flex-wrap gap-2">{badges}</div> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      {children}
    </div>
  );
}

export function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </dl>
  );
}

export function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 overflow-hidden", className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
        {value || "—"}
      </dd>
    </div>
  );
}
