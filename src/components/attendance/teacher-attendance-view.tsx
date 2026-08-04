"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3 } from "lucide-react";

import { TeacherActiveNowCard } from "@/components/attendance/teacher-active-now";
import {
  AttendanceSession,
  attendanceStatusTint,
  fetchAttendanceSessions,
  formatClock,
  todayISO,
} from "@/lib/attendance";
import { cn } from "@/lib/utils";

function SessionSummaryChips({ session }: { session: AttendanceSession }) {
  const summary = session.summary;
  const items = [
    { key: "present" as const, label: "P", value: summary.present },
    { key: "absent" as const, label: "A", value: summary.absent },
    { key: "late" as const, label: "L", value: summary.late },
    { key: "leave" as const, label: "Lv", value: summary.leave },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.key}
          className={cn(
            "rounded-md border px-2 py-0.5 text-[11px] font-semibold tabular-nums",
            attendanceStatusTint[item.key]
          )}
        >
          {item.label} {item.value}
        </span>
      ))}
    </div>
  );
}

function attendanceRate(session: AttendanceSession) {
  const total =
    (session.summary.present ?? 0) +
    (session.summary.absent ?? 0) +
    (session.summary.late ?? 0) +
    (session.summary.leave ?? 0);
  if (!total) return 0;
  const attended = (session.summary.present ?? 0) + (session.summary.late ?? 0);
  return Math.round((attended / total) * 100);
}

export function TeacherAttendanceView() {
  const today = todayISO();

  const sessionsQuery = useQuery({
    queryKey: ["/attendance-sessions/", { date: today }],
    queryFn: () => fetchAttendanceSessions({ date: today, page_size: 100 }),
  });

  const sessions = sessionsQuery.data?.results ?? [];

  const dayTotals = useMemo(() => {
    return sessions.reduce(
      (acc, session) => {
        acc.present += session.summary.present ?? 0;
        acc.absent += session.summary.absent ?? 0;
        acc.late += session.summary.late ?? 0;
        acc.leave += session.summary.leave ?? 0;
        return acc;
      },
      { present: 0, absent: 0, late: 0, leave: 0 }
    );
  }, [sessions]);

  const dayMarked =
    dayTotals.present + dayTotals.absent + dayTotals.late + dayTotals.leave;
  const dayRate = dayMarked
    ? Math.round(((dayTotals.present + dayTotals.late) / dayMarked) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <TeacherActiveNowCard defaultOpenTake />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Today&apos;s sessions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted attendance for {today}.
            </p>
          </div>
          {sessions.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-border bg-card px-2.5 py-1 font-medium">
                {sessions.length} session{sessions.length === 1 ? "" : "s"}
              </span>
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
                {dayRate}% present/late
              </span>
            </div>
          ) : null}
        </div>

        {sessionsQuery.isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            Loading today&apos;s sessions…
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <CalendarDays className="mx-auto size-8 text-muted-foreground/70" />
            <p className="mt-3 text-sm font-medium">No sessions submitted yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Take attendance for your active lecture and it will show up here.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {sessions.map((session) => {
              const rate = attendanceRate(session);
              return (
                <li
                  key={session.id}
                  className="border-b border-border/70 px-4 py-4 last:border-b-0 sm:px-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold tracking-tight">
                        {session.subject_name || "Lecture"}
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {session.section_label}
                        </span>
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-3.5" />
                          {formatClock(session.start_time)}–{formatClock(session.end_time)}
                        </span>
                        {session.taken_at ? (
                          <span>
                            Taken{" "}
                            {new Date(session.taken_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                          {rate}%
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                      <SessionSummaryChips session={session} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
