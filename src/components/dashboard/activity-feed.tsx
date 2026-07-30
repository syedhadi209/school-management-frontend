import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  icon: LucideIcon;
  tint: string;
  title: string;
  subtitle: string;
  time: string;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="divide-y">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", item.tint)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
          </div>
        );
      })}
    </div>
  );
}
