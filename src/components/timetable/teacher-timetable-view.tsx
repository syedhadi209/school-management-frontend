"use client";

import { useQuery } from "@tanstack/react-query";
import { Coffee, Users } from "lucide-react";

import { api } from "@/lib/api";
import {
  TimetableEntry,
  TimetableWeekGrid,
  formatClock,
} from "@/components/timetable/week-grid";

type RosterStudent = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  roll_number: string;
  profile_image: string | null;
};

type CurrentSlot = TimetableEntry & {
  roster?: RosterStudent[];
};

type CurrentResponse = {
  server_time: string;
  day_of_week: number;
  local_time: string;
  current: CurrentSlot | null;
  next: CurrentSlot | null;
};

type MyScheduleResponse = {
  results: TimetableEntry[];
};

export function TeacherTimetableView() {
  const scheduleQuery = useQuery({
    queryKey: ["/timetable-entries/my-schedule/"],
    queryFn: async () => {
      const { data } = await api.get<MyScheduleResponse>("/timetable-entries/my-schedule/");
      return data;
    },
    refetchInterval: 60_000,
  });

  const currentQuery = useQuery({
    queryKey: ["/timetable-entries/current/"],
    queryFn: async () => {
      const { data } = await api.get<CurrentResponse>("/timetable-entries/current/");
      return data;
    },
    refetchInterval: 30_000,
  });

  const entries = scheduleQuery.data?.results ?? [];
  const current = currentQuery.data?.current ?? null;
  const next = currentQuery.data?.next ?? null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active now</p>
            {currentQuery.isLoading ? (
              <p className="mt-2 text-sm text-muted-foreground">Checking your schedule…</p>
            ) : current ? (
              <>
                <h2 className="mt-1 text-xl font-semibold">
                  {current.slot_type === "break"
                    ? current.label || "Break"
                    : current.subject_name || "Lecture"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {current.section_label} · {formatClock(current.start_time)}–{formatClock(current.end_time)}
                  {current.slot_type === "break"
                    ? ` · ends at ${formatClock(current.end_time)}`
                    : current.teacher_name
                      ? ` · ${current.teacher_name}`
                      : ""}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-1 text-xl font-semibold">No active class</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {next
                    ? `Next up: ${next.subject_name || next.label} (${next.section_label}) at ${formatClock(next.start_time)}`
                    : "You have no more lectures scheduled today."}
                </p>
              </>
            )}
          </div>
          {current?.slot_type === "break" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              <Coffee className="size-3.5" />
              Break
            </span>
          ) : current ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
              <Users className="size-3.5" />
              In session
            </span>
          ) : null}
        </div>

        {current?.slot_type === "lecture" ? (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Section roster</h3>
              <p className="text-xs text-muted-foreground">
                {(current.roster ?? []).length} student{(current.roster ?? []).length === 1 ? "" : "s"} · attendance
                coming soon
              </p>
            </div>
            {(current.roster ?? []).length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No active students in this section yet.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(current.roster ?? []).map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2"
                  >
                    {student.profile_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={student.profile_image}
                        alt={student.full_name}
                        className="size-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {student.first_name.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{student.full_name}</p>
                      <p className="text-xs text-muted-foreground">{student.roll_number || "No roll #"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">My weekly schedule</h2>
        {scheduleQuery.isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            Loading schedule…
          </div>
        ) : (
          <TimetableWeekGrid
            entries={entries}
            emptyMessage="You have no timetable assignments yet. Ask a manager to assign your lectures."
          />
        )}
      </div>
    </div>
  );
}
