"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/data/confirm-dialog";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { SelectMenu } from "@/components/data/select-menu";
import {
  DAY_OPTIONS,
  TimetableEntry,
  TimetableWeekGrid,
  formatClock,
} from "@/components/timetable/week-grid";

type Section = {
  id: number;
  name: string;
  class_level: number;
  class_level_name?: string;
  teachers?: number[];
  teacher_names?: string[];
};

type Subject = { id: number; name: string };
type ClassLevel = { id: number; name: string };

type SlotPayload = {
  section: number | null;
  slot_type: "lecture" | "break";
  subject: number | null;
  teacher: number | null;
  label: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type BulkBreakPayload = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string;
  section_ids: number[];
  class_level_ids: number[];
};

const entryHooks = createCrudHooks<TimetableEntry, SlotPayload>("/timetable-entries/");
const sectionHooks = createCrudHooks<Section, Record<string, unknown>>("/sections/");
const subjectHooks = createCrudHooks<Subject, Record<string, unknown>>("/subjects/");
const classLevelHooks = createCrudHooks<ClassLevel, Record<string, unknown>>("/class-levels/");

const emptyPayload: SlotPayload = {
  section: null,
  slot_type: "lecture",
  subject: null,
  teacher: null,
  label: "",
  day_of_week: 0,
  start_time: "07:00",
  end_time: "08:00",
};

const emptyBulk: BulkBreakPayload = {
  day_of_week: 0,
  start_time: "09:10",
  end_time: "09:30",
  label: "Recess",
  section_ids: [],
  class_level_ids: [],
};

function normalizeTime(value: string) {
  if (!value) return value;
  return value.length === 5 ? `${value}:00` : value;
}

export function TimetableManager() {
  const queryClient = useQueryClient();
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [editing, setEditing] = useState<TimetableEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [payload, setPayload] = useState<SlotPayload>(emptyPayload);
  const [bulkPayload, setBulkPayload] = useState<BulkBreakPayload>(emptyBulk);
  const [formError, setFormError] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimetableEntry | null>(null);

  const sectionsQuery = sectionHooks.useList({ page: 1, page_size: 200 });
  const subjectsQuery = subjectHooks.useList({ page: 1, page_size: 200 });
  const levelsQuery = classLevelHooks.useList({ page: 1, page_size: 200 });
  const entriesQuery = entryHooks.useList(
    {
      page: 1,
      page_size: 200,
      section: selectedSectionId || undefined,
      is_active: true,
    },
    { enabled: Boolean(selectedSectionId) }
  );

  const createMutation = entryHooks.useCreate({ successMessage: "Timetable slot created." });
  const updateMutation = entryHooks.useUpdate({ successMessage: "Timetable slot updated." });
  const deleteMutation = entryHooks.useDelete({ successMessage: "Timetable slot deleted." });

  const bulkMutation = useMutation({
    mutationFn: async (body: BulkBreakPayload) => {
      const { data } = await api.post<{
        created_count: number;
        conflict_count: number;
        conflicts: Array<{ section_label: string; error: string }>;
      }>("/timetable-entries/bulk-break/", {
        day_of_week: body.day_of_week,
        start_time: normalizeTime(body.start_time),
        end_time: normalizeTime(body.end_time),
        label: body.label,
        section_ids: body.section_ids,
        class_level_ids: body.class_level_ids,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/timetable-entries/"] });
      const conflictNote =
        data.conflict_count > 0
          ? ` ${data.conflict_count} conflict${data.conflict_count === 1 ? "" : "s"} skipped.`
          : "";
      toast.success(`Break added to ${data.created_count} section${data.created_count === 1 ? "" : "s"}.${conflictNote}`);
      setBulkResult(
        data.conflicts.length
          ? data.conflicts.map((item) => `${item.section_label}: ${item.error}`).join("\n")
          : null
      );
      if (data.created_count > 0 && data.conflict_count === 0) {
        setIsBulkOpen(false);
        setBulkPayload(emptyBulk);
      }
    },
    onError: (error) => {
      setBulkError(extractApiErrorMessage(error, "Failed to add break."));
    },
  });

  const sections = sectionsQuery.data?.results ?? [];
  const subjects = subjectsQuery.data?.results ?? [];
  const levels = levelsQuery.data?.results ?? [];
  const entries = entriesQuery.data?.results ?? [];

  const selectedSection = sections.find((section) => String(section.id) === selectedSectionId) ?? null;

  const sectionOptions = useMemo(
    () =>
      sections.map((section) => ({
        value: String(section.id),
        label: `${section.class_level_name || "Class"}-${section.name}`,
      })),
    [sections]
  );

  const rosterTeachers = useMemo(() => {
    if (!selectedSection) return [] as Array<{ id: number; label: string }>;
    const ids = selectedSection.teachers ?? [];
    const names = selectedSection.teacher_names ?? [];
    return ids.map((id, index) => ({
      id,
      label: names[index] || `Teacher ${id}`,
    }));
  }, [selectedSection]);

  function openCreate(slotType: "lecture" | "break" = "lecture") {
    if (!selectedSectionId) {
      toast.error("Select a section first.");
      return;
    }
    setEditing(null);
    setPayload({
      ...emptyPayload,
      section: Number(selectedSectionId),
      slot_type: slotType,
      label: slotType === "break" ? "Recess" : "",
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(entry: TimetableEntry) {
    setEditing(entry);
    setPayload({
      section: entry.section,
      slot_type: entry.slot_type,
      subject: entry.subject,
      teacher: entry.teacher,
      label: entry.label || "",
      day_of_week: entry.day_of_week,
      start_time: formatClock(entry.start_time),
      end_time: formatClock(entry.end_time),
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    setFormError(null);
    if (!payload.section) {
      setFormError("Section is required.");
      return;
    }
    if (!payload.start_time || !payload.end_time) {
      setFormError("Start and end times are required.");
      return;
    }
    if (payload.slot_type === "lecture" && (!payload.subject || !payload.teacher)) {
      setFormError("Subject and teacher are required for lectures.");
      return;
    }
    if (payload.slot_type === "break" && !payload.label.trim()) {
      setFormError("Break label is required.");
      return;
    }

    const body: SlotPayload = {
      ...payload,
      start_time: normalizeTime(payload.start_time),
      end_time: normalizeTime(payload.end_time),
      subject: payload.slot_type === "lecture" ? payload.subject : null,
      teacher: payload.slot_type === "lecture" ? payload.teacher : null,
      label: payload.slot_type === "break" ? payload.label.trim() : "",
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: body });
      } else {
        await createMutation.mutateAsync(body);
      }
      setIsModalOpen(false);
      setEditing(null);
      setPayload(emptyPayload);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not save timetable slot."));
    }
  }

  async function handleBulkSubmit() {
    setBulkError(null);
    setBulkResult(null);
    if (!bulkPayload.label.trim()) {
      setBulkError("Break label is required.");
      return;
    }
    if (!bulkPayload.section_ids.length && !bulkPayload.class_level_ids.length) {
      setBulkError("Select at least one section or class.");
      return;
    }
    try {
      await bulkMutation.mutateAsync({
        ...bulkPayload,
        label: bulkPayload.label.trim(),
      });
    } catch {
      // error already handled in mutation
    }
  }

  function toggleBulkSection(id: number) {
    setBulkPayload((current) => {
      const exists = current.section_ids.includes(id);
      return {
        ...current,
        section_ids: exists
          ? current.section_ids.filter((value) => value !== id)
          : [...current.section_ids, id],
      };
    });
  }

  function toggleBulkClass(id: number) {
    setBulkPayload((current) => {
      const exists = current.class_level_ids.includes(id);
      return {
        ...current,
        class_level_ids: exists
          ? current.class_level_ids.filter((value) => value !== id)
          : [...current.class_level_ids, id],
      };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm space-y-2">
          <label className="text-sm font-medium">Section</label>
          <SelectMenu
            value={selectedSectionId}
            onValueChange={setSelectedSectionId}
            options={sectionOptions}
            placeholder="Select class & section"
            menuLabel="Sections"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }))}
            onClick={() => {
              setBulkPayload(emptyBulk);
              setBulkError(null);
              setBulkResult(null);
              setIsBulkOpen(true);
            }}
          >
            Add break to many
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }))}
            onClick={() => openCreate("break")}
            disabled={!selectedSectionId}
          >
            Add break
          </button>
          <button
            type="button"
            className={cn(buttonVariants())}
            onClick={() => openCreate("lecture")}
            disabled={!selectedSectionId}
          >
            <Plus className="size-4" />
            Add lecture
          </button>
        </div>
      </div>

      {!selectedSectionId ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
          Choose a section to view and edit its weekly timetable.
        </div>
      ) : entriesQuery.isLoading ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Loading timetable…
        </div>
      ) : (
        <TimetableWeekGrid
          entries={entries}
          editable
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          emptyMessage={`No slots for ${selectedSection?.class_level_name}-${selectedSection?.name} yet. Add a lecture or break to get started.`}
        />
      )}

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editing ? "Edit timetable slot" : payload.slot_type === "break" ? "Add break" : "Add lecture"}
        description="Weekly recurring slot for the selected section."
        submitLabel={editing ? "Save changes" : "Create slot"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Type">
            <SelectMenu
              value={payload.slot_type}
              onValueChange={(value) =>
                setPayload((current) => ({
                  ...current,
                  slot_type: value as "lecture" | "break",
                  subject: value === "break" ? null : current.subject,
                  teacher: value === "break" ? null : current.teacher,
                  label: value === "break" ? current.label || "Recess" : "",
                }))
              }
              options={[
                { value: "lecture", label: "Lecture" },
                { value: "break", label: "Break" },
              ]}
              menuLabel="Slot type"
            />
          </FormField>
          <FormField label="Day">
            <SelectMenu
              value={String(payload.day_of_week)}
              onValueChange={(value) =>
                setPayload((current) => ({ ...current, day_of_week: Number(value) }))
              }
              options={DAY_OPTIONS.map((day) => ({ value: String(day.value), label: day.label }))}
              menuLabel="Day of week"
            />
          </FormField>
          <FormField label="Start time">
            <Input
              type="time"
              value={payload.start_time}
              onChange={(event) => setPayload((current) => ({ ...current, start_time: event.target.value }))}
            />
          </FormField>
          <FormField label="End time">
            <Input
              type="time"
              value={payload.end_time}
              onChange={(event) => setPayload((current) => ({ ...current, end_time: event.target.value }))}
            />
          </FormField>
          {payload.slot_type === "break" ? (
            <FormField label="Break label" className="sm:col-span-2">
              <Input
                value={payload.label}
                placeholder="Recess, Lunch, Assembly…"
                onChange={(event) => setPayload((current) => ({ ...current, label: event.target.value }))}
              />
            </FormField>
          ) : (
            <>
              <FormField label="Subject">
                <SelectMenu
                  value={payload.subject ? String(payload.subject) : ""}
                  onValueChange={(value) =>
                    setPayload((current) => ({ ...current, subject: value ? Number(value) : null }))
                  }
                  options={subjects.map((subject) => ({
                    value: String(subject.id),
                    label: subject.name,
                  }))}
                  placeholder="Select subject"
                  menuLabel="Subjects"
                />
              </FormField>
              <FormField label="Teacher">
                <SelectMenu
                  value={payload.teacher ? String(payload.teacher) : ""}
                  onValueChange={(value) =>
                    setPayload((current) => ({ ...current, teacher: value ? Number(value) : null }))
                  }
                  options={rosterTeachers.map((teacher) => ({
                    value: String(teacher.id),
                    label: teacher.label,
                  }))}
                  placeholder={rosterTeachers.length ? "Select teacher" : "Assign teachers on Sections first"}
                  menuLabel="Section teachers"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  A teacher can only teach one class at a time. If they already have a slot in this window,
                  edit or clear that assignment first.
                </p>
              </FormField>
            </>
          )}
        </div>
      </FormModal>

      <FormModal
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        title="Add break to many sections"
        description="Creates the same break across selected sections or whole classes. Conflicts are reported per section."
        submitLabel="Create breaks"
        loading={bulkMutation.isPending}
        error={bulkError}
        onSubmit={handleBulkSubmit}
        contentClassName="sm:max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Day">
            <SelectMenu
              value={String(bulkPayload.day_of_week)}
              onValueChange={(value) =>
                setBulkPayload((current) => ({ ...current, day_of_week: Number(value) }))
              }
              options={DAY_OPTIONS.map((day) => ({ value: String(day.value), label: day.label }))}
              menuLabel="Day of week"
            />
          </FormField>
          <FormField label="Label">
            <Input
              value={bulkPayload.label}
              onChange={(event) => setBulkPayload((current) => ({ ...current, label: event.target.value }))}
            />
          </FormField>
          <FormField label="Start time">
            <Input
              type="time"
              value={bulkPayload.start_time}
              onChange={(event) =>
                setBulkPayload((current) => ({ ...current, start_time: event.target.value }))
              }
            />
          </FormField>
          <FormField label="End time">
            <Input
              type="time"
              value={bulkPayload.end_time}
              onChange={(event) => setBulkPayload((current) => ({ ...current, end_time: event.target.value }))}
            />
          </FormField>
        </div>

        <FormField label="Apply to classes">
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => {
              const active = bulkPayload.class_level_ids.includes(level.id);
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => toggleBulkClass(level.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  )}
                >
                  {level.name}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Or pick specific sections">
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
            {sections.map((section) => {
              const active = bulkPayload.section_ids.includes(section.id);
              return (
                <label
                  key={section.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleBulkSection(section.id)}
                  />
                  {section.class_level_name}-{section.name}
                </label>
              );
            })}
          </div>
        </FormField>

        {bulkResult ? (
          <div className="whitespace-pre-wrap rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            {bulkResult}
          </div>
        ) : null}
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete timetable slot?"
        description={
          deleteTarget
            ? `Remove ${
                deleteTarget.slot_type === "break"
                  ? deleteTarget.label || "this break"
                  : deleteTarget.subject_name || "this lecture"
              } on ${deleteTarget.day_label || "the selected day"} (${formatClock(deleteTarget.start_time)}–${formatClock(deleteTarget.end_time)})?`
            : "Remove this timetable slot?"
        }
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMutation.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
