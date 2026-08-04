"use client";

import { Coffee, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const DAY_OPTIONS = [
  { value: 0, label: "Monday", short: "Mon" },
  { value: 1, label: "Tuesday", short: "Tue" },
  { value: 2, label: "Wednesday", short: "Wed" },
  { value: 3, label: "Thursday", short: "Thu" },
  { value: 4, label: "Friday", short: "Fri" },
  { value: 5, label: "Saturday", short: "Sat" },
] as const;

export type TimetableEntry = {
  id: number;
  section: number;
  section_label?: string;
  class_level_name?: string;
  slot_type: "lecture" | "break";
  subject: number | null;
  subject_name?: string;
  teacher: number | null;
  teacher_name?: string;
  label: string;
  day_of_week: number;
  day_label?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export function formatClock(value: string) {
  if (!value) return "";
  return value.slice(0, 5);
}

export function TimetableWeekGrid({
  entries,
  editable = false,
  onEdit,
  onDelete,
  emptyMessage = "No timetable slots yet.",
}: {
  entries: TimetableEntry[];
  editable?: boolean;
  onEdit?: (entry: TimetableEntry) => void;
  onDelete?: (entry: TimetableEntry) => void;
  emptyMessage?: string;
}) {
  const byDay = DAY_OPTIONS.map((day) => ({
    ...day,
    slots: entries
      .filter((entry) => entry.day_of_week === day.value && entry.is_active !== false)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  const hasAny = byDay.some((day) => day.slots.length > 0);
  if (!hasAny) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {byDay.map((day) => (
        <div key={day.value} className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">{day.label}</h3>
            <p className="text-xs text-muted-foreground">{day.slots.length} slot{day.slots.length === 1 ? "" : "s"}</p>
          </div>
          <div className="space-y-2 p-3">
            {day.slots.length === 0 ? (
              <p className="px-1 py-4 text-center text-xs text-muted-foreground">Free day</p>
            ) : (
              day.slots.map((slot) => {
                const isBreak = slot.slot_type === "break";
                return (
                  <div
                    key={slot.id}
                    className={cn(
                      "rounded-xl border px-3 py-2.5",
                      isBreak
                        ? "border-amber-200 bg-amber-50 text-amber-950"
                        : "border-border bg-background"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatClock(slot.start_time)} – {formatClock(slot.end_time)}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold">
                          {isBreak ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Coffee className="size-3.5 shrink-0" />
                              {slot.label || "Break"}
                            </span>
                          ) : (
                            slot.subject_name || "Lecture"
                          )}
                        </p>
                        {!isBreak ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {slot.teacher_name || "Unassigned"}
                            {slot.section_label ? ` · ${slot.section_label}` : ""}
                          </p>
                        ) : slot.section_label ? (
                          <p className="truncate text-xs text-amber-800/80">{slot.section_label}</p>
                        ) : null}
                      </div>
                      {editable ? (
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            aria-label="Edit slot"
                            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                            onClick={() => onEdit?.(slot)}
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete slot"
                            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                            onClick={() => onDelete?.(slot)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
