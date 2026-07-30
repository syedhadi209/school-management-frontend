import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: string; up: boolean };
  icon: LucideIcon;
  tint?: string;
}

export function StatCard({ label, value, trend, icon: Icon, tint = "bg-primary/10 text-primary" }: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className={cn("flex size-11 items-center justify-center rounded-full", tint)}>
          <Icon className="size-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              trend.up
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-600"
            )}
          >
            {trend.up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
