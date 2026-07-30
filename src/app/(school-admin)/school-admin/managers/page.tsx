"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/data/confirm-dialog";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { ProfileAvatar, ProfileImagePicker } from "@/components/data/profile-image-picker";
import { SelectMenu } from "@/components/data/select-menu";
import { TablePagination } from "@/components/data/table-pagination";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { cn } from "@/lib/utils";

type ManagerAccount = {
  id: number;
  user: number;
  role: "manager";
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  joined_at: string;
  profile_image?: string | null;
};

type ManagerPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_active: boolean;
  profile_image: string | null;
  profile_image_file: File | null;
  profile_image_clear: boolean;
};

const managerHooks = createCrudHooks<ManagerAccount, ManagerPayload>("/accounts/managers/");

const accountStatusOptions = [
  { value: "active", label: "Active — can sign in" },
  { value: "inactive", label: "Inactive — access suspended" },
];

const emptyPayload: ManagerPayload = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  is_active: true,
  profile_image: null,
  profile_image_file: null,
  profile_image_clear: false,
};

function formatJoinedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
}

export default function SchoolAdminManagersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ManagerAccount | null>(null);
  const [payload, setPayload] = useState<ManagerPayload>(emptyPayload);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagerAccount | null>(null);

  const listQuery = managerHooks.useList({ page, search });
  const createMutation = managerHooks.useCreate({ successMessage: "Manager account created." });
  const updateMutation = managerHooks.useUpdate({ successMessage: "Manager account updated." });
  const deleteMutation = managerHooks.useDelete({ successMessage: "Manager account deleted." });
  const managers = listQuery.data?.results ?? [];

  function openCreate() {
    setEditing(null);
    setPayload(emptyPayload);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(manager: ManagerAccount) {
    setEditing(manager);
    setPayload({
      first_name: manager.first_name,
      last_name: manager.last_name,
      email: manager.email,
      password: "",
      is_active: manager.is_active,
      profile_image: manager.profile_image ?? null,
      profile_image_file: null,
      profile_image_clear: false,
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    if (!payload.first_name.trim()) {
      setFormError("Enter the manager's first name.");
      return;
    }
    if (!editing && !payload.email.trim()) {
      setFormError("Enter the manager's email. They will use this to sign in.");
      return;
    }
    if (!editing && payload.password.length < 8) {
      setFormError("Choose a temporary password with at least 8 characters.");
      return;
    }
    if (editing && payload.password && payload.password.length < 8) {
      setFormError("A new password must contain at least 8 characters.");
      return;
    }

    setFormError(null);
    try {
      if (editing) {
        const shared: Record<string, unknown> = {
          first_name: payload.first_name.trim(),
          last_name: payload.last_name.trim(),
          is_active: payload.is_active,
          profile_image_clear: payload.profile_image_clear,
          ...(payload.password ? { password: payload.password } : {}),
        };
        if (payload.profile_image_file) {
          shared.profile_image = payload.profile_image_file;
        } else if (payload.profile_image_clear) {
          shared.profile_image = "";
        }
        await updateMutation.mutateAsync({
          id: editing.id,
          payload: shared as Partial<ManagerPayload>,
        });
      } else {
        const body: Record<string, unknown> = {
          ...payload,
          first_name: payload.first_name.trim(),
          last_name: payload.last_name.trim(),
          email: payload.email.trim().toLowerCase(),
          profile_image_clear: payload.profile_image_clear,
        };
        delete body.profile_image_file;
        if (payload.profile_image_file) {
          body.profile_image = payload.profile_image_file;
        } else if (payload.profile_image_clear) {
          body.profile_image = "";
        }
        await createMutation.mutateAsync(body as ManagerPayload);
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError(
        extractApiErrorMessage(error, "Could not save this manager account. Please try again.")
      );
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
        Managers can access school operations such as students, classes, admissions, timetables,
        and promotions. Only school admins can create or manage these accounts.
      </p>

      <DataTableShell
        title="Managers"
        count={listQuery.data?.count ?? 0}
        searchValue={search}
        searchPlaceholder="Search managers by name or email"
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCreate={openCreate}
        createLabel="Add Manager"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Login email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell>
                  <ProfileAvatar
                    size="sm"
                    name={manager.full_name || manager.email}
                    imageUrl={manager.profile_image}
                  />
                </TableCell>
                <TableCell className="font-medium">{manager.full_name || "Unnamed manager"}</TableCell>
                <TableCell>{manager.email}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      manager.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {manager.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>{formatJoinedDate(manager.joined_at)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => openEdit(manager)}
                      aria-label={`Edit ${manager.full_name || manager.email}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => setDeleteTarget(manager)}
                      aria-label={`Delete ${manager.full_name || manager.email}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {managers.length === 0 && !listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No managers yet. Add a manager to give them access to the manager portal.
                </TableCell>
              </TableRow>
            ) : null}
            {listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading managers...
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
        title={editing ? "Edit Manager" : "Add Manager"}
        description={
          editing
            ? "Update this manager's identity, photo, access status, or password."
            : "Create a login account with access to the manager portal."
        }
        submitLabel={editing ? "Save Changes" : "Add Manager"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-xl"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Profile image"
            hint="Optional photo shown in manager lists."
            className="sm:col-span-2"
          >
            <ProfileImagePicker
              name={`${payload.first_name} ${payload.last_name}`.trim() || "Manager"}
              imageUrl={payload.profile_image}
              imageFile={payload.profile_image_file}
              clearRequested={payload.profile_image_clear}
              onFileChange={(file) =>
                setPayload((current) => ({
                  ...current,
                  profile_image_file: file,
                }))
              }
              onClearChange={(value) =>
                setPayload((current) => ({
                  ...current,
                  profile_image_clear: value,
                  profile_image_file: value ? null : current.profile_image_file,
                }))
              }
              onError={(message) => setFormError(message)}
            />
          </FormField>

          <FormField label="First name" required>
            <Input
              placeholder="e.g. Ayesha"
              value={payload.first_name}
              onChange={(event) =>
                setPayload((current) => ({ ...current, first_name: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Last name">
            <Input
              placeholder="e.g. Khan"
              value={payload.last_name}
              onChange={(event) =>
                setPayload((current) => ({ ...current, last_name: event.target.value }))
              }
            />
          </FormField>

          {editing ? (
            <FormField
              label="Login email"
              hint="The login email cannot be changed here."
              className="sm:col-span-2"
            >
              <Input value={payload.email} disabled />
            </FormField>
          ) : (
            <FormField
              label="Login email"
              hint="The manager will use this email to sign in."
              className="sm:col-span-2"
              required
            >
              <Input
                type="email"
                placeholder="e.g. manager@school.com"
                value={payload.email}
                onChange={(event) =>
                  setPayload((current) => ({ ...current, email: event.target.value }))
                }
              />
            </FormField>
          )}

          <FormField
            label={editing ? "New password" : "Temporary password"}
            hint={
              editing
                ? "Optional. Leave blank to keep the current password."
                : "At least 8 characters. Share it securely with the manager."
            }
            className="sm:col-span-2"
            required={!editing}
          >
            <Input
              type="password"
              placeholder={editing ? "Leave blank to keep current password" : "At least 8 characters"}
              value={payload.password}
              onChange={(event) =>
                setPayload((current) => ({ ...current, password: event.target.value }))
              }
            />
          </FormField>

          <FormField
            label="Account status"
            hint="Inactive managers cannot sign in."
            className="sm:col-span-2"
          >
            <SelectMenu
              value={payload.is_active ? "active" : "inactive"}
              onValueChange={(value) =>
                setPayload((current) => ({ ...current, is_active: value === "active" }))
              }
              options={accountStatusOptions}
              menuLabel="Select account status"
            />
          </FormField>
        </div>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete manager account?"
        description={`${
          deleteTarget?.full_name || deleteTarget?.email || "This manager"
        } will immediately lose access to the manager portal.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
