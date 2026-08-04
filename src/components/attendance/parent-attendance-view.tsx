"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { SelectMenu } from "@/components/data/select-menu";
import { cn } from "@/lib/utils";
import {
  attendanceStatusTint,
  fetchAttendanceRecords,
  formatClock,
} from "@/lib/attendance";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  roll_number?: string;
  section: number | null;
  section_label?: string;
};

export function ParentAttendanceView() {
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const childrenQuery = useQuery({
    queryKey: ["/accounts/my-children/"],
    queryFn: async () => {
      const { data } = await api.get<Child[]>("/accounts/my-children/");
      return data;
    },
  });

  const children = childrenQuery.data ?? [];

  const childOptions = useMemo(
    () =>
      children.map((child) => ({
        value: String(child.id),
        label: child.section_label
          ? `${child.full_name} (${child.section_label})`
          : child.full_name || `Student ${child.id}`,
      })),
    [children]
  );

  const effectiveStudentId = selectedStudentId || (childOptions[0]?.value ?? "");

  const recordsQuery = useQuery({
    queryKey: ["/attendance-records/", { student: effectiveStudentId }],
    queryFn: () =>
      fetchAttendanceRecords({
        student: effectiveStudentId,
        page_size: 100,
      }),
    enabled: Boolean(effectiveStudentId),
  });

  const records = recordsQuery.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="w-full max-w-sm space-y-2">
        <label className="text-sm font-medium">Child</label>
        <SelectMenu
          value={effectiveStudentId}
          onValueChange={setSelectedStudentId}
          options={childOptions}
          placeholder="Select child"
          menuLabel="Children"
        />
      </div>

      {!effectiveStudentId ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
          No linked children found for your account.
        </div>
      ) : recordsQuery.isLoading ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Loading attendance history…
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
          No attendance records yet for this child.
        </div>
      ) : (
        <ul className="space-y-3">
          {records.map((record) => (
            <li
              key={record.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {record.subject_name || "Lecture"}
                  {record.section_label ? ` · ${record.section_label}` : ""}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {record.session_date || "—"}
                  {record.start_time
                    ? ` · ${formatClock(record.start_time)}${
                        record.end_time ? `–${formatClock(record.end_time)}` : ""
                      }`
                    : ""}
                </p>
                {record.remarks ? (
                  <p className="mt-1 text-xs text-muted-foreground">{record.remarks}</p>
                ) : null}
              </div>
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize",
                  attendanceStatusTint[record.status]
                )}
              >
                {record.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
