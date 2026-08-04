"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Coffee,
  ClipboardList,
  Users,
} from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { TakeAttendancePanel } from "@/components/attendance/take-attendance-panel";
import { formatClock } from "@/lib/attendance";
import { cn } from "@/lib/utils";
import type { TimetableEntry } from "@/components/timetable/week-grid";

type RosterStudent = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  roll_number: string;
  profile_image: string | null;
};

export type CurrentSlot = TimetableEntry & {
  roster?: RosterStudent[];
  attendance_taken?: boolean;
  attendance_session_id?: number | null;
};

export type CurrentResponse = {
  server_time: string;
  day_of_week: number;
  local_time: string;
  current: CurrentSlot | null;
  next: CurrentSlot | null;
};

export function useTeacherCurrentSlot() {
  return useQuery({
    queryKey: ["/timetable-entries/current/"],
    queryFn: async () => {
      const { data } = await api.get<CurrentResponse>("/timetable-entries/current/");
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function TeacherActiveNowCard({
  showRosterPreview = true,
  defaultOpenTake = false,
}: {
  showRosterPreview?: boolean;
  defaultOpenTake?: boolean;
}) {
  const currentQuery = useTeacherCurrentSlot();
  const current = currentQuery.data?.current ?? null;
  const next = currentQuery.data?.next ?? null;
  const [taking, setTaking] = useState(defaultOpenTake);

  const lecture = current?.slot_type === "lecture" ? current : null;
  const rosterCount = lecture?.roster?.length ?? 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className={cn(
          "border-b border-border px-5 py-5 sm:px-6",
          lecture
            ? lecture.attendance_taken
              ? "bg-gradient-to-br from-emerald-50 via-card to-card"
              : "bg-gradient-to-br from-sky-50 via-card to-card"
            : current?.slot_type === "break"
              ? "bg-gradient-to-br from-amber-50 via-card to-card"
              : "bg-muted/20"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Active now
            </p>
            {currentQuery.isLoading ? (
              <p className="mt-2 text-sm text-muted-foreground">Checking your schedule…</p>
            ) : current ? (
              <>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-tight">
                  {current.slot_type === "break"
                    ? current.label || "Break"
                    : current.subject_name || "Lecture"}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
                  {current.section_label ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                      <Users className="size-3.5" />
                      {current.section_label}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" />
                    {formatClock(current.start_time)}–{formatClock(current.end_time)}
                  </span>
                  {current.slot_type === "lecture" && current.teacher_name ? (
                    <span>{current.teacher_name}</span>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-tight">No active class</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {next
                    ? `Next up: ${next.subject_name || next.label} (${next.section_label}) at ${formatClock(next.start_time)}`
                    : "You have no more lectures scheduled today."}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {current?.slot_type === "break" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                <Coffee className="size-3.5" />
                Break
              </span>
            ) : null}
            {lecture ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
                  <Users className="size-3.5" />
                  In session
                </span>
                {lecture.attendance_taken ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                    <CheckCircle2 className="size-3.5" />
                    Attendance taken
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800">
                    Attendance pending
                  </span>
                )}
              </>
            ) : null}
          </div>
        </div>

        {lecture ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-lg border border-border bg-background/80 px-2.5 py-1 font-medium text-foreground">
                {rosterCount} student{rosterCount === 1 ? "" : "s"}
              </span>
              <span className="rounded-lg border border-border bg-background/80 px-2.5 py-1">
                {lecture.attendance_taken ? "You can still update marks" : "Mark the full roster to submit"}
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant={taking ? "outline" : "default"}
              onClick={() => setTaking((value) => !value)}
            >
              <ClipboardList className="size-3.5" />
              {taking
                ? "Hide roster"
                : lecture.attendance_taken
                  ? "Update attendance"
                  : "Take attendance"}
            </Button>
          </div>
        ) : null}
      </div>

      {lecture && taking ? (
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <TakeAttendancePanel
            timetableEntryId={lecture.id}
            onSuccess={() => setTaking(false)}
          />
        </div>
      ) : null}

      {lecture && !taking && showRosterPreview ? (
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {(lecture.roster ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No active students in this section yet.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {(lecture.roster ?? []).map((student) => (
                <li
                  key={student.id}
                  className="flex items-center gap-3 rounded-xl border border-border/80 bg-background px-3 py-2.5"
                >
                  {student.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.profile_image}
                      alt={student.full_name}
                      className="size-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {student.first_name.slice(0, 1)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.roll_number || "No roll #"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
