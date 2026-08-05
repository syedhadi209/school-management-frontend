"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import {
  DetailField,
  DetailGrid,
  DetailSection,
  EntityDetailShell,
} from "@/components/data/entity-detail-shell";
import { createCrudHooks } from "@/lib/crud";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StudentDetail = {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  status: string;
  section: number | null;
  section_name?: string;
  class_level_name?: string;
  is_board_class?: boolean;
  region: string;
  roll_number: string;
  board_roll_number?: string;
  guardian_phone: string;
  parent_alternate_phone?: string;
  parent_email?: string;
  parent_occupation?: string;
  father_name?: string;
  mother_name?: string;
  father_cnic?: string;
  mother_cnic?: string;
  address?: string;
  gender: string;
  date_of_birth?: string | null;
  admission_date?: string | null;
  parent_invite_pending?: boolean;
  profile_image?: string | null;
  monthly_fee_base?: string | number | null;
  monthly_fee_discount?: string | number | null;
  monthly_fee_effective?: string | number | null;
  fee_notes_display?: string;
};

const studentHooks = createCrudHooks<StudentDetail, Record<string, unknown>>("/students/");

function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return `₨ ${n.toLocaleString()}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function statusBadge(status: string) {
  const tones: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    waiting_list: "bg-blue-100 text-blue-800",
    withdrawn: "bg-red-100 text-red-800",
    archived: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        tones[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function StudentDetailView({
  studentId,
  backHref,
  backLabel = "Back to students",
  mode = "full",
  editHref,
}: {
  studentId: number;
  backHref: string;
  backLabel?: string;
  mode?: "full" | "teacher";
  editHref?: string;
}) {
  const detailQuery = studentHooks.useDetail(studentId);
  const student = detailQuery.data;
  const showFees = mode === "full";

  const displayName = student?.full_name || `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim();

  return (
    <EntityDetailShell
      backHref={backHref}
      backLabel={backLabel}
      title={displayName || "Student"}
      subtitle={
        student
          ? [
              student.roll_number ? `Roll ${student.roll_number}` : null,
              student.section_name && student.class_level_name
                ? `${student.class_level_name} · ${student.section_name}`
                : student.class_level_name || student.section_name,
            ]
              .filter(Boolean)
              .join(" · ")
          : undefined
      }
      imageUrl={student?.profile_image}
      loading={detailQuery.isLoading}
      error={
        detailQuery.isError
          ? "Could not load this student. They may have been removed or you may not have access."
          : null
      }
      badges={
        student ? (
          <>
            {statusBadge(student.status)}
            {student.is_board_class ? (
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Board class
              </span>
            ) : null}
            {student.parent_invite_pending ? (
              <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
                Parent invite pending
              </span>
            ) : null}
          </>
        ) : null
      }
      actions={
        editHref ? (
          <Link href={editHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
            <Pencil className="size-3.5" />
            Edit
          </Link>
        ) : null
      }
    >
      {student ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <DetailSection title="Personal">
            <DetailGrid>
              <DetailField label="First name" value={student.first_name} />
              <DetailField label="Last name" value={student.last_name} />
              <DetailField label="Gender" value={student.gender ? student.gender.replaceAll("_", " ") : "—"} />
              <DetailField label="Date of birth" value={formatDate(student.date_of_birth)} />
              <DetailField label="Region" value={student.region} />
              <DetailField label="Admission date" value={formatDate(student.admission_date)} />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Enrollment">
            <DetailGrid>
              <DetailField label="Class" value={student.class_level_name} />
              <DetailField label="Section" value={student.section_name} />
              <DetailField label="School roll number" value={student.roll_number} />
              <DetailField
                label="Board roll number"
                value={student.is_board_class ? student.board_roll_number || "—" : "N/A"}
              />
              <DetailField label="Status" value={student.status.replaceAll("_", " ")} />
            </DetailGrid>
          </DetailSection>

          {showFees ? (
            <DetailSection title="Monthly fees">
              <DetailGrid>
                <DetailField label="Class monthly fee" value={formatMoney(student.monthly_fee_base)} />
                <DetailField label="Discount" value={formatMoney(student.monthly_fee_discount)} />
                <DetailField label="Net monthly fee" value={formatMoney(student.monthly_fee_effective)} />
                <DetailField label="Discount note" value={student.fee_notes_display} className="sm:col-span-2" />
              </DetailGrid>
            </DetailSection>
          ) : null}

          <DetailSection title="Family & guardian" className={showFees ? undefined : "lg:col-span-2"}>
            <DetailGrid>
              <DetailField label="Father's name" value={student.father_name} />
              <DetailField label="Mother's name" value={student.mother_name} />
              <DetailField label="Father CNIC" value={student.father_cnic} />
              <DetailField label="Mother CNIC" value={student.mother_cnic} />
              <DetailField label="Guardian phone" value={student.guardian_phone} />
              <DetailField label="Alternate phone" value={student.parent_alternate_phone} />
              <DetailField label="Parent occupation" value={student.parent_occupation} />
              <DetailField label="Parent email" value={student.parent_email} className="sm:col-span-2" />
              <DetailField label="Address" value={student.address} className="sm:col-span-2 lg:col-span-3" />
            </DetailGrid>
          </DetailSection>
        </div>
      ) : null}
    </EntityDetailShell>
  );
}
