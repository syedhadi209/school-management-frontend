"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { ConfirmDialog } from "@/components/data/confirm-dialog";
import { DataTableShell } from "@/components/data/data-table";
import { ProfileAvatar, ProfileImagePicker } from "@/components/data/profile-image-picker";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { TablePagination } from "@/components/data/table-pagination";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Subject = { id: number; name: string };

const DESIGNATIONS = [
  { value: "subject_teacher", label: "Subject Teacher" },
  { value: "accountant", label: "Accountant" },
  { value: "principal", label: "Principal" },
  { value: "sports_teacher", label: "Sports Teacher" },
  { value: "maid", label: "Maid" },
] as const;

type TeacherProfile = {
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

type TeacherPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  designation: string;
  shift_start_time: string | null;
  shift_end_time: string | null;
  qualification: string;
  joining_date: string | null;
  monthly_salary: string | null;
  address: string;
  cnic: string;
  phone_number: string;
  profile_image: string | null;
  profile_image_file: File | null;
  profile_image_clear: boolean;
  subjects_taught: number[];
};

const teacherHooks = createCrudHooks<TeacherProfile, TeacherPayload>("/accounts/teachers/");
const subjectHooks = createCrudHooks<Subject, { name: string }>("/subjects/");

const emptyPayload: TeacherPayload = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  designation: "subject_teacher",
  shift_start_time: null,
  shift_end_time: null,
  qualification: "",
  joining_date: null,
  monthly_salary: "",
  address: "",
  cnic: "",
  phone_number: "",
  profile_image: null,
  profile_image_file: null,
  profile_image_clear: false,
  subjects_taught: [],
};

function formatSalary(value?: string | null) {
  if (!value) return "-";
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

function designationLabel(value: string) {
  return DESIGNATIONS.find((item) => item.value === value)?.label ?? value.replaceAll("_", " ");
}

function formatShift(start?: string | null, end?: string | null) {
  if (!start || !end) return "-";
  return `${start.slice(0, 5)}–${end.slice(0, 5)}`;
}

export default function SchoolAdminTeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TeacherProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payload, setPayload] = useState<TeacherPayload>(emptyPayload);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherProfile | null>(null);

  const listQuery = teacherHooks.useList({ page, search });
  const subjectsQuery = subjectHooks.useList({ page: 1, page_size: 200 });
  const createMutation = teacherHooks.useCreate({ successMessage: "Teacher created." });
  const updateMutation = teacherHooks.useUpdate({ successMessage: "Teacher updated." });
  const deleteMutation = teacherHooks.useDelete({ successMessage: "Teacher deleted." });

  const teachers = listQuery.data?.results ?? [];
  const subjects = subjectsQuery.data?.results ?? [];

  const selectedSubjectNames = useMemo(() => {
    const byId = new Map(subjects.map((subject) => [subject.id, subject.name]));
    return payload.subjects_taught.map((id) => byId.get(id)).filter(Boolean) as string[];
  }, [payload.subjects_taught, subjects]);

  function openCreate() {
    setEditing(null);
    setPayload(emptyPayload);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(teacher: TeacherProfile) {
    const [firstName = "", ...rest] = (teacher.full_name || "").trim().split(" ");
    setEditing(teacher);
    setFormError(null);
    setPayload({
      first_name: firstName,
      last_name: rest.join(" "),
      email: teacher.email || "",
      password: "",
      designation: teacher.designation ?? "subject_teacher",
      shift_start_time: teacher.shift_start_time ?? null,
      shift_end_time: teacher.shift_end_time ?? null,
      qualification: teacher.qualification ?? "",
      joining_date: teacher.joining_date ?? null,
      monthly_salary: teacher.monthly_salary ?? "",
      address: teacher.address ?? "",
      cnic: teacher.cnic ?? "",
      phone_number: teacher.phone_number ?? "",
      profile_image: teacher.profile_image ?? null,
      profile_image_file: null,
      profile_image_clear: false,
      subjects_taught: teacher.subjects_taught ?? [],
    });
    setIsModalOpen(true);
  }

  function toggleSubject(subjectId: number) {
    setPayload((prev) => {
      const exists = prev.subjects_taught.includes(subjectId);
      return {
        ...prev,
        subjects_taught: exists
          ? prev.subjects_taught.filter((id) => id !== subjectId)
          : [...prev.subjects_taught, subjectId],
      };
    });
  }

  async function handleSubmit() {
    if (!payload.first_name.trim()) {
      setFormError("Enter the teacher's first name.");
      return;
    }
    if (!editing && !payload.email.trim()) {
      setFormError("Enter the teacher's email. They will use this to log in.");
      return;
    }
    if (!editing && payload.password.length < 8) {
      setFormError("Choose a password with at least 8 characters.");
      return;
    }

    setFormError(null);
    try {
      const shared: Record<string, unknown> = {
        first_name: payload.first_name,
        last_name: payload.last_name,
        qualification: payload.qualification,
        designation: payload.designation,
        shift_start_time: payload.shift_start_time || null,
        shift_end_time: payload.shift_end_time || null,
        joining_date: payload.joining_date || null,
        monthly_salary: payload.monthly_salary ? payload.monthly_salary : null,
        address: payload.address,
        cnic: payload.cnic,
        phone_number: payload.phone_number,
        profile_image_clear: payload.profile_image_clear,
        subjects_taught: payload.subjects_taught,
      };
      if (payload.profile_image_file) {
        shared.profile_image = payload.profile_image_file;
      } else if (payload.profile_image_clear) {
        shared.profile_image = "";
      }

      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload: shared,
        });
      } else {
        await createMutation.mutateAsync({
          email: payload.email,
          password: payload.password,
          ...shared,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not save this teacher. Please try again."));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div>
      <DataTableShell
        title="Teachers"
        count={listQuery.data?.count ?? 0}
        searchValue={search}
        searchPlaceholder="Search teachers by name, email, phone, or subject"
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCreate={openCreate}
        createLabel="Add Teacher"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>
                  <ProfileAvatar
                    size="sm"
                    name={teacher.full_name || `User #${teacher.user}`}
                    imageUrl={teacher.profile_image}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold">{teacher.employee_id || "-"}</TableCell>
                <TableCell>
                  <div className="font-medium">{teacher.full_name || `User #${teacher.user}`}</div>
                  <div className="text-xs text-muted-foreground">{teacher.email || "-"}</div>
                </TableCell>
                <TableCell className="capitalize">{designationLabel(teacher.designation)}</TableCell>
                <TableCell>{teacher.phone_number || "-"}</TableCell>
                <TableCell>
                  {teacher.subject_names?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {teacher.subject_names.map((name) => (
                        <span
                          key={name}
                          className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{formatSalary(teacher.monthly_salary)}</TableCell>
                <TableCell>{formatShift(teacher.shift_start_time, teacher.shift_end_time)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => openEdit(teacher)}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => setDeleteTarget(teacher)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && !listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  No teachers yet. Add a teacher with their account, contact, and employment details.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          total={listQuery.data?.count ?? 0}
          hasNext={Boolean(listQuery.data?.next)}
          hasPrevious={Boolean(listQuery.data?.previous)}
          onPageChange={setPage}
        />
      </DataTableShell>

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editing ? "Edit Teacher" : "Add Teacher"}
        description={
          editing
            ? "Update this teacher's account, contact, and employment details."
            : "Create a login account and teacher profile in one step."
        }
        submitLabel={editing ? "Save Changes" : "Add Teacher"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-2xl"
      >
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-bold">Account details</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              {editing ? (
                <FormField label="Employee ID" hint="Generated automatically and cannot be changed." className="sm:col-span-2">
                  <Input value={editing.employee_id || ""} disabled />
                </FormField>
              ) : (
                <p className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
                  A unique employee ID will be created automatically, such as <strong>TCH-2026-0001</strong>.
                </p>
              )}
              <FormField label="First name" required>
                <Input
                  placeholder="e.g. Sara"
                  value={payload.first_name}
                  onChange={(e) => setPayload((prev) => ({ ...prev, first_name: e.target.value }))}
                />
              </FormField>
              <FormField label="Last name">
                <Input
                  placeholder="e.g. Ahmed"
                  value={payload.last_name}
                  onChange={(e) => setPayload((prev) => ({ ...prev, last_name: e.target.value }))}
                />
              </FormField>
              {editing ? (
                <FormField label="Email" hint="Login email cannot be changed here." className="sm:col-span-2">
                  <Input value={payload.email} disabled />
                </FormField>
              ) : (
                <>
                  <FormField label="Email" hint="The teacher will use this email to log in." required>
                    <Input
                      type="email"
                      placeholder="e.g. sara.ahmed@school.com"
                      value={payload.email}
                      onChange={(e) => setPayload((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Temporary password" hint="At least 8 characters." required>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      value={payload.password}
                      onChange={(e) => setPayload((prev) => ({ ...prev, password: e.target.value }))}
                    />
                  </FormField>
                </>
              )}
              <FormField
                label="Profile image"
                hint="Optional photo shown in teacher lists."
                className="sm:col-span-2"
              >
                <ProfileImagePicker
                  name={`${payload.first_name} ${payload.last_name}`.trim() || "Teacher"}
                  imageUrl={payload.profile_image}
                  imageFile={payload.profile_image_file}
                  clearRequested={payload.profile_image_clear}
                  onFileChange={(file) =>
                    setPayload((prev) => ({
                      ...prev,
                      profile_image_file: file,
                    }))
                  }
                  onClearChange={(value) =>
                    setPayload((prev) => ({
                      ...prev,
                      profile_image_clear: value,
                      profile_image_file: value ? null : prev.profile_image_file,
                    }))
                  }
                  onError={(message) => setFormError(message)}
                />
              </FormField>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold">Contact details</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Phone number">
                <Input
                  type="tel"
                  placeholder="e.g. 0300 1234567"
                  value={payload.phone_number}
                  onChange={(e) => setPayload((prev) => ({ ...prev, phone_number: e.target.value }))}
                />
              </FormField>
              <FormField label="CNIC" hint="Optional. Format 00000-0000000-0.">
                <Input
                  placeholder="00000-0000000-0"
                  value={payload.cnic}
                  onChange={(e) => setPayload((prev) => ({ ...prev, cnic: e.target.value }))}
                />
              </FormField>
              <FormField label="Home address" className="sm:col-span-2">
                <textarea
                  className="flex min-h-20 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  placeholder="House / street, area, city"
                  value={payload.address}
                  onChange={(e) => setPayload((prev) => ({ ...prev, address: e.target.value }))}
                />
              </FormField>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold">Employment details</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Designation" required>
                <Select
                  value={payload.designation}
                  onChange={(e) => setPayload((prev) => ({ ...prev, designation: e.target.value }))}
                >
                  {DESIGNATIONS.map((designation) => (
                    <option key={designation.value} value={designation.value}>
                      {designation.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Qualification" hint="Highest degree or teaching credential.">
                <Input
                  placeholder="e.g. MSc Mathematics"
                  value={payload.qualification}
                  onChange={(e) => setPayload((prev) => ({ ...prev, qualification: e.target.value }))}
                />
              </FormField>
              <FormField label="Monthly salary (PKR)">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                    PKR
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    className="pl-12"
                    placeholder="e.g. 75000"
                    value={payload.monthly_salary ?? ""}
                    onChange={(e) => setPayload((prev) => ({ ...prev, monthly_salary: e.target.value }))}
                  />
                </div>
              </FormField>
              <FormField label="Joining date" hint="The teacher's first working day.">
                <Input
                  type="date"
                  value={payload.joining_date ?? ""}
                  onChange={(e) => setPayload((prev) => ({ ...prev, joining_date: e.target.value || null }))}
                />
              </FormField>
              <FormField label="Shift start time" hint="The employee's normal reporting time.">
                <Input
                  type="time"
                  value={payload.shift_start_time ?? ""}
                  onChange={(e) =>
                    setPayload((prev) => ({ ...prev, shift_start_time: e.target.value || null }))
                  }
                />
              </FormField>
              <FormField label="Shift end time" hint="Must be later than the start time.">
                <Input
                  type="time"
                  value={payload.shift_end_time ?? ""}
                  onChange={(e) =>
                    setPayload((prev) => ({ ...prev, shift_end_time: e.target.value || null }))
                  }
                />
              </FormField>
              <FormField
                label="Subjects taught"
                hint="Select the subjects this teacher can teach. Section assignments are managed separately."
                className="sm:col-span-2"
              >
                {subjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                    No subjects yet.{" "}
                    <Link href="/school-admin/subjects" className="font-semibold text-primary underline underline-offset-2">
                      Add subjects first
                    </Link>
                    .
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {subjects.map((subject) => {
                        const checked = payload.subjects_taught.includes(subject.id);
                        return (
                          <label
                            key={subject.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                              checked
                                ? "border-primary/40 bg-primary/10"
                                : "border-border hover:bg-muted/40"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSubject(subject.id)}
                              className="size-4 rounded border-input"
                            />
                            <span className="font-medium">{subject.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    {selectedSubjectNames.length > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedSubjectNames.join(", ")}
                      </p>
                    ) : null}
                  </div>
                )}
              </FormField>
            </div>
          </section>
        </div>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete teacher?"
        description="This removes the teacher profile from this school. Their login account may also be affected."
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
