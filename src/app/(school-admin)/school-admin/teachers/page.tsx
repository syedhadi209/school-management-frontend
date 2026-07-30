"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { ConfirmDialog } from "@/components/data/confirm-dialog";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { TablePagination } from "@/components/data/table-pagination";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TeacherProfile = {
  id: number;
  user: number;
  full_name?: string;
  email?: string;
  employee_id?: string;
  qualification: string;
  joining_date: string | null;
};

type TeacherPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  qualification: string;
  joining_date: string | null;
};

const teacherHooks = createCrudHooks<TeacherProfile, TeacherPayload>("/accounts/teachers/");

const emptyPayload: TeacherPayload = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  qualification: "",
  joining_date: null,
};

export default function SchoolAdminTeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TeacherProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payload, setPayload] = useState<TeacherPayload>(emptyPayload);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherProfile | null>(null);

  const listQuery = teacherHooks.useList({ page, search });
  const createMutation = teacherHooks.useCreate({ successMessage: "Teacher created." });
  const updateMutation = teacherHooks.useUpdate({ successMessage: "Teacher updated." });
  const deleteMutation = teacherHooks.useDelete({ successMessage: "Teacher deleted." });

  const teachers = listQuery.data?.results ?? [];

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
      qualification: teacher.qualification ?? "",
      joining_date: teacher.joining_date ?? null,
    });
    setIsModalOpen(true);
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
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload: {
            first_name: payload.first_name,
            last_name: payload.last_name,
            qualification: payload.qualification,
            joining_date: payload.joining_date || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...payload,
          joining_date: payload.joining_date || null,
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
        searchPlaceholder="Search teachers by name or email"
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
              <TableHead>Employee ID</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-mono text-xs font-semibold">{teacher.employee_id || "-"}</TableCell>
                <TableCell className="font-medium">{teacher.full_name || `User #${teacher.user}`}</TableCell>
                <TableCell>{teacher.email || "-"}</TableCell>
                <TableCell>{teacher.qualification || "-"}</TableCell>
                <TableCell>{teacher.joining_date || "-"}</TableCell>
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
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No teachers yet. Add a teacher with their name, email, and password so they can log in.
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
            ? "Update this teacher's employment details."
            : "Create a login account and teacher profile in one step. The teacher will sign in with the email and password you set."
        }
        submitLabel={editing ? "Save Changes" : "Add Teacher"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleSubmit}
      >
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
              <FormField
                label="Email"
                hint="The teacher will use this email to log in to School OS."
                required
              >
                <Input
                  type="email"
                  placeholder="e.g. sara.ahmed@school.com"
                  value={payload.email}
                  onChange={(e) => setPayload((prev) => ({ ...prev, email: e.target.value }))}
                />
              </FormField>
              <FormField
                label="Temporary password"
                hint="At least 8 characters. Share this with the teacher so they can sign in."
                required
              >
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  value={payload.password}
                  onChange={(e) => setPayload((prev) => ({ ...prev, password: e.target.value }))}
                />
              </FormField>
            </>
          )}
          <FormField label="Qualification" hint="Highest degree or relevant teaching credential.">
            <Input
              placeholder="e.g. MSc Mathematics"
              value={payload.qualification}
              onChange={(e) => setPayload((prev) => ({ ...prev, qualification: e.target.value }))}
            />
          </FormField>
          <FormField label="Joining date" hint="The teacher's first working day.">
            <Input
              type="date"
              value={payload.joining_date ?? ""}
              onChange={(e) => setPayload((prev) => ({ ...prev, joining_date: e.target.value || null }))}
            />
          </FormField>
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
