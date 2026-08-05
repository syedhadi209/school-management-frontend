"use client";

import { createCrudHooks } from "@/lib/crud";
import { DataTableShell } from "@/components/data/data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/data/table-pagination";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Invoice = {
  id: number;
  student_name?: string;
  invoice_type: string;
  fund_name?: string;
  fee_structure_name?: string;
  total_amount: string;
  paid_amount: string;
  balance?: number;
  status: string;
  due_date: string | null;
};

const invoiceHooks = createCrudHooks<Invoice, Record<string, unknown>>("/invoices/");

function typeBadge(type: string) {
  const isFund = type === "fund";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        isFund ? "bg-sky-100 text-sky-800" : "bg-violet-100 text-violet-800"
      )}
    >
      {isFund ? "Fund" : "Monthly fee"}
    </span>
  );
}

export default function ParentInvoicesPage() {
  const [page, setPage] = useState(1);
  const query = invoiceHooks.useList({ page });
  const invoices = query.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Child Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monthly tuition and school fund balances for your linked children.
        </p>
      </div>

      <DataTableShell
        title="Invoices"
        count={query.data?.count ?? 0}
        searchValue=""
        searchPlaceholder="Search"
        onSearchChange={() => undefined}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.student_name || "—"}</TableCell>
                <TableCell>{typeBadge(invoice.invoice_type)}</TableCell>
                <TableCell>
                  {invoice.invoice_type === "fund"
                    ? invoice.fund_name || "Fund"
                    : invoice.fee_structure_name || "Monthly fee"}
                </TableCell>
                <TableCell>₨ {invoice.total_amount}</TableCell>
                <TableCell>₨ {invoice.paid_amount}</TableCell>
                <TableCell>₨ {invoice.balance ?? 0}</TableCell>
                <TableCell className="capitalize">{invoice.status}</TableCell>
                <TableCell>{invoice.due_date || "—"}</TableCell>
              </TableRow>
            ))}
            {!invoices.length && !query.isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No invoices yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          total={query.data?.count ?? 0}
          hasNext={Boolean(query.data?.next)}
          hasPrevious={Boolean(query.data?.previous)}
          onPageChange={setPage}
        />
      </DataTableShell>
    </div>
  );
}
