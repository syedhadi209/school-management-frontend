"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { createCrudHooks, extractApiErrorFields, extractApiErrorMessage } from "@/lib/crud";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { StatusTabs } from "@/components/data/status-tabs";
import { TablePagination } from "@/components/data/table-pagination";
import { FormModal } from "@/components/data/form-modal";
import { ConfirmDialog } from "@/components/data/confirm-dialog";
import {
  EMPTY_FAMILY_DETAILS,
  FAMILY_FIELD_KEYS,
  FamilyDetailsFields,
} from "@/components/students/family-details-fields";
import { DatePicker } from "@/components/data/date-picker";
import { SelectMenu } from "@/components/data/select-menu";
import { Input } from "@/components/ui/input";
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
  parent_invite_pending?: boolean;
};

type StudentPayload = {
  first_name: string;
  last_name: string;
  section: number | null;
  status: string;
  region: string;
  guardian_phone: string;
  parent_alternate_phone: string;
  parent_email: string;
  parent_occupation: string;
  father_name: string;
  mother_name: string;
  father_cnic: string;
  mother_cnic: string;
  address: string;
  gender: string;
  date_of_birth: string;
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

const CREATE_STEPS = [
  { id: "student", label: "Student details" },
  { id: "family", label: "Family details" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const enrollmentStatusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending admission" },
  { value: "waiting_list", label: "Waiting list" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "archived", label: "Archived" },
  { value: "repeating", label: "Repeating" },
];

const UNASSIGNED_SECTION = "unassigned";

const emptyStudent: StudentPayload = {
  first_name: "",
  last_name: "",
  section: null,
  status: "active",
  region: "",
  guardian_phone: "",
  parent_alternate_phone: "",
  parent_email: "",
  parent_occupation: "",
  father_name: "",
  mother_name: "",
  father_cnic: "",
  mother_cnic: "",
  address: "",
  gender: "",
  date_of_birth: "",
  board_roll_number: "",
};

function studentToPayload(student: Student): StudentPayload {
  return {
    first_name: student.first_name,
    last_name: student.last_name,
    section: student.section,
    status: student.status,
    region: student.region ?? "",
    guardian_phone: student.guardian_phone ?? "",
    parent_alternate_phone: student.parent_alternate_phone ?? "",
    parent_email: student.parent_email ?? "",
    parent_occupation: student.parent_occupation ?? "",
    father_name: student.father_name ?? "",
    mother_name: student.mother_name ?? "",
    father_cnic: student.father_cnic ?? "",
    mother_cnic: student.mother_cnic ?? "",
    address: student.address ?? "",
    gender: student.gender ?? "",
    date_of_birth: student.date_of_birth ?? "",
    board_roll_number: student.board_roll_number ?? "",
  };
}

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
  const [createStep, setCreateStep] = useState(0);

  const listQuery = studentHooks.useList(
    isTeacherMode ? { page, search } : { page, search, status }
  );
  const sectionsQuery = sectionHooks.useList(
    { page: 1, page_size: 200 },
    { enabled: !isTeacherMode }
  );
  const createMutation = studentHooks.useCreate({ successMessage: "Student created." });
  const updateMutation = studentHooks.useUpdate({ successMessage: "Student updated." });
  const deleteMutation = studentHooks.useDelete({ successMessage: "Student deleted." });

  const students = listQuery.data?.results ?? [];
  const total = listQuery.data?.count ?? 0;
  const sections = sectionsQuery.data?.results ?? [];

  const selectedSection = sections.find((section) => section.id === formState.section);
  const sectionOptions = useMemo(
    () => [
      { value: UNASSIGNED_SECTION, label: "Not assigned yet" },
      ...sections.map((section) => ({
        value: String(section.id),
        label: `${section.class_level_name ? `${section.class_level_name} - ` : ""}${section.name}${
          section.is_board_class ? " (Board)" : ""
        }`,
      })),
    ],
    [sections]
  );
  const showBoardRollField =
    Boolean(editing?.is_board_class) ||
    Boolean(selectedSection?.is_board_class) ||
    (isTeacherMode && Boolean(editing?.is_board_class));

  const isCreating = !editing && !isTeacherMode;
  const showStepper = isCreating;

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
    setCreateStep(0);
    setIsModalOpen(true);
  }

  function openEdit(student: Student) {
    setEditing(student);
    setFormError(null);
    setCreateStep(0);
    setFormState(studentToPayload(student));
    setIsModalOpen(true);
  }

  function validateStudentStep(): string | null {
    if (!formState.first_name.trim()) return "Enter the student's first name.";
    if (!formState.last_name.trim()) return "Enter the student's last name.";
    if (formState.board_roll_number.trim() && !showBoardRollField) {
      return "Board roll numbers can only be set for students in a board examination class.";
    }
    return null;
  }

  function jumpToErrorStep(error: unknown) {
    const fields = extractApiErrorFields(error);
    if (fields.some((field) => (FAMILY_FIELD_KEYS as readonly string[]).includes(field))) {
      setCreateStep(1);
    } else if (fields.length) {
      setCreateStep(0);
    }
  }

  async function saveStudent() {
    setFormError(null);
    try {
      const payload = {
        ...formState,
        date_of_birth: formState.date_of_birth || null,
        board_roll_number: showBoardRollField ? formState.board_roll_number.trim() : "",
      } as unknown as StudentPayload;
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      if (showStepper) jumpToErrorStep(error);
      setFormError(extractApiErrorMessage(error, "Could not save this student. Please try again."));
    }
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

    if (showStepper && createStep === 0) {
      const stepError = validateStudentStep();
      if (stepError) {
        setFormError(stepError);
        return;
      }
      setFormError(null);
      setCreateStep(1);
      return;
    }

    const stepError = validateStudentStep();
    if (stepError) {
      setFormError(stepError);
      if (showStepper) setCreateStep(0);
      return;
    }

    await saveStudent();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  function renderStudentFields() {
    return (
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
        <FormField label="Last name" required>
          <Input
            placeholder="e.g. Khan"
            value={formState.last_name}
            onChange={(e) => setFormState((prev) => ({ ...prev, last_name: e.target.value }))}
          />
        </FormField>
        <FormField label="Date of birth" hint="Optional. Used for age records and reports.">
          <DatePicker
            value={formState.date_of_birth}
            onChange={(value) => setFormState((prev) => ({ ...prev, date_of_birth: value }))}
            placeholder="Select date of birth"
            disableFuture
            fromYear={new Date().getFullYear() - 25}
            toYear={new Date().getFullYear()}
          />
        </FormField>
        <FormField label="Gender">
          <SelectMenu
            value={formState.gender}
            onValueChange={(value) => setFormState((prev) => ({ ...prev, gender: value }))}
            options={genderOptions}
            placeholder="Choose gender"
            menuLabel="Select gender"
          />
        </FormField>
        <FormField label="Enrollment status" hint="Use Active for students currently attending." required>
          <SelectMenu
            value={formState.status}
            onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value }))}
            options={enrollmentStatusOptions}
            placeholder="Choose status"
            menuLabel="Select status"
          />
        </FormField>
        <FormField
          label="Class & section"
          hint={
            sections.length === 0 && !sectionsQuery.isLoading
              ? "No sections exist yet — create a class first and a section A is added for it automatically."
              : "Choose Class 1 - A, Class 2 - B, and so on."
          }
        >
          <SelectMenu
            value={formState.section ? String(formState.section) : UNASSIGNED_SECTION}
            onValueChange={(value) => {
              const sectionId = value === UNASSIGNED_SECTION ? null : Number(value);
              const isBoardSection = sections.find((section) => section.id === sectionId)?.is_board_class;
              setFormState((prev) => ({
                ...prev,
                section: sectionId,
                board_roll_number: isBoardSection ? prev.board_roll_number : "",
              }));
            }}
            options={sectionOptions}
            placeholder="Not assigned yet"
            menuLabel="Select class & section"
          />
        </FormField>
      </div>
    );
  }

  function renderFamilyFields() {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Family details are optional when adding a student directly. Parent email creates or links a parent
          portal account; the invite email will be sent later.
        </p>
        {editing?.parent_invite_pending ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Parent portal account exists for <strong>{editing.parent_email}</strong>, but the invite has not been
            sent yet so they cannot log in.
          </p>
        ) : null}
        <FamilyDetailsFields
          values={{
            ...EMPTY_FAMILY_DETAILS,
            ...formState,
          }}
          onChange={(patch) => setFormState((prev) => ({ ...prev, ...patch }))}
          showOccupation
        />
      </div>
    );
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
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setCreateStep(0);
        }}
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
            : editing
              ? "Update the student's personal, enrollment, and family details."
              : "Step through student details, then family details."
        }
        submitLabel={
          isTeacherMode || editing
            ? "Save Changes"
            : createStep === 0
              ? "Next"
              : "Create Student"
        }
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={submitForm}
        steps={showStepper ? CREATE_STEPS : undefined}
        currentStep={createStep}
        onStepChange={(index) => {
          if (index < createStep) {
            setFormError(null);
            setCreateStep(index);
          }
        }}
        showBack={showStepper && createStep > 0}
        onBack={() => {
          setFormError(null);
          setCreateStep((step) => Math.max(0, step - 1));
        }}
        contentClassName="sm:max-w-2xl"
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
        ) : editing ? (
          <div className="space-y-8">
            <div>
              <h3 className="mb-3 text-sm font-bold">Student details</h3>
              {renderStudentFields()}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold">Family details</h3>
              {renderFamilyFields()}
            </div>
          </div>
        ) : createStep === 0 ? (
          renderStudentFields()
        ) : (
          renderFamilyFields()
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
