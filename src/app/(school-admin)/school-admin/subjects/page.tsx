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

type Subject = { id: number; name: string };
type SubjectPayload = { name: string };

const subjectHooks = createCrudHooks<Subject, SubjectPayload>("/subjects/");

export default function SchoolAdminSubjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Subject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const listQuery = subjectHooks.useList({ page, search });
  const createMutation = subjectHooks.useCreate({ successMessage: "Subject created." });
  const updateMutation = subjectHooks.useUpdate({ successMessage: "Subject updated." });
  const deleteMutation = subjectHooks.useDelete({ successMessage: "Subject deleted." });

  const subjects = listQuery.data?.results ?? [];

  function openCreate() {
    setEditing(null);
    setName("");
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(subject: Subject) {
    setEditing(subject);
    setName(subject.name);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setFormError("Enter a subject name, for example Mathematics.");
      return;
    }

    setFormError(null);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: { name } });
      } else {
        await createMutation.mutateAsync({ name });
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not save this subject. Please try again."));
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
        title="Subjects"
        count={listQuery.data?.count ?? 0}
        searchValue={search}
        searchPlaceholder="Search subjects"
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCreate={openCreate}
        createLabel="Add Subject"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => openEdit(subject)}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => setDeleteTarget(subject)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
        title={editing ? "Edit Subject" : "Create Subject"}
        description="Add the subject exactly as it should appear in class schedules and reports."
        submitLabel={editing ? "Save Changes" : "Create Subject"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleSubmit}
      >
        <FormField label="Subject name" hint="Use a clear name such as Mathematics, English, or Computer Science." required>
          <Input value={name} placeholder="e.g. Mathematics" onChange={(e) => setName(e.target.value)} />
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete subject?"
        description="This will remove the subject from active listings."
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
