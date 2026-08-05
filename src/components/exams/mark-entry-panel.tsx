"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { extractApiErrorMessage } from "@/lib/crud";
import {
  enterMarks,
  fetchMarkForEntry,
  type MarkDraftRecord,
} from "@/lib/exams";

type DraftRow = MarkDraftRecord & { marksValue: string };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function MarkEntryPanel({
  examId,
  sectionId,
  subjectId,
  onSuccess,
  className,
}: {
  examId: number;
  sectionId: number;
  subjectId: number;
  onSuccess?: () => void;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [notes, setNotes] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [formError, setFormError] = useState("");
  const [remarksOpen, setRemarksOpen] = useState<Record<number, boolean>>({});

  const forEntryQuery = useQuery({
    queryKey: ["/mark-sheets/for-entry/", examId, sectionId, subjectId],
    queryFn: () => fetchMarkForEntry(examId, sectionId, subjectId),
    enabled: Boolean(examId && sectionId && subjectId),
  });

  useEffect(() => {
    if (!forEntryQuery.data) return;
    setRows(
      forEntryQuery.data.records.map((record) => ({
        ...record,
        remarks: record.remarks || "",
        marksValue:
          record.marks_obtained === null || record.marks_obtained === undefined
            ? ""
            : String(record.marks_obtained),
      }))
    );
    setNotes(forEntryQuery.data.notes || "");
    setMaxMarks(String(forEntryQuery.data.max_marks ?? 100));
    setRemarksOpen(
      Object.fromEntries(
        forEntryQuery.data.records
          .filter((record) => Boolean(record.remarks))
          .map((record) => [record.student, true])
      )
    );
  }, [forEntryQuery.data]);

  const maxMarksNum = useMemo(() => {
    const n = Number(maxMarks);
    return Number.isFinite(n) && n > 0 ? n : 100;
  }, [maxMarks]);

  const stats = useMemo(() => {
    let filled = 0;
    let sum = 0;
    for (const row of rows) {
      const n = toNumber(row.marksValue);
      if (n === null) continue;
      filled += 1;
      sum += n;
    }
    const average = filled ? sum / filled : null;
    const averagePct = average === null ? null : (average / maxMarksNum) * 100;
    return {
      filled,
      unmarked: rows.length - filled,
      average,
      averagePct,
    };
  }, [rows, maxMarksNum]);

  const published = forEntryQuery.data?.exam_status === "published";
  const locked = published;

  const mutation = useMutation({
    mutationFn: enterMarks,
    onSuccess: async () => {
      toast.success("Marks saved.");
      setFormError("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["/mark-sheets/for-entry/", examId, sectionId, subjectId],
        }),
        queryClient.invalidateQueries({ queryKey: ["/mark-sheets/"] }),
        queryClient.invalidateQueries({ queryKey: ["/exams/"] }),
        queryClient.invalidateQueries({ queryKey: ["/marks/"] }),
      ]);
      onSuccess?.();
    },
    onError: (error) => {
      setFormError(extractApiErrorMessage(error, "Could not save marks."));
    },
  });

  function setMarks(studentId: number, marksValue: string) {
    setRows((prev) =>
      prev.map((row) => (row.student === studentId ? { ...row, marksValue } : row))
    );
  }

  function setRemarks(studentId: number, remarks: string) {
    setRows((prev) =>
      prev.map((row) => (row.student === studentId ? { ...row, remarks } : row))
    );
  }

  function clearEmpty() {
    setRows((prev) => prev.map((row) => ({ ...row, marksValue: "" })));
  }

  function handleSubmit() {
    if (locked) {
      setFormError("This exam is published. Marks can no longer be edited.");
      return;
    }
    if (rows.length === 0) {
      setFormError("No students in this section.");
      return;
    }
    const parsed: Array<{ student: number; marks_obtained: number; remarks?: string }> = [];
    for (const row of rows) {
      const n = toNumber(row.marksValue);
      if (n === null) {
        setFormError("Enter marks for every student before submitting.");
        return;
      }
      if (n < 0 || n > maxMarksNum) {
        setFormError(`Marks must be between 0 and ${maxMarksNum}.`);
        return;
      }
      parsed.push({
        student: row.student,
        marks_obtained: n,
        remarks: row.remarks || "",
      });
    }
    setFormError("");
    mutation.mutate({
      exam: examId,
      section: sectionId,
      subject: subjectId,
      max_marks: maxMarksNum,
      notes,
      records: parsed,
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
        {extractApiErrorMessage(forEntryQuery.error, "Could not load mark roster.")}
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

  const data = forEntryQuery.data!;
  const isExisting = data.status === "submitted";
  const progress = rows.length ? Math.round((stats.filled / rows.length) * 100) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <p className="text-sm font-semibold">
          {data.exam_name}
          <span className="font-normal text-muted-foreground">
            {" "}
            · {data.subject_name} · {data.section_label}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sheet {data.status}
          {published ? " · published (read-only)" : ""}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-background px-3 py-2.5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Entered
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
            {stats.filled}/{rows.length}
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-background px-3 py-2.5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Class average
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
            {stats.average === null ? "—" : stats.average.toFixed(1)}
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-background px-3 py-2.5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Average %
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
            {stats.averagePct === null ? "—" : `${stats.averagePct.toFixed(1)}%`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="max-marks">
              Max marks
            </label>
            <Input
              id="max-marks"
              type="number"
              min={1}
              step="0.5"
              value={maxMarks}
              disabled={locked}
              onChange={(event) => setMaxMarks(event.target.value)}
              className="h-8 w-24 rounded-lg"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {stats.filled}/{rows.length} entered
                {stats.unmarked > 0 ? ` · ${stats.unmarked} left` : ""}
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
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={locked}
          onClick={clearEmpty}
        >
          Clear all
        </Button>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {rows.map((row, index) => {
          const showRemarks = remarksOpen[row.student] || Boolean(row.remarks);
          const n = toNumber(row.marksValue);
          const pct =
            n === null || maxMarksNum <= 0 ? null : Math.round((n / maxMarksNum) * 1000) / 10;
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
                      {pct !== null ? ` · ${pct}%` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={maxMarksNum}
                    step="0.5"
                    value={row.marksValue}
                    disabled={locked}
                    onChange={(event) => setMarks(row.student, event.target.value)}
                    placeholder="0"
                    className="h-9 w-24 rounded-xl text-sm tabular-nums"
                  />
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
                  disabled={locked}
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
          htmlFor={`mark-notes-${examId}-${sectionId}-${subjectId}`}
        >
          Sheet notes
        </label>
        <Input
          id={`mark-notes-${examId}-${sectionId}-${subjectId}`}
          value={notes}
          disabled={locked}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional note for this sheet…"
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
          {locked
            ? "Published exams are locked. Ask an admin to unpublish if changes are needed."
            : isExisting
              ? "Changes will update the submitted mark sheet."
              : "Submit once every student has marks."}
        </p>
        <Button type="button" size="lg" onClick={handleSubmit} disabled={mutation.isPending || locked}>
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : isExisting ? (
            "Save updates"
          ) : (
            "Submit marks"
          )}
        </Button>
      </div>
    </div>
  );
}
