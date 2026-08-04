"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { createCrudHooks } from "@/lib/crud";
import { SelectMenu } from "@/components/data/select-menu";
import { TimetableEntry, TimetableWeekGrid } from "@/components/timetable/week-grid";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  roll_number?: string;
  section: number | null;
  section_label?: string;
};

const entryHooks = createCrudHooks<TimetableEntry, Record<string, unknown>>("/timetable-entries/");

export function ParentTimetableView() {
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
  const selectedChild = children.find((child) => String(child.id) === effectiveStudentId);

  const entriesQuery = entryHooks.useList(
    {
      page: 1,
      page_size: 200,
      student: effectiveStudentId || undefined,
      is_active: true,
    },
    { enabled: Boolean(effectiveStudentId) }
  );

  const entries = entriesQuery.data?.results ?? [];

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
      ) : !selectedChild?.section ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
          This child is not assigned to a section yet.
        </div>
      ) : entriesQuery.isLoading ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Loading timetable…
        </div>
      ) : (
        <TimetableWeekGrid
          entries={entries}
          emptyMessage="No timetable has been published for this child's section yet."
        />
      )}
    </div>
  );
}
