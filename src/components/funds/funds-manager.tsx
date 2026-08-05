"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { api } from "@/lib/api";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { TablePagination } from "@/components/data/table-pagination";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Fund = {
  id: number;
  name: string;
  amount: string;
  tenure: string;
  class_levels: number[];
  class_level_names?: string[];
  starts_on: string | null;
  due_on: string | null;
  status: string;
  notes: string;
  invoice_summary?: {
    invoices_total: number;
    unpaid: number;
    partial: number;
    paid: number;
  };
};

type FundPayload = {
  name: string;
  amount: number;
  tenure: string;
  class_levels: number[];
  starts_on: string;
  due_on: string;
  notes: string;
};

type ClassLevel = {
  id: number;
  name: string;
  order: number;
};

const fundHooks = createCrudHooks<Fund, FundPayload>("/funds/");
const classHooks = createCrudHooks<ClassLevel, Record<string, unknown>>("/class-levels/");

const emptyPayload: FundPayload = {
  name: "",
  amount: 0,
  tenure: "annually",
  class_levels: [],
  starts_on: "",
  due_on: "",
  notes: "",
};

function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return `₨ ${n.toLocaleString()}`;
}

function statusTone(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-800";
  if (status === "closed") return "bg-slate-100 text-slate-700";
  return "bg-amber-100 text-amber-800";
}

export function FundsManager({ feesHref }: { feesHref: string }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Fund | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [payload, setPayload] = useState<FundPayload>(emptyPayload);
  const [formError, setFormError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const listQuery = fundHooks.useList({
    page,
    search,
    ...(statusFilter ? { status: statusFilter } : {}),
  });
  const classQuery = classHooks.useList({ page: 1, page_size: 200 });
  const createMutation = fundHooks.useCreate({ successMessage: "Fund created." });
  const updateMutation = fundHooks.useUpdate({ successMessage: "Fund updated." });

  const activateMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/funds/${id}/activate/`);
      return data;
    },
    onSuccess: async () => {
      toast.success("Fund activated and invoices synced.");
      await queryClient.invalidateQueries({ queryKey: ["/funds/"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Could not activate fund."));
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/funds/${id}/sync-charges/`);
      return data;
    },
    onSuccess: async (data) => {
      const created = data?.sync?.created ?? 0;
      toast.success(created ? `Synced — ${created} new invoice(s).` : "Already up to date.");
      await queryClient.invalidateQueries({ queryKey: ["/funds/"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Could not sync charges."));
    },
  });

  const funds = listQuery.data?.results ?? [];
  const classes = useMemo(
    () => [...(classQuery.data?.results ?? [])].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [classQuery.data?.results]
  );

  function openCreate() {
    setEditing(null);
    setPayload(emptyPayload);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(fund: Fund) {
    setEditing(fund);
    setPayload({
      name: fund.name,
      amount: Number(fund.amount) || 0,
      tenure: fund.tenure || "annually",
      class_levels: fund.class_levels ?? [],
      starts_on: fund.starts_on ?? "",
      due_on: fund.due_on ?? "",
      notes: fund.notes ?? "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function toggleClass(id: number) {
    setPayload((p) => ({
      ...p,
      class_levels: p.class_levels.includes(id)
        ? p.class_levels.filter((x) => x !== id)
        : [...p.class_levels, id],
    }));
  }

  async function submit() {
    if (!payload.name.trim()) {
      setFormError("Enter a fund name.");
      return;
    }
    if (!payload.amount || payload.amount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }
    if (!payload.class_levels.length) {
      setFormError("Assign at least one class.");
      return;
    }

    setFormError(null);
    const body = {
      ...payload,
      starts_on: payload.starts_on || null,
      due_on: payload.due_on || null,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: body as FundPayload });
      } else {
        await createMutation.mutateAsync(body as FundPayload);
      }
      setModalOpen(false);
      setPayload(emptyPayload);
      setEditing(null);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not save fund."));
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Define school funds and assign classes. Activating a fund creates fund invoices for active students.
        Collect payments in{" "}
        <Link href={feesHref} className="font-medium text-foreground underline-offset-4 hover:underline">
          Fees
        </Link>
        .
      </p>

      <DataTableShell
        title="Funds"
        count={listQuery.data?.count ?? 0}
        searchValue={search}
        searchPlaceholder="Search funds"
        onSearchChange={setSearch}
        onCreate={openCreate}
        createLabel="Create Fund"
        toolbarExtra={
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 w-[140px]"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </Select>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Tenure</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funds.map((fund) => {
              const summary = fund.invoice_summary;
              const expanded = expandedId === fund.id;
              return (
                <Fragment key={fund.id}>
                  <TableRow className="cursor-pointer" onClick={() => setExpandedId(expanded ? null : fund.id)}>
                    <TableCell className="font-medium">{fund.name}</TableCell>
                    <TableCell>{formatMoney(fund.amount)}</TableCell>
                    <TableCell className="capitalize">{fund.tenure}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {(fund.class_level_names ?? []).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize", statusTone(fund.status))}>
                        {fund.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {summary
                        ? `${summary.unpaid} unpaid · ${summary.partial} partial · ${summary.paid} paid`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-lg")}
                          onClick={() => openEdit(fund)}
                        >
                          Edit
                        </button>
                        {fund.status === "draft" ? (
                          <button
                            type="button"
                            className={cn(buttonVariants({ size: "sm" }), "h-8 rounded-lg")}
                            disabled={activateMutation.isPending}
                            onClick={() => activateMutation.mutate(fund.id)}
                          >
                            Activate
                          </button>
                        ) : fund.status === "active" ? (
                          <button
                            type="button"
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-lg")}
                            disabled={syncMutation.isPending}
                            onClick={() => syncMutation.mutate(fund.id)}
                          >
                            Sync
                          </button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded ? (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                          <div>
                            <p>
                              Due {fund.due_on || "—"} · {summary?.invoices_total ?? 0} invoice(s)
                            </p>
                            {fund.notes ? <p className="mt-1 text-muted-foreground">{fund.notes}</p> : null}
                          </div>
                          <Link
                            href={feesHref}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-lg")}
                          >
                            Collect in Fees
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
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
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Fund" : "Create Fund"}
        description="Funds are separate from monthly tuition. Assign classes; all sections inherit."
        submitLabel={editing ? "Save" : "Create"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={submit}
      >
        <FormField label="Name" required>
          <Input
            value={payload.name}
            placeholder="e.g. Annual Fund"
            onChange={(e) => setPayload((p) => ({ ...p, name: e.target.value }))}
          />
        </FormField>
        <FormField label="Amount (PKR)" required>
          <Input
            type="number"
            min={0}
            value={payload.amount || ""}
            placeholder="e.g. 2500"
            onChange={(e) => setPayload((p) => ({ ...p, amount: Number(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label="Tenure" hint="Labeling and due window only — not an installment schedule.">
          <Select
            value={payload.tenure}
            onChange={(e) => setPayload((p) => ({ ...p, tenure: e.target.value }))}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </Select>
        </FormField>
        <FormField label="Classes" required hint="Active students in any section of these classes are charged.">
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border/80 p-3">
            {classes.map((level) => (
              <label key={level.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={payload.class_levels.includes(level.id)}
                  onChange={() => toggleClass(level.id)}
                />
                {level.name}
              </label>
            ))}
            {!classes.length ? <p className="text-sm text-muted-foreground">No classes yet.</p> : null}
          </div>
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Starts on">
            <Input
              type="date"
              value={payload.starts_on}
              onChange={(e) => setPayload((p) => ({ ...p, starts_on: e.target.value }))}
            />
          </FormField>
          <FormField label="Due on">
            <Input
              type="date"
              value={payload.due_on}
              onChange={(e) => setPayload((p) => ({ ...p, due_on: e.target.value }))}
            />
          </FormField>
        </div>
        <FormField label="Notes">
          <Input
            value={payload.notes}
            placeholder="Optional"
            onChange={(e) => setPayload((p) => ({ ...p, notes: e.target.value }))}
          />
        </FormField>
      </FormModal>
    </div>
  );
}
