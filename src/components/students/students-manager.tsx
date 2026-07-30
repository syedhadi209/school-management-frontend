"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { StatusTabs } from "@/components/data/status-tabs";
import { TablePagination } from "@/components/data/table-pagination";
import { FormModal } from "@/components/data/form-modal";
import { ConfirmDialog } from "@/components/data/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Student = {
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
  gender: string;
};

type StudentPayload = {
  first_name: string;
  last_name: string;
  section: number | null;
  status: string;
  region: string;
  guardian_phone: string;
  gender: string;
  board_roll_number: string;
};

type Section = {
  id: number;
  name: string;
  class_level_name?: string;
  is_board_class?: boolean;
  shift?: string;
};

const studentHooks = createCrudHooks<Student, StudentPayload>("/students/");
const sectionHooks = createCrudHooks<Section, Record<string, unknown>>("/sections/");

const statusTabs = [
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "waiting_list", label: "Waiting List" },
  { key: "withdrawn", label: "Dropouts" },
  { key: "archived", label: "Archive" },
];

const emptyStudent: StudentPayload = {
  first_name: "",
  last_name: "",
  section: null,
  status: "active",
  region: "",
  guardian_phone: "",
  gender: "",
  board_roll_number: "",
};

export function StudentsManager({
  mode = "full",
}: {
  mode?: "full" | "boardRollOnly";
}) {
  const isTeacherMode = mode === "boardRollOnly";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [editing, setEditing] = useState<Student | null>(null);
  const [formState, setFormState] = useState<StudentPayload>(emptyStudent);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = studentHooks.useList(
    isTeacherMode ? { page, search } : { page, search, status }
  );
  const sectionsQuery = sectionHooks.useList({ page: 1 }, { enabled: !isTeacherMode });
  const createMutation = studentHooks.useCreate({ successMessage: "Student created." });
  const updateMutation = studentHooks.useUpdate({ successMessage: "Student updated." });
  const deleteMutation = studentHooks.useDelete({ successMessage: "Student deleted." });

  const students = listQuery.data?.results ?? [];
  const total = listQuery.data?.count ?? 0;
  const sections = sectionsQuery.data?.results ?? [];

  const selectedSection = sections.find((section) => section.id === formState.section);
  const showBoardRollField =
    Boolean(editing?.is_board_class) ||
    Boolean(selectedSection?.is_board_class) ||
    (isTeacherMode && Boolean(editing?.is_board_class));

  const tabsWithCount = useMemo(() => {
    return statusTabs.map((tab) => ({
      ...tab,
      count: tab.key === status ? total : undefined,
    }));
  }, [status, total]);

  function openCreate() {
    setEditing(null);
    setFormState(emptyStudent);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(student: Student) {
    setEditing(student);
    setFormError(null);
    setFormState({
      first_name: student.first_name,
      last_name: student.last_name,
      section: student.section,
      status: student.status,
      region: student.region ?? "",
      guardian_phone: student.guardian_phone ?? "",
      gender: student.gender ?? "",
      board_roll_number: student.board_roll_number ?? "",
    });
    setIsModalOpen(true);
  }

  async function submitForm() {
    if (isTeacherMode) {
      if (!editing) return;
      if (!editing.is_board_class) {
        setFormError("This student is not in a board examination class.");
        return;
      }
      setFormError(null);
      try {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload: { board_roll_number: formState.board_roll_number.trim() },
        });
        setIsModalOpen(false);
      } catch (error) {
        setFormError(extractApiErrorMessage(error, "Could not save the board roll number."));
      }
      return;
    }

    if (!formState.first_name.trim()) {
      setFormError("Enter the student's first name.");
      return;
    }
    if (!formState.last_name.trim()) {
      setFormError("Enter the student's last name.");
      return;
    }
    if (formState.board_roll_number.trim() && !showBoardRollField) {
      setFormError("Board roll numbers can only be set for students in a board examination class.");
      return;
    }

    setFormError(null);
    try {
      const payload = {
        ...formState,
        board_roll_number: showBoardRollField ? formState.board_roll_number.trim() : "",
      };
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not save this student. Please try again."));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      {isTeacherMode ? (
        <p className="text-sm text-muted-foreground">
          These are students in sections where you are the class teacher. For board examination classes you can enter
          each student&apos;s official board roll number once the board issues it.
        </p>
      ) : null}

      {!isTeacherMode ? (
        <StatusTabs
          tabs={tabsWithCount}
          activeKey={status}
          onChange={(nextStatus) => {
            setStatus(nextStatus);
            setPage(1);
          }}
        />
      ) : null}

      <DataTableShell
        title={isTeacherMode ? "My Students" : "Active Students"}
        count={total}
        searchValue={search}
        searchPlaceholder="Search students"
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCreate={isTeacherMode ? undefined : openCreate}
        createLabel="Add Student"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No.</TableHead>
              <TableHead>Board Roll No.</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Class</TableHead>
              {!isTeacherMode ? <TableHead>Region</TableHead> : null}
              {!isTeacherMode ? <TableHead>Status</TableHead> : <TableHead>Board</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-mono text-xs font-semibold">{student.roll_number || "-"}</TableCell>
                <TableCell className="font-mono text-xs font-semibold">
                  {student.is_board_class ? student.board_roll_number || "—" : "N/A"}
                </TableCell>
                <TableCell className="font-medium">
                  {student.full_name || `${student.first_name} ${student.last_name}`}
                </TableCell>
                <TableCell>{student.section_name || "-"}</TableCell>
                <TableCell>{student.class_level_name || "-"}</TableCell>
                {!isTeacherMode ? <TableCell>{student.region || "-"}</TableCell> : null}
                {!isTeacherMode ? (
                  <TableCell className="capitalize">{student.status.replace("_", " ")}</TableCell>
                ) : (
                  <TableCell>
                    {student.is_board_class ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        Board
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Regular</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => openEdit(student)}
                      disabled={isTeacherMode && !student.is_board_class}
                      title={
                        isTeacherMode && !student.is_board_class
                          ? "Only board-class students have a board roll number"
                          : undefined
                      }
                    >
                      <Pencil className="size-4" />
                    </button>
                    {!isTeacherMode ? (
                      <button
                        type="button"
                        className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                        onClick={() => setDeleteTarget(student)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && !listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  {isTeacherMode
                    ? "No students in your assigned sections yet."
                    : "No students found."}
                </TableCell>
              </TableRow>
            ) : null}
            {listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  Loading students...
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
        title={
          isTeacherMode
            ? "Update Board Roll Number"
            : editing
              ? "Edit Student"
              : "Add Student"
        }
        description={
          isTeacherMode
            ? "Enter the official board examination roll number issued for this student."
            : "Enter the student's personal, contact, and enrollment details."
        }
        submitLabel={editing || isTeacherMode ? "Save Changes" : "Create Student"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={submitForm}
      >
        {isTeacherMode ? (
          <div className="grid gap-5">
            <FormField label="Student">
              <Input
                value={editing?.full_name || `${editing?.first_name ?? ""} ${editing?.last_name ?? ""}`}
                disabled
              />
            </FormField>
            <FormField label="Class & section">
              <Input
                value={`${editing?.class_level_name || "-"} - ${editing?.section_name || "-"}`}
                disabled
              />
            </FormField>
            <FormField label="School roll number" hint="Internal School OS roll number.">
              <Input value={editing?.roll_number || ""} disabled />
            </FormField>
            <FormField
              label="Board roll number"
              hint="Entered manually after the board issues the number. Leave blank until then."
            >
              <Input
                placeholder="e.g. 452187"
                value={formState.board_roll_number}
                onChange={(e) => setFormState((prev) => ({ ...prev, board_roll_number: e.target.value }))}
              />
            </FormField>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {editing ? (
              <FormField label="Roll number" hint="Generated automatically and cannot be changed.">
                <Input value={editing.roll_number || ""} disabled />
              </FormField>
            ) : (
              <p className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
                A unique school roll number will be created automatically, such as <strong>STU-2026-0001</strong>.
              </p>
            )}
            {showBoardRollField ? (
              <FormField
                label="Board roll number"
                hint="Optional until the board issues it. Must be unique within this school."
                className={editing ? undefined : "sm:col-span-2"}
              >
                <Input
                  placeholder="e.g. 452187"
                  value={formState.board_roll_number}
                  onChange={(e) => setFormState((prev) => ({ ...prev, board_roll_number: e.target.value }))}
                />
              </FormField>
            ) : null}
            <FormField label="First name" required>
              <Input
                placeholder="e.g. Ahmed"
                value={formState.first_name}
                onChange={(e) => setFormState((prev) => ({ ...prev, first_name: e.target.value }))}
              />
            </FormField>
            <FormField label="Last name">
              <Input
                placeholder="e.g. Khan"
                value={formState.last_name}
                onChange={(e) => setFormState((prev) => ({ ...prev, last_name: e.target.value }))}
              />
            </FormField>
            <FormField label="City or region" hint="Used for student records and reporting.">
              <Input
                placeholder="e.g. Lahore"
                value={formState.region}
                onChange={(e) => setFormState((prev) => ({ ...prev, region: e.target.value }))}
              />
            </FormField>
            <FormField label="Guardian phone" hint="Include the area or country code where needed.">
              <Input
                type="tel"
                placeholder="e.g. 0300 1234567"
                value={formState.guardian_phone}
                onChange={(e) => setFormState((prev) => ({ ...prev, guardian_phone: e.target.value }))}
              />
            </FormField>
            <FormField label="Gender">
              <Select
                value={formState.gender}
                onChange={(e) => setFormState((prev) => ({ ...prev, gender: e.target.value }))}
              >
                <option value="">Choose gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
            <FormField label="Enrollment status" hint="Use Active for students currently attending." required>
              <Select
                value={formState.status}
                onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="pending">Pending admission</option>
                <option value="waiting_list">Waiting list</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="archived">Archived</option>
                <option value="repeating">Repeating</option>
              </Select>
            </FormField>
            <FormField label="Class & section" hint="Choose Class 1 - A, Class 2 - B, and so on." className="sm:col-span-2">
              <Select
                value={formState.section ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    section: e.target.value ? Number(e.target.value) : null,
                    board_roll_number: e.target.value
                      ? sections.find((section) => section.id === Number(e.target.value))?.is_board_class
                        ? prev.board_roll_number
                        : ""
                      : "",
                  }))
                }
              >
                <option value="">Not assigned yet</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.class_level_name ? `${section.class_level_name} - ` : ""}
                    {section.name}
                    {section.is_board_class ? " (Board)" : ""}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        )}
      </FormModal>

      {!isTeacherMode ? (
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title="Delete student?"
          description="This action cannot be undone."
          loading={deleteMutation.isPending}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
