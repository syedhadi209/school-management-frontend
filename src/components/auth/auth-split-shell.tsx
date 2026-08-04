import Link from "next/link";
import { Building2, CheckCircle2, Quote } from "lucide-react";
import type { ReactNode } from "react";

interface AuthSplitShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  panelTitle: string;
  panelSubtitle?: string;
  highlights: string[];
  testimonial: { quote: string; name: string; role: string };
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthSplitShell({
  eyebrow,
  title,
  subtitle,
  panelTitle,
  panelSubtitle,
  highlights,
  testimonial,
  children,
  footer,
}: AuthSplitShellProps) {
  return (
    <div className="flex min-h-screen flex-1">
      {/* Brand panel */}
      <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-band p-10 lg:flex xl:p-14">
        <div className="absolute -left-16 -top-16 size-56 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 size-48 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/15">
              <Building2 className="size-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white">Edunity</span>
          </Link>

          <h2 className="mt-14 max-w-sm text-3xl font-extrabold leading-tight text-white xl:text-4xl">
            {panelTitle}
          </h2>
          {panelSubtitle && (
            <p className="mt-4 max-w-sm text-base leading-7 text-white/70">{panelSubtitle}</p>
          )}

          <ul className="mt-10 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-white/90">
                <CheckCircle2 className="size-5 shrink-0 text-white/60" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
          <Quote className="size-6 text-white/30" />
          <p className="mt-3 text-sm leading-6 text-white/85">&ldquo;{testimonial.quote}&rdquo;</p>
          <p className="mt-4 text-sm font-semibold text-white">{testimonial.name}</p>
          <p className="text-xs text-white/60">{testimonial.role}</p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex flex-1 flex-col bg-mesh">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Building2 className="size-4" />
            Back to Edunity
          </Link>

          <div className="w-full max-w-md">
            {eyebrow && (
              <p className="mb-1 text-sm font-semibold text-primary">{eyebrow}</p>
            )}
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
            )}

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
