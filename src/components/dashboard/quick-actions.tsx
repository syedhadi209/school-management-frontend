import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickActionItem {
  icon: LucideIcon;
  tint: string;
  title: string;
  subtitle: string;
  href: string;
}

export function QuickActions({ items }: { items: QuickActionItem[] }) {
  return (
    <div className="divide-y">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={`${item.href}-${item.title}`}
            href={item.href}
            className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
          >
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", item.tint)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-transform group-hover:translate-x-0.5">
              <Plus className="size-4" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
