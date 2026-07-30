"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
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

type ClassLevel = {
  id: number;
  name: string;
  order: number;
  is_board_class?: boolean;
  academic_year_name?: string;
  section_count?: number;
};

type ClassLevelPayload = {
  name: string;
  order: number;
  is_board_class: boolean;
};

const levelHooks = createCrudHooks<ClassLevel, ClassLevelPayload>("/class-levels/");

const emptyPayload: ClassLevelPayload = { name: "", order: 1, is_board_class: false };

export function ClassesManager({ sectionsHref }: { sectionsHref?: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [boardOnly, setBoardOnly] = useState(false);
  const [editing, setEditing] = useState<ClassLevel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payload, setPayload] = useState<ClassLevelPayload>(emptyPayload);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassLevel | null>(null);

  const listQuery = levelHooks.useList({
    page,
    search,
    ...(boardOnly ? { is_board_class: true } : {}),
  });
  const createMutation = levelHooks.useCreate({ successMessage: "Class created." });
  const updateMutation = levelHooks.useUpdate({ successMessage: "Class updated." });
  const deleteMutation = levelHooks.useDelete({ successMessage: "Class deleted." });

  const levels = listQuery.data?.results ?? [];
  const total = listQuery.data?.count ?? 0;

  function openCreate() {
    setEditing(null);
    setPayload({ ...emptyPayload, order: total + 1 });
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(level: ClassLevel) {
    setEditing(level);
    setPayload({
      name: level.name,
      order: level.order,
      is_board_class: Boolean(level.is_board_class),
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    if (!payload.name.trim()) {
      setFormError("Enter a class name, for example Class 1 or Nursery.");
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
      setFormError(extractApiErrorMessage(error, "Could not save this class. Please try again."));
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
        A class is the academic year group, such as Class 1 or Class 10. Mark Classes 8, 9, and 10 as board examination
        classes when your school sits board exams.
        {sectionsHref ? (
          <>
            {" "}
            Then add sections like A and B under{" "}
            <Link href={sectionsHref} className="font-medium text-primary underline">
              Sections
            </Link>
            .
          </>
        ) : (
          " Then add sections like A and B for each class."
        )}
      </p>

      <DataTableShell
        title="Classes"
        count={total}
        searchValue={search}
        searchPlaceholder="Search classes by name"
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCreate={openCreate}
        createLabel="Create Class"
        toolbarExtra={
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: boardOnly ? "default" : "outline", size: "default" }),
              "h-9 rounded-xl px-3 text-sm font-medium"
            )}
            onClick={() => {
              setBoardOnly((value) => !value);
              setPage(1);
            }}
          >
            {boardOnly ? "Showing board classes" : "Board classes only"}
          </button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Display Order</TableHead>
              <TableHead>Sections</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.map((level) => (
              <TableRow key={level.id}>
                <TableCell className="font-medium">{level.name}</TableCell>
                <TableCell>
                  {level.is_board_class ? (
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      Board
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Regular</span>
                  )}
                </TableCell>
                <TableCell>{level.order}</TableCell>
                <TableCell>{level.section_count ?? 0}</TableCell>
                <TableCell>{level.academic_year_name || "-"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => openEdit(level)}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => setDeleteTarget(level)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {levels.length === 0 && !listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No classes yet. Create Class 1 first, then add sections A and B for it.
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
        title={editing ? "Edit Class" : "Create Class"}
        description="Name the class, set its order, and decide whether it sits board examinations."
        submitLabel={editing ? "Save Changes" : "Create Class"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Class name"
            hint="How teachers and parents will see it, such as Class 1, Nursery, or Class 10."
            required
          >
            <Input
              value={payload.name}
              placeholder="e.g. Class 1"
              onChange={(e) => setPayload((p) => ({ ...p, name: e.target.value }))}
            />
          </FormField>
          <FormField
            label="Display order"
            hint="Lowest number appears first. Use 1 for the earliest class in your school."
            required
          >
            <Input
              type="number"
              min={1}
              value={payload.order}
              placeholder="e.g. 1"
              onChange={(e) => setPayload((p) => ({ ...p, order: Number(e.target.value) || 0 }))}
            />
          </FormField>
          <FormField
            label="Board examination class"
            hint="Turn this on for Classes 8, 9, and 10 (or any class that sits board exams). Students in board classes can then receive a board roll number."
            required
            className="sm:col-span-2"
          >
            <Select
              value={payload.is_board_class ? "yes" : "no"}
              onChange={(e) => setPayload((p) => ({ ...p, is_board_class: e.target.value === "yes" }))}
            >
              <option value="no">Regular class</option>
              <option value="yes">Board examination class</option>
            </Select>
          </FormField>
        </div>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete class?"
        description="Sections, students, and fee structures linked to this class may be affected."
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
