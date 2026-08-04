"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Loader2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { extractApiErrorMessage } from "@/lib/crud";
import {
  ATTENDANCE_STATUSES,
  AttendanceDraftRecord,
  AttendanceStatus,
  attendanceStatusTint,
  fetchAttendanceForEntry,
  takeAttendance,
  todayISO,
} from "@/lib/attendance";

type DraftRow = AttendanceDraftRecord;

const statusAccent: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  late: "bg-amber-500",
  leave: "bg-slate-500",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TakeAttendancePanel({
  timetableEntryId,
  date,
  onSuccess,
  className,
}: {
  timetableEntryId: number;
  date?: string;
  onSuccess?: () => void;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const sessionDate = date || todayISO();
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [remarksOpen, setRemarksOpen] = useState<Record<number, boolean>>({});

  const forEntryQuery = useQuery({
    queryKey: ["/attendance-sessions/for-entry/", timetableEntryId, sessionDate],
    queryFn: () => fetchAttendanceForEntry(timetableEntryId, sessionDate),
    enabled: Boolean(timetableEntryId),
  });

  useEffect(() => {
    if (!forEntryQuery.data) return;
    setRows(
      forEntryQuery.data.records.map((record) => ({
        ...record,
        status: record.status || "present",
        remarks: record.remarks || "",
      }))
    );
    setNotes(forEntryQuery.data.notes || "");
    setRemarksOpen(
      Object.fromEntries(
        forEntryQuery.data.records
          .filter((record) => Boolean(record.remarks))
          .map((record) => [record.student, true])
      )
    );
  }, [forEntryQuery.data]);

  const counts = useMemo(() => {
    const next = { present: 0, absent: 0, late: 0, leave: 0, unmarked: 0 };
    for (const row of rows) {
      if (!row.status) next.unmarked += 1;
      else next[row.status] += 1;
    }
    return next;
  }, [rows]);

  const mutation = useMutation({
    mutationFn: takeAttendance,
    onSuccess: async () => {
      toast.success("Attendance saved.");
      setFormError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/timetable-entries/current/"] }),
        queryClient.invalidateQueries({
          queryKey: ["/attendance-sessions/for-entry/", timetableEntryId, sessionDate],
        }),
        queryClient.invalidateQueries({ queryKey: ["/attendance-sessions/"] }),
        queryClient.invalidateQueries({ queryKey: ["/attendance-sessions/summary/"] }),
      ]);
      onSuccess?.();
    },
    onError: (error) => {
      setFormError(extractApiErrorMessage(error, "Could not save attendance."));
    },
  });

  function setStatus(studentId: number, status: AttendanceStatus) {
    setRows((prev) =>
      prev.map((row) => (row.student === studentId ? { ...row, status } : row))
    );
  }

  function setRemarks(studentId: number, remarks: string) {
    setRows((prev) =>
      prev.map((row) => (row.student === studentId ? { ...row, remarks } : row))
    );
  }

  function markAllPresent() {
    setRows((prev) => prev.map((row) => ({ ...row, status: "present" })));
  }

  function handleSubmit() {
    if (rows.length === 0) {
      setFormError("No students in this section.");
      return;
    }
    if (rows.some((row) => !row.status)) {
      setFormError("Mark a status for every student before submitting.");
      return;
    }
    setFormError("");
    mutation.mutate({
      timetable_entry: timetableEntryId,
      date: sessionDate,
      notes,
      records: rows.map((row) => ({
        student: row.student,
        status: row.status,
        remarks: row.remarks || "",
      })),
    });
  }

  if (forEntryQuery.isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-12 text-sm text-muted-foreground",
          className
        )}
      >
        <Loader2 className="size-4 animate-spin" />
        Loading roster…
      </div>
    );
  }

  if (forEntryQuery.isError) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground",
          className
        )}
      >
        {extractApiErrorMessage(forEntryQuery.error, "Could not load attendance roster.")}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground",
          className
        )}
      >
        No active students in this section.
      </div>
    );
  }

  const isExisting = Boolean(forEntryQuery.data?.session_id);
  const marked = rows.length - counts.unmarked;
  const progress = rows.length ? Math.round((marked / rows.length) * 100) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-2 sm:grid-cols-4">
        {(
          [
            { key: "present" as const, label: "Present" },
            { key: "absent" as const, label: "Absent" },
            { key: "late" as const, label: "Late" },
            { key: "leave" as const, label: "Leave" },
          ] as const
        ).map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-border/80 bg-background px-3 py-2.5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", statusAccent[item.key])} />
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
            </div>
            <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
              {counts[item.key]}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {marked}/{rows.length} marked
              {counts.unmarked > 0 ? ` · ${counts.unmarked} left` : ""}
            </span>
            <span className="font-medium tabular-nums text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border/70">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={markAllPresent}>
          <CheckCheck className="size-3.5" />
          Mark all present
        </Button>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {rows.map((row, index) => {
          const showRemarks = remarksOpen[row.student] || Boolean(row.remarks);
          return (
            <li
              key={row.student}
              className={cn(
                "border-b border-border/70 p-3 last:border-b-0 sm:p-4",
                index % 2 === 1 && "bg-muted/15"
              )}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(row.student_name) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{row.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.roll_number || "No roll number"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl border border-border bg-background p-0.5 shadow-sm">
                    {ATTENDANCE_STATUSES.map((status) => {
                      const active = row.status === status.value;
                      return (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() => setStatus(row.student, status.value)}
                          className={cn(
                            "rounded-[10px] px-2.5 py-1.5 text-xs font-semibold transition-colors",
                            active
                              ? attendanceStatusTint[status.value]
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {status.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setRemarksOpen((prev) => ({
                        ...prev,
                        [row.student]: !showRemarks,
                      }))
                    }
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      showRemarks && "border-primary/30 bg-primary/5 text-primary"
                    )}
                    aria-label="Toggle remarks"
                    title="Remarks"
                  >
                    <MessageSquareText className="size-3.5" />
                  </button>
                </div>
              </div>

              {showRemarks ? (
                <Input
                  value={row.remarks}
                  onChange={(event) => setRemarks(row.student, event.target.value)}
                  placeholder="Add a short remark…"
                  className="mt-3 h-9 rounded-xl text-sm"
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <label
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          htmlFor={`attendance-notes-${timetableEntryId}`}
        >
          Session notes
        </label>
        <Input
          id={`attendance-notes-${timetableEntryId}`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional note for this lecture…"
          className="mt-2 h-9 rounded-xl"
        />
      </div>

      {formError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-3 shadow-sm sm:px-4">
        <p className="text-xs text-muted-foreground sm:text-sm">
          {isExisting
            ? "Changes will update the submitted attendance for this lecture."
            : "Submit once every student has a status."}
        </p>
        <Button type="button" size="lg" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : isExisting ? (
            "Save updates"
          ) : (
            "Submit attendance"
          )}
        </Button>
      </div>
    </div>
  );
}
