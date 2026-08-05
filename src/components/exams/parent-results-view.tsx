"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SelectMenu } from "@/components/data/select-menu";
import { api } from "@/lib/api";
import { examTypeLabel, fetchMarks } from "@/lib/exams";
import { cn } from "@/lib/utils";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  roll_number?: string;
  section: number | null;
  section_label?: string;
};

export function ParentResultsView() {
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

  const marksQuery = useQuery({
    queryKey: ["/marks/", { student: effectiveStudentId }],
    queryFn: () =>
      fetchMarks({
        student: effectiveStudentId,
        page_size: 100,
      }),
    enabled: Boolean(effectiveStudentId),
  });

  const marks = marksQuery.data?.results ?? [];

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
      ) : marksQuery.isLoading ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Loading results…
        </div>
      ) : marks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
          No published results yet for this child.
        </div>
      ) : (
        <ul className="space-y-3">
          {marks.map((mark) => {
            const obtained = Number(mark.marks_obtained);
            const max = Number(mark.max_marks);
            const pct =
              mark.percentage ??
              (Number.isFinite(obtained) && Number.isFinite(max) && max > 0
                ? Math.round((obtained / max) * 1000) / 10
                : null);
            return (
              <li
                key={mark.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {mark.exam_name}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {examTypeLabel[mark.exam_type]}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{mark.subject_name}</p>
                  {mark.remarks ? (
                    <p className="mt-2 text-xs text-muted-foreground">{mark.remarks}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums">
                    {mark.marks_obtained}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {mark.max_marks}
                    </span>
                  </p>
                  {pct !== null ? (
                    <p
                      className={cn(
                        "mt-1 text-xs font-medium tabular-nums",
                        pct >= 50 ? "text-emerald-700" : "text-amber-700"
                      )}
                    >
                      {pct}%
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
