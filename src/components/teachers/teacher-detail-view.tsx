"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pencil } from "lucide-react";

import {
  DetailField,
  DetailGrid,
  DetailSection,
  EntityDetailShell,
} from "@/components/data/entity-detail-shell";
import { createCrudHooks } from "@/lib/crud";
import { buttonVariants } from "@/components/ui/button";

const DESIGNATIONS: Record<string, string> = {
  subject_teacher: "Subject Teacher",
  accountant: "Accountant",
  principal: "Principal",
  sports_teacher: "Sports Teacher",
  maid: "Maid",
};

export type TeacherDetail = {
  id: number;
  user: number;
  full_name?: string;
  email?: string;
  employee_id?: string;
  designation: string;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  qualification: string;
  joining_date: string | null;
  monthly_salary?: string | null;
  address?: string;
  cnic?: string;
  phone_number?: string;
  profile_image?: string | null;
  subjects_taught?: number[];
  subject_names?: string[];
};

type SectionRow = {
  id: number;
  name: string;
  class_level_name?: string;
  class_teacher?: number | null;
  teachers?: number[];
};

const teacherHooks = createCrudHooks<TeacherDetail, Record<string, unknown>>("/accounts/teachers/");
const sectionHooks = createCrudHooks<SectionRow, Record<string, unknown>>("/sections/");

function formatSalary(value?: string | null) {
  if (!value) return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatShift(start?: string | null, end?: string | null) {
  if (!start || !end) return "—";
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

export function TeacherDetailView({
  teacherId,
  backHref,
  backLabel = "Back to teachers",
  editHref,
}: {
  teacherId: number;
  backHref: string;
  backLabel?: string;
  editHref?: string;
}) {
  const detailQuery = teacherHooks.useDetail(teacherId);
  const sectionsQuery = sectionHooks.useList({ page: 1, page_size: 200 });
  const teacher = detailQuery.data;

  const assignedSections = useMemo(() => {
    if (!teacher) return [];
    return (sectionsQuery.data?.results ?? []).filter(
      (section) =>
        section.class_teacher === teacher.id || (section.teachers ?? []).includes(teacher.id)
    );
  }, [sectionsQuery.data?.results, teacher]);

  const displayName = teacher?.full_name || `Teacher #${teacherId}`;

  return (
    <EntityDetailShell
      backHref={backHref}
      backLabel={backLabel}
      title={displayName}
      subtitle={
        teacher
          ? [teacher.employee_id, teacher.email].filter(Boolean).join(" · ")
          : undefined
      }
      imageUrl={teacher?.profile_image}
      loading={detailQuery.isLoading}
      error={
        detailQuery.isError
          ? "Could not load this teacher. They may have been removed or you may not have access."
          : null
      }
      badges={
        teacher ? (
          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {DESIGNATIONS[teacher.designation] ?? teacher.designation.replaceAll("_", " ")}
          </span>
        ) : null
      }
      actions={
        editHref ? (
          <Link href={editHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Pencil className="mr-1.5 size-3.5" />
            Edit
          </Link>
        ) : null
      }
    >
      {teacher ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <DetailSection title="Account">
            <DetailGrid>
              <DetailField label="Full name" value={teacher.full_name} />
              <DetailField label="Email" value={teacher.email} />
              <DetailField label="Employee ID" value={teacher.employee_id} />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Contact">
            <DetailGrid>
              <DetailField label="Phone" value={teacher.phone_number} />
              <DetailField label="CNIC" value={teacher.cnic} />
              <DetailField label="Address" value={teacher.address} className="sm:col-span-2" />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Employment">
            <DetailGrid>
              <DetailField
                label="Designation"
                value={DESIGNATIONS[teacher.designation] ?? teacher.designation}
              />
              <DetailField label="Qualification" value={teacher.qualification} />
              <DetailField label="Joining date" value={formatDate(teacher.joining_date)} />
              <DetailField label="Monthly salary" value={formatSalary(teacher.monthly_salary)} />
              <DetailField
                label="Shift"
                value={formatShift(teacher.shift_start_time, teacher.shift_end_time)}
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Subjects taught">
            {teacher.subject_names?.length ? (
              <div className="flex flex-wrap gap-2">
                {teacher.subject_names.map((name) => (
                  <span
                    key={name}
                    className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No subjects assigned yet.</p>
            )}
          </DetailSection>

          <DetailSection title="Section assignments" className="lg:col-span-2">
            {sectionsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading sections…</p>
            ) : assignedSections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not assigned to any section yet. Assign them under Sections or Timetable.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border">
                {assignedSections.map((section) => (
                  <li
                    key={section.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <span className="font-medium">
                      {section.class_level_name ? `${section.class_level_name} · ` : ""}
                      {section.name}
                    </span>
                    {section.class_teacher === teacher.id ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Class teacher
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Subject teacher</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>
        </div>
      ) : null}
    </EntityDetailShell>
  );
}
