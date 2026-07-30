"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Pencil, Trash2, X } from "lucide-react";

import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { CapacityBar } from "@/components/data/capacity-bar";
import { ConfirmDialog } from "@/components/data/confirm-dialog";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { TablePagination } from "@/components/data/table-pagination";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  teachers?: number[];
  teacher_names?: string[];
  shift: string;
  capacity: number;
  student_count: number;
};

type SectionPayload = {
  name: string;
  class_level: number | null;
  class_teacher: number | null;
  teachers: number[];
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
  teachers: [],
  shift: "daily",
  capacity: 30,
};

const shiftLabels: Record<string, string> = {
  daily: "Daily",
  mwf: "Monday, Wednesday & Friday (MWF)",
  tthf: "Tuesday, Thursday & Friday (TTHF)",
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
  const levelsQuery = classLevelHooks.useList({ page: 1, page_size: 200 });
  const teachersQuery = teacherHooks.useList({ page: 1, page_size: 200 });
  const createMutation = sectionHooks.useCreate({ successMessage: "Section created." });
  const updateMutation = sectionHooks.useUpdate({ successMessage: "Section updated." });
  const deleteMutation = sectionHooks.useDelete({ successMessage: "Section deleted." });

  const sections = listQuery.data?.results ?? [];
  const total = listQuery.data?.count ?? 0;
  const levels = levelsQuery.data?.results ?? [];
  const teachers = teachersQuery.data?.results ?? [];

  function teacherLabel(teacher: TeacherProfile) {
    return teacher.full_name || teacher.email || `Teacher ${teacher.id}`;
  }

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
      teachers: section.teachers ?? [],
      shift: section.shift,
      capacity: section.capacity,
    });
    setIsModalOpen(true);
  }

  function toggleTeacher(teacherId: number) {
    setPayload((prev) => {
      const exists = prev.teachers.includes(teacherId);
      const teachers = exists
        ? prev.teachers.filter((id) => id !== teacherId)
        : [...prev.teachers, teacherId];
      const class_teacher =
        prev.class_teacher && !teachers.includes(prev.class_teacher) ? null : prev.class_teacher;
      return { ...prev, teachers, class_teacher };
    });
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
          : "Choose which class this section belongs to, for example Class 1."
      );
      return;
    }
    if (!payload.capacity || payload.capacity < 1) {
      setFormError("Maximum students must be at least 1.");
      return;
    }
    if (payload.class_teacher && !payload.teachers.includes(payload.class_teacher)) {
      setFormError("The class incharge must also be one of the assigned teachers.");
      return;
    }

    setFormError(null);
    try {
      const body = {
        ...payload,
        teachers:
          payload.class_teacher && !payload.teachers.includes(payload.class_teacher)
            ? [...payload.teachers, payload.class_teacher]
            : payload.teachers,
      };
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: body });
      } else {
        await createMutation.mutateAsync(body);
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
        Sections sit inside a class. Each section can have several teachers, and optionally one class incharge.
        The same teacher can also teach in more than one section.
      </p>

      <DataTableShell
        title="Sections"
        count={total}
        searchValue={search}
        searchPlaceholder="Search sections by name or teacher"
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
              <TableHead>Class incharge</TableHead>
              <TableHead>Teachers</TableHead>
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
                <TableCell>{section.class_teacher_name || "—"}</TableCell>
                <TableCell>
                  {section.teacher_names?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {section.teacher_names.map((name) => (
                        <span
                          key={name}
                          className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
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
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
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
        description="Choose the parent class, assign teachers, and optionally pick a class incharge."
        submitLabel={editing ? "Save Changes" : "Create Section"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-2xl"
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
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <span className={cn(!payload.class_level && "text-muted-foreground")}>
                    {levels.find((level) => level.id === payload.class_level)?.name ?? "Choose a class"}
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-72">
                  <DropdownMenuRadioGroup
                    value={payload.class_level ? String(payload.class_level) : ""}
                    onValueChange={(value) =>
                      setPayload((prev) => ({ ...prev, class_level: value ? Number(value) : null }))
                    }
                  >
                    <DropdownMenuLabel>Select class</DropdownMenuLabel>
                    {levels.map((level) => (
                      <DropdownMenuRadioItem key={level.id} value={String(level.id)}>
                        {level.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <FormField
            label="Meeting schedule"
            hint="Daily, Monday/Wednesday/Friday, or Tuesday/Thursday/Friday."
            required
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-9 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <span>{shiftLabels[payload.shift] ?? payload.shift}</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={payload.shift}
                  onValueChange={(value) => setPayload((prev) => ({ ...prev, shift: value }))}
                >
                  <DropdownMenuLabel>Select schedule</DropdownMenuLabel>
                  {Object.entries(shiftLabels).map(([value, label]) => (
                    <DropdownMenuRadioItem key={value} value={value}>
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </FormField>

          <FormField
            label="Assigned teachers"
            hint="Select every teacher who teaches in this section. One teacher can be assigned to many sections."
            className="sm:col-span-2"
          >
            {teachers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                No teachers yet.{" "}
                <Link href="/school-admin/teachers" className="font-semibold text-primary underline underline-offset-2">
                  Add teachers first
                </Link>
                .
              </div>
            ) : (
              <div className="space-y-3">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <span className={cn(payload.teachers.length === 0 && "text-muted-foreground")}>
                      {payload.teachers.length === 0
                        ? "Choose teachers"
                        : `${payload.teachers.length} teacher${payload.teachers.length === 1 ? "" : "s"} selected`}
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-72">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Assigned teachers</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {teachers.map((teacher) => (
                        <DropdownMenuCheckboxItem
                          key={teacher.id}
                          checked={payload.teachers.includes(teacher.id)}
                          onCheckedChange={() => toggleTeacher(teacher.id)}
                        >
                          {teacherLabel(teacher)}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {payload.teachers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {teachers
                      .filter((teacher) => payload.teachers.includes(teacher.id))
                      .map((teacher) => (
                        <span
                          key={teacher.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        >
                          {teacherLabel(teacher)}
                          <button
                            type="button"
                            aria-label={`Remove ${teacherLabel(teacher)}`}
                            className="rounded-full p-0.5 hover:bg-primary/15"
                            onClick={() => toggleTeacher(teacher.id)}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                ) : null}
              </div>
            )}
          </FormField>

          <FormField
            label="Class incharge"
            hint="Optional. The teacher responsible for this section as class incharge."
            className="sm:col-span-2"
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <span className={cn(!payload.class_teacher && "text-muted-foreground")}>
                  {payload.class_teacher
                    ? teachers.find((teacher) => teacher.id === payload.class_teacher)
                      ? teacherLabel(teachers.find((teacher) => teacher.id === payload.class_teacher)!)
                      : `Teacher ${payload.class_teacher}`
                    : "No class incharge"}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-72">
                <DropdownMenuRadioGroup
                  value={payload.class_teacher ? String(payload.class_teacher) : "none"}
                  onValueChange={(value) => {
                    const classTeacher = value === "none" ? null : Number(value);
                    setPayload((prev) => ({
                      ...prev,
                      class_teacher: classTeacher,
                      teachers:
                        classTeacher && !prev.teachers.includes(classTeacher)
                          ? [...prev.teachers, classTeacher]
                          : prev.teachers,
                    }));
                  }}
                >
                  <DropdownMenuLabel>Select class incharge</DropdownMenuLabel>
                  <DropdownMenuRadioItem value="none">No class incharge</DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  {(payload.teachers.length
                    ? teachers.filter((teacher) => payload.teachers.includes(teacher.id))
                    : teachers
                  ).map((teacher) => (
                    <DropdownMenuRadioItem key={teacher.id} value={String(teacher.id)}>
                      {teacherLabel(teacher)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
