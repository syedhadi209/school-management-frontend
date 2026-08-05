"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { TablePagination } from "@/components/data/table-pagination";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeeStructure = {
  id: number;
  name: string;
  amount: string;
  class_level: number;
  class_level_name?: string;
};

type Invoice = {
  id: number;
  student: number;
  student_name?: string;
  fee_structure: number | null;
  fee_structure_name?: string;
  total_amount: string;
  paid_amount: string;
  balance?: number;
  status: string;
  due_date: string | null;
};
type InvoicePayload = {
  student: number | null;
  fee_structure: number | null;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
};

type PaymentPayload = { invoice: number | null; amount: number; method: string };
type Student = {
  id: number;
  full_name?: string;
  first_name: string;
  last_name: string;
  monthly_fee_effective?: string | number | null;
};

const feeHooks = createCrudHooks<FeeStructure, Record<string, unknown>>("/fee-structures/");
const invoiceHooks = createCrudHooks<Invoice, InvoicePayload>("/invoices/");
const paymentHooks = createCrudHooks<{ id: number }, PaymentPayload>("/payments/");
const studentHooks = createCrudHooks<Student, Record<string, unknown>>("/students/");

const emptyInvoice: InvoicePayload = {
  student: null,
  fee_structure: null,
  total_amount: 0,
  paid_amount: 0,
  status: "unpaid",
  due_date: "",
};

export default function SchoolAdminFeesPage() {
  const [invoicePage, setInvoicePage] = useState(1);
  const [search, setSearch] = useState("");

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [invoicePayload, setInvoicePayload] = useState<InvoicePayload>(emptyInvoice);
  const [paymentPayload, setPaymentPayload] = useState<PaymentPayload>({
    invoice: null,
    amount: 0,
    method: "cash",
  });

  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const feeQuery = feeHooks.useList({ page: 1, page_size: 200 });
  const invoiceQuery = invoiceHooks.useList({ page: invoicePage, search });
  const studentQuery = studentHooks.useList({ page: 1, page_size: 200 });

  const createInvoice = invoiceHooks.useCreate({ successMessage: "Invoice created." });
  const createPayment = paymentHooks.useCreate({ successMessage: "Payment recorded." });

  const feeStructures = feeQuery.data?.results ?? [];
  const invoices = invoiceQuery.data?.results ?? [];
  const students = studentQuery.data?.results ?? [];

  async function submitInvoice() {
    if (!invoicePayload.student) {
      setInvoiceError("Choose the student this invoice is for.");
      return;
    }
    if (!invoicePayload.fee_structure) {
      setInvoiceError("Choose which class tuition this invoice charges.");
      return;
    }

    setInvoiceError(null);
    try {
      await createInvoice.mutateAsync(invoicePayload);
      setInvoiceModalOpen(false);
      setInvoicePayload(emptyInvoice);
    } catch (error) {
      setInvoiceError(extractApiErrorMessage(error, "Could not create this invoice. Please try again."));
    }
  }

  async function submitPayment() {
    if (!paymentPayload.invoice) {
      setPaymentError("Choose the invoice this payment applies to.");
      return;
    }
    if (!paymentPayload.amount || paymentPayload.amount <= 0) {
      setPaymentError("Enter a payment amount greater than zero.");
      return;
    }

    setPaymentError(null);
    try {
      await createPayment.mutateAsync(paymentPayload);
      setPaymentModalOpen(false);
      setPaymentPayload({ invoice: null, amount: 0, method: "cash" });
    } catch (error) {
      setPaymentError(extractApiErrorMessage(error, "Could not record this payment. Please try again."));
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Monthly tuition is set when you create or edit a class under Classes. This page is for invoices and
        payments.
      </p>

      <DataTableShell
        title="Invoices"
        count={invoiceQuery.data?.count ?? 0}
        searchValue={search}
        searchPlaceholder="Search invoices"
        onSearchChange={setSearch}
        onCreate={() => {
          setInvoiceError(null);
          setInvoiceModalOpen(true);
        }}
        createLabel="Create Invoice"
        toolbarExtra={
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "h-9 gap-1.5 rounded-xl border-border/80 bg-background px-3 text-sm font-medium"
            )}
            onClick={() => {
              setPaymentError(null);
              setPaymentModalOpen(true);
            }}
          >
            <PlusCircle className="size-3.5" />
            Record Payment
          </button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.student_name || "-"}</TableCell>
                <TableCell>{invoice.fee_structure_name || "-"}</TableCell>
                <TableCell>₨ {invoice.total_amount}</TableCell>
                <TableCell>₨ {invoice.paid_amount}</TableCell>
                <TableCell>₨ {invoice.balance ?? 0}</TableCell>
                <TableCell className="capitalize">{invoice.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          page={invoicePage}
          total={invoiceQuery.data?.count ?? 0}
          hasNext={Boolean(invoiceQuery.data?.next)}
          hasPrevious={Boolean(invoiceQuery.data?.previous)}
          onPageChange={setInvoicePage}
        />
      </DataTableShell>

      <FormModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        title="Create Invoice"
        description="Create a fee invoice for one student. Prefer the student’s discounted monthly fee when set."
        submitLabel="Create"
        loading={createInvoice.isPending}
        error={invoiceError}
        onSubmit={submitInvoice}
      >
        <FormField label="Student" required>
          <Select
            value={invoicePayload.student ?? ""}
            onChange={(e) => {
              const studentId = Number(e.target.value) || null;
              const student = students.find((item) => item.id === studentId);
              const effective = student?.monthly_fee_effective;
              setInvoicePayload((p) => ({
                ...p,
                student: studentId,
                total_amount:
                  effective !== null && effective !== undefined
                    ? Number(effective) || p.total_amount
                    : p.total_amount,
              }));
            }}
          >
            <option value="">Choose a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name || `${student.first_name} ${student.last_name}`}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Class tuition" hint="Pick the class monthly tuition this invoice is based on." required>
          <Select
            value={invoicePayload.fee_structure ?? ""}
            onChange={(e) => {
              const feeId = Number(e.target.value) || null;
              const fee = feeStructures.find((item) => item.id === feeId);
              setInvoicePayload((p) => ({
                ...p,
                fee_structure: feeId,
                total_amount:
                  p.total_amount > 0
                    ? p.total_amount
                    : fee
                      ? Number(fee.amount) || 0
                      : 0,
              }));
            }}
          >
            <option value="">Choose class tuition</option>
            {feeStructures.map((fee) => (
              <option key={fee.id} value={fee.id}>
                {fee.class_level_name || fee.name} — ₨ {fee.amount}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Total amount (PKR)" hint="Defaults to the student’s net monthly fee when available." required>
          <Input
            type="number"
            min={0}
            value={invoicePayload.total_amount}
            placeholder="e.g. 2500"
            onChange={(e) => setInvoicePayload((p) => ({ ...p, total_amount: Number(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label="Payment due date" required>
          <Input
            type="date"
            value={invoicePayload.due_date}
            onChange={(e) => setInvoicePayload((p) => ({ ...p, due_date: e.target.value }))}
          />
        </FormField>
        <FormField label="Initial payment status" hint="Usually Unpaid when creating a new invoice.">
          <Select
            value={invoicePayload.status}
            onChange={(e) => setInvoicePayload((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partially paid</option>
            <option value="paid">Paid in full</option>
          </Select>
        </FormField>
      </FormModal>

      <FormModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        title="Record Payment"
        description="Apply a received payment to an existing student invoice."
        submitLabel="Record"
        loading={createPayment.isPending}
        error={paymentError}
        onSubmit={submitPayment}
      >
        <FormField label="Invoice" hint="Choose the invoice this payment belongs to." required>
          <Select
            value={paymentPayload.invoice ?? ""}
            onChange={(e) =>
              setPaymentPayload((p) => ({ ...p, invoice: Number(e.target.value) || null }))
            }
          >
            <option value="">Choose an invoice</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.student_name || "Student"} — {invoice.status}, balance ₨ {invoice.balance ?? 0}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Amount received (PKR)" hint="Enter only the amount received in this transaction." required>
          <Input
            type="number"
            min={0}
            value={paymentPayload.amount}
            placeholder="e.g. 6000"
            onChange={(e) => setPaymentPayload((p) => ({ ...p, amount: Number(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label="Payment method" required>
          <Select
            value={paymentPayload.method}
            onChange={(e) => setPaymentPayload((p) => ({ ...p, method: e.target.value }))}
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="card">Card</option>
          </Select>
        </FormField>
      </FormModal>
    </div>
  );
}
