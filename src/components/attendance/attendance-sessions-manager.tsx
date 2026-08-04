"use client";

import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";

import { createCrudHooks } from "@/lib/crud";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/data/date-picker";
import { SelectMenu } from "@/components/data/select-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AttendanceSession,
  attendanceStatusTint,
  fetchAttendanceSession,
  fetchAttendanceSessions,
  fetchAttendanceSummary,
  formatClock,
  todayISO,
} from "@/lib/attendance";

type Section = {
  id: number;
  name: string;
  class_level_name?: string;
};

const sectionHooks = createCrudHooks<Section, Record<string, unknown>>("/sections/");

function SummaryStrip({
  present,
  absent,
  late,
  leave,
  sessionsCount,
  rate,
}: {
  present: number;
  absent: number;
  late: number;
  leave: number;
  sessionsCount?: number;
  rate?: number;
}) {
  const chips = [
    { key: "present" as const, label: "Present", value: present },
    { key: "absent" as const, label: "Absent", value: absent },
    { key: "late" as const, label: "Late", value: late },
    { key: "leave" as const, label: "Leave", value: leave },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm font-semibold",
            attendanceStatusTint[chip.key]
          )}
        >
          {chip.label}: {chip.value}
        </span>
      ))}
      {typeof sessionsCount === "number" ? (
        <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground">
          Sessions: {sessionsCount}
        </span>
      ) : null}
      {typeof rate === "number" ? (
        <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground">
          Rate: {rate}%
        </span>
      ) : null}
    </div>
  );
}

function SessionDetail({ sessionId }: { sessionId: number }) {
  const detailQuery = useQuery({
    queryKey: ["/attendance-sessions/", sessionId],
    queryFn: () => fetchAttendanceSession(sessionId),
  });

  if (detailQuery.isLoading) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">Loading records…</p>;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">Could not load session details.</p>;
  }

  const records = detailQuery.data.records ?? [];

  if (records.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">No student records on this session.</p>;
  }

  return (
    <div className="border-t border-border bg-muted/10 px-4 py-3">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((record) => (
          <li
            key={record.id}
            className="rounded-xl border border-border bg-background px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{record.student_name}</p>
                <p className="text-xs text-muted-foreground">{record.roll_number || "No roll #"}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize",
                  attendanceStatusTint[record.status]
                )}
              >
                {record.status}
              </span>
            </div>
            {record.remarks ? (
              <p className="mt-1 text-xs text-muted-foreground">{record.remarks}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AttendanceSessionsManager() {
  const [date, setDate] = useState(todayISO());
  const [sectionId, setSectionId] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const sectionsQuery = sectionHooks.useList({ page: 1, page_size: 200 });
  const sections = sectionsQuery.data?.results ?? [];

  const sectionOptions = useMemo(
    () => [
      { value: "all", label: "All sections" },
      ...sections.map((section) => ({
        value: String(section.id),
        label: section.class_level_name
          ? `${section.class_level_name} — ${section.name}`
          : section.name,
      })),
    ],
    [sections]
  );

  const sectionFilter = sectionId === "all" ? undefined : sectionId;

  const filterParams = {
    date,
    section: sectionFilter,
    page_size: 100,
  };

  const sessionsQuery = useQuery({
    queryKey: ["/attendance-sessions/", filterParams],
    queryFn: () => fetchAttendanceSessions(filterParams),
  });

  const summaryQuery = useQuery({
    queryKey: ["/attendance-sessions/summary/", { date, section: sectionFilter }],
    queryFn: () =>
      fetchAttendanceSummary({
        date,
        section: sectionFilter,
      }),
  });

  const sessions = sessionsQuery.data?.results ?? [];
  const summary = summaryQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="w-full max-w-[220px] space-y-2">
          <label className="text-sm font-medium">Date</label>
          <DatePicker value={date} onChange={setDate} disableFuture />
        </div>
        <div className="w-full max-w-xs space-y-2">
          <label className="text-sm font-medium">Section</label>
          <SelectMenu
            value={sectionId}
            onValueChange={setSectionId}
            options={sectionOptions}
            placeholder="All sections"
            menuLabel="Sections"
          />
        </div>
      </div>

      {summaryQuery.isLoading ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          Loading summary…
        </div>
      ) : summary ? (
        <SummaryStrip
          present={summary.present ?? 0}
          absent={summary.absent ?? 0}
          late={summary.late ?? 0}
          leave={summary.leave ?? 0}
          sessionsCount={summary.sessions_count}
          rate={summary.attendance_rate}
        />
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">Attendance sessions</h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {sessions.length}
          </span>
        </div>

        {sessionsQuery.isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No attendance sessions for this date{sectionFilter ? " and section" : ""}.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Section</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Counts</TableHead>
                <TableHead>Taken at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session: AttendanceSession) => {
                const open = expandedId === session.id;
                return (
                  <Fragment key={session.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => setExpandedId(open ? null : session.id)}
                    >
                      <TableCell>
                        {open ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{session.section_label}</TableCell>
                      <TableCell>{session.subject_name || "—"}</TableCell>
                      <TableCell>{session.teacher_name || "—"}</TableCell>
                      <TableCell>
                        {formatClock(session.start_time)}–{formatClock(session.end_time)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", attendanceStatusTint.present)}>
                            P {session.summary.present}
                          </span>
                          <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", attendanceStatusTint.absent)}>
                            A {session.summary.absent}
                          </span>
                          <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", attendanceStatusTint.late)}>
                            L {session.summary.late}
                          </span>
                          <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", attendanceStatusTint.leave)}>
                            Lv {session.summary.leave}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.taken_at
                          ? new Date(session.taken_at).toLocaleString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                    {open ? (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <SessionDetail sessionId={session.id} />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
