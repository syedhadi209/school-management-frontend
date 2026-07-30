"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { CapacityBar } from "@/components/data/capacity-bar";
import { ConfirmDialog } from "@/components/data/confirm-dialog";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { TablePagination } from "@/components/data/table-pagination";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Section = {
  id: number;
  name: string;
  class_level: number;
  class_level_name?: string;
  class_teacher: number | null;
  class_teacher_name?: string;
  shift: string;
  capacity: number;
  student_count: number;
};

type SectionPayload = {
  name: string;
  class_level: number | null;
  class_teacher: number | null;
  shift: string;
  capacity: number;
};

type ClassLevel = { id: number; name: string };
type TeacherProfile = { id: number; full_name?: string; email?: string };

const sectionHooks = createCrudHooks<Section, SectionPayload>("/sections/");
const classLevelHooks = createCrudHooks<ClassLevel, Record<string, unknown>>("/class-levels/");
const teacherHooks = createCrudHooks<TeacherProfile, Record<string, unknown>>("/accounts/teachers/");

const emptyPayload: SectionPayload = {
  name: "",
  class_level: null,
  class_teacher: null,
  shift: "daily",
  capacity: 30,
};

export default function SchoolAdminSectionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Section | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payload, setPayload] = useState<SectionPayload>(emptyPayload);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);

  const listQuery = sectionHooks.useList({ page, search });
  const levelsQuery = classLevelHooks.useList({ page: 1 });
  const teachersQuery = teacherHooks.useList({ page: 1 });
  const createMutation = sectionHooks.useCreate({ successMessage: "Section created." });
  const updateMutation = sectionHooks.useUpdate({ successMessage: "Section updated." });
  const deleteMutation = sectionHooks.useDelete({ successMessage: "Section deleted." });

  const sections = listQuery.data?.results ?? [];
  const total = listQuery.data?.count ?? 0;
  const levels = levelsQuery.data?.results ?? [];
  const teachers = teachersQuery.data?.results ?? [];

  function openCreate() {
    setEditing(null);
    setPayload(emptyPayload);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(section: Section) {
    setEditing(section);
    setFormError(null);
    setPayload({
      name: section.name,
      class_level: section.class_level,
      class_teacher: section.class_teacher,
      shift: section.shift,
      capacity: section.capacity,
    });
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    if (!payload.name.trim()) {
      setFormError("Enter a section name, for example A or B.");
      return;
    }
    if (!payload.class_level) {
      setFormError(
        levels.length === 0
          ? "This school has no classes yet. Create a class first, then add sections like A and B."
          : "Choose which class this section belongs to, for example Class 1.",
      );
      return;
    }
    if (!payload.capacity || payload.capacity < 1) {
      setFormError("Maximum students must be at least 1.");
      return;
    }

    setFormError(null);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not save this section. Please try again."));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Sections sit inside a class. For example, Class 1 can have sections A, B, and C — each with its own capacity and
        teacher.
      </p>

      <DataTableShell
        title="Sections"
        count={total}
        searchValue={search}
        searchPlaceholder="Search sections by name"
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCreate={openCreate}
        createLabel="Create Section"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Section</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell className="font-medium">{section.name}</TableCell>
                <TableCell>
                  <CapacityBar enrolled={section.student_count ?? 0} capacity={section.capacity} />
                </TableCell>
                <TableCell>{section.class_level_name || "-"}</TableCell>
                <TableCell className="uppercase">{section.shift}</TableCell>
                <TableCell>{section.class_teacher_name || "-"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => openEdit(section)}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => setDeleteTarget(section)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sections.length === 0 && !listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {levels.length === 0 ? (
                    <>
                      Add a{" "}
                      <Link href="/school-admin/classes" className="font-medium text-primary underline">
                        class
                      </Link>{" "}
                      first (for example Class 1), then create sections A and B inside it.
                    </>
                  ) : (
                    "No sections found."
                  )}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          total={total}
          hasNext={Boolean(listQuery.data?.next)}
          hasPrevious={Boolean(listQuery.data?.previous)}
          onPageChange={setPage}
        />
      </DataTableShell>

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editing ? "Edit Section" : "Create Section"}
        description="Choose the parent class, then set the section letter, capacity, schedule, and teacher."
        submitLabel={editing ? "Save Changes" : "Create Section"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Class"
            hint={
              levels.length === 0
                ? "No classes exist yet — create Class 1 on the Classes page first."
                : "The class this section belongs to, such as Class 1."
            }
            required
          >
            {levels.length === 0 && !levelsQuery.isLoading ? (
              <Link
                href="/school-admin/classes"
                className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
              >
                Add a class
              </Link>
            ) : (
              <Select
                value={payload.class_level ?? ""}
                onChange={(e) =>
                  setPayload((p) => ({ ...p, class_level: e.target.value ? Number(e.target.value) : null }))
                }
              >
                <option value="">Choose a class</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label="Section name" hint="A short label such as A, B, or Morning." required>
            <Input
              value={payload.name}
              placeholder="e.g. A"
              onChange={(e) => setPayload((p) => ({ ...p, name: e.target.value }))}
            />
          </FormField>
          <FormField
            label="Maximum students"
            hint="The highest number of students allowed in this section."
            required
          >
            <Input
              type="number"
              min={1}
              value={payload.capacity}
              placeholder="e.g. 30 students"
              onChange={(e) => setPayload((p) => ({ ...p, capacity: Number(e.target.value) || 0 }))}
            />
          </FormField>
          <FormField label="Class teacher" hint="Optional. You can assign or change the teacher later.">
            <Select
              value={payload.class_teacher ?? ""}
              onChange={(e) =>
                setPayload((p) => ({ ...p, class_teacher: e.target.value ? Number(e.target.value) : null }))
              }
            >
              <option value="">No teacher assigned</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name || teacher.email || `Teacher ${teacher.id}`}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Meeting schedule"
            hint="Daily, Monday/Wednesday/Friday, or Tuesday/Thursday/Friday."
            required
            className="sm:col-span-2"
          >
            <Select value={payload.shift} onChange={(e) => setPayload((p) => ({ ...p, shift: e.target.value }))}>
              <option value="daily">Daily</option>
              <option value="mwf">Monday, Wednesday & Friday (MWF)</option>
              <option value="tthf">Tuesday, Thursday & Friday (TTHF)</option>
            </Select>
          </FormField>
        </div>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete section?"
        description="Students linked to this section may be affected."
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
