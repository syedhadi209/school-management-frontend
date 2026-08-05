"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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

type Fund = {
  id: number;
  name: string;
  amount: string;
  status: string;
};

type Invoice = {
  id: number;
  student: number;
  student_name?: string;
  fee_structure: number | null;
  fee_structure_name?: string;
  invoice_type: "monthly_fee" | "fund" | string;
  fund: number | null;
  fund_name?: string;
  tenure?: string;
  total_amount: string;
  paid_amount: string;
  balance?: number;
  status: string;
  due_date: string | null;
};

type InvoicePayload = {
  student: number | null;
  invoice_type: "monthly_fee" | "fund";
  fee_structure: number | null;
  fund: number | null;
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
const fundHooks = createCrudHooks<Fund, Record<string, unknown>>("/funds/");
const invoiceHooks = createCrudHooks<Invoice, InvoicePayload>("/invoices/");
const paymentHooks = createCrudHooks<{ id: number }, PaymentPayload>("/payments/");
const studentHooks = createCrudHooks<Student, Record<string, unknown>>("/students/");

const emptyInvoice: InvoicePayload = {
  student: null,
  invoice_type: "monthly_fee",
  fee_structure: null,
  fund: null,
  total_amount: 0,
  paid_amount: 0,
  status: "unpaid",
  due_date: "",
};

function typeLabel(invoice: Invoice) {
  if (invoice.invoice_type === "fund") {
    return invoice.fund_name ? `Fund · ${invoice.fund_name}` : "Fund";
  }
  return invoice.fee_structure_name || "Monthly fee";
}

function typeBadge(invoice: Invoice) {
  const isFund = invoice.invoice_type === "fund";
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

export function FeesManager() {
  const queryClient = useQueryClient();
  const [invoicePage, setInvoicePage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [invoicePayload, setInvoicePayload] = useState<InvoicePayload>(emptyInvoice);
  const [paymentPayload, setPaymentPayload] = useState<PaymentPayload>({
    invoice: null,
    amount: 0,
    method: "cash",
  });
  const [paymentStudent, setPaymentStudent] = useState<number | null>(null);
  const [pinnedInvoice, setPinnedInvoice] = useState<Invoice | null>(null);

  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const feeQuery = feeHooks.useList({ page: 1, page_size: 200 });
  const fundQuery = fundHooks.useList({ page: 1, page_size: 200, status: "active" });
  const invoiceQuery = invoiceHooks.useList({
    page: invoicePage,
    search,
    ...(typeFilter ? { invoice_type: typeFilter } : {}),
  });
  const studentQuery = studentHooks.useList({ page: 1, page_size: 200 });

  // Payable invoices are looked up independently of the table filters so a fund
  // invoice on another page can still be collected.
  const payableQuery = invoiceHooks.useList(
    {
      page: 1,
      page_size: 200,
      ...(paymentStudent ? { student: paymentStudent } : {}),
    },
    { enabled: paymentModalOpen }
  );

  // Students already charged for the selected fund cannot be charged twice.
  const fundChargesQuery = invoiceHooks.useList(
    {
      page: 1,
      page_size: 500,
      invoice_type: "fund",
      fund: invoicePayload.fund ?? undefined,
    },
    {
      enabled:
        invoiceModalOpen && invoicePayload.invoice_type === "fund" && Boolean(invoicePayload.fund),
    }
  );

  const createInvoice = invoiceHooks.useCreate({ successMessage: "Invoice created." });
  const createPayment = paymentHooks.useCreate({ successMessage: "Payment recorded." });

  const feeStructures = feeQuery.data?.results ?? [];
  const funds = fundQuery.data?.results ?? [];
  const invoices = invoiceQuery.data?.results ?? [];
  const students = studentQuery.data?.results ?? [];

  const chargedStudentIds = new Set((fundChargesQuery.data?.results ?? []).map((inv) => inv.student));
  const invoiceStudentOptions =
    invoicePayload.invoice_type === "fund" && invoicePayload.fund
      ? students.filter((student) => !chargedStudentIds.has(student.id))
      : students;

  const payableInvoices = (payableQuery.data?.results ?? []).filter(
    (invoice) => Number(invoice.balance ?? 0) > 0
  );
  const paymentOptions =
    pinnedInvoice && !payableInvoices.some((invoice) => invoice.id === pinnedInvoice.id)
      ? [pinnedInvoice, ...payableInvoices]
      : payableInvoices;
  const selectedPaymentInvoice = paymentOptions.find((invoice) => invoice.id === paymentPayload.invoice);
  const selectedBalance = Number(selectedPaymentInvoice?.balance ?? 0);

  function openPaymentModal(invoice?: Invoice) {
    setPaymentError(null);
    setPinnedInvoice(invoice ?? null);
    setPaymentStudent(invoice ? invoice.student : null);
    setPaymentPayload({ invoice: invoice ? invoice.id : null, amount: 0, method: "cash" });
    setPaymentModalOpen(true);
  }

  async function submitInvoice() {
    if (!invoicePayload.student) {
      setInvoiceError("Choose the student this invoice is for.");
      return;
    }
    if (invoicePayload.invoice_type === "monthly_fee" && !invoicePayload.fee_structure) {
      setInvoiceError("Choose which class tuition this invoice charges.");
      return;
    }
    if (invoicePayload.invoice_type === "fund" && !invoicePayload.fund) {
      setInvoiceError("Choose which fund this invoice charges.");
      return;
    }

    setInvoiceError(null);
    const body: InvoicePayload = {
      ...invoicePayload,
      fee_structure: invoicePayload.invoice_type === "monthly_fee" ? invoicePayload.fee_structure : null,
      fund: invoicePayload.invoice_type === "fund" ? invoicePayload.fund : null,
    };
    try {
      await createInvoice.mutateAsync(body);
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
    if (selectedBalance > 0 && paymentPayload.amount > selectedBalance) {
      setPaymentError(`Amount is more than the remaining balance of ₨ ${selectedBalance}.`);
      return;
    }

    setPaymentError(null);
    try {
      await createPayment.mutateAsync(paymentPayload);
      await queryClient.invalidateQueries({ queryKey: ["/invoices/"] });
      setPaymentModalOpen(false);
      setPaymentPayload({ invoice: null, amount: 0, method: "cash" });
      setPaymentStudent(null);
      setPinnedInvoice(null);
    } catch (error) {
      setPaymentError(extractApiErrorMessage(error, "Could not record this payment. Please try again."));
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Record payments for monthly tuition and school fund invoices. Fund definitions live under Funds.
      </p>

      <DataTableShell
        title="Invoices"
        count={invoiceQuery.data?.count ?? 0}
        searchValue={search}
        searchPlaceholder="Search invoices"
        onSearchChange={setSearch}
        onCreate={() => {
          setInvoiceError(null);
          setInvoicePayload(emptyInvoice);
          setInvoiceModalOpen(true);
        }}
        createLabel="Create Invoice"
        toolbarExtra={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setInvoicePage(1);
              }}
              className="h-9 w-[150px]"
            >
              <option value="">All types</option>
              <option value="monthly_fee">Monthly fee</option>
              <option value="fund">Fund</option>
            </Select>
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "h-9 gap-1.5 rounded-xl border-border/80 bg-background px-3 text-sm font-medium"
              )}
              onClick={() => openPaymentModal()}
            >
              <PlusCircle className="size-3.5" />
              Record Payment
            </button>
          </div>
        }
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.student_name || "-"}</TableCell>
                <TableCell>{typeBadge(invoice)}</TableCell>
                <TableCell>{typeLabel(invoice)}</TableCell>
                <TableCell>₨ {invoice.total_amount}</TableCell>
                <TableCell>₨ {invoice.paid_amount}</TableCell>
                <TableCell>₨ {invoice.balance ?? 0}</TableCell>
                <TableCell className="capitalize">{invoice.status}</TableCell>
                <TableCell className="text-right">
                  {Number(invoice.balance ?? 0) > 0 ? (
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-lg")}
                      onClick={() => openPaymentModal(invoice)}
                    >
                      Record payment
                    </button>
                  ) : null}
                </TableCell>
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
        description="Create a monthly tuition or fund invoice. Prefer auto-generated fund invoices from Funds → Activate."
        submitLabel="Create"
        loading={createInvoice.isPending}
        error={invoiceError}
        onSubmit={submitInvoice}
      >
        <FormField label="Invoice type" required>
          <Select
            value={invoicePayload.invoice_type}
            onChange={(e) =>
              setInvoicePayload((p) => ({
                ...p,
                invoice_type: e.target.value as "monthly_fee" | "fund",
                fee_structure: null,
                fund: null,
                total_amount: 0,
              }))
            }
          >
            <option value="monthly_fee">Monthly fee</option>
            <option value="fund">Fund</option>
          </Select>
        </FormField>
        <FormField
          label="Student"
          required
          hint={
            invoicePayload.invoice_type === "fund"
              ? "Students already charged for this fund are hidden — collect from them with Record Payment."
              : undefined
          }
        >
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
                  p.invoice_type === "monthly_fee" && effective !== null && effective !== undefined
                    ? Number(effective) || p.total_amount
                    : p.total_amount,
              }));
            }}
          >
            <option value="">Choose a student</option>
            {invoiceStudentOptions.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name || `${student.first_name} ${student.last_name}`}
              </option>
            ))}
          </Select>
        </FormField>
        {invoicePayload.invoice_type === "monthly_fee" ? (
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
                    p.total_amount > 0 ? p.total_amount : fee ? Number(fee.amount) || 0 : 0,
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
        ) : (
          <FormField
            label="Fund"
            required
            hint="Activating a fund already charges every active student in its classes."
          >
            <Select
              value={invoicePayload.fund ?? ""}
              onChange={(e) => {
                const fundId = Number(e.target.value) || null;
                const fund = funds.find((item) => item.id === fundId);
                setInvoicePayload((p) => ({
                  ...p,
                  fund: fundId,
                  student: null,
                  total_amount: fund ? Number(fund.amount) || 0 : p.total_amount,
                }));
              }}
            >
              <option value="">Choose a fund</option>
              {funds.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.name} — ₨ {fund.amount}
                </option>
              ))}
            </Select>
          </FormField>
        )}
        <FormField label="Total amount (PKR)" required>
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
        description="Apply a received payment to a monthly fee or fund invoice. Partial amounts are allowed."
        submitLabel="Record"
        loading={createPayment.isPending}
        error={paymentError}
        onSubmit={submitPayment}
      >
        <FormField label="Student" hint="Optional — narrows the invoice list below.">
          <Select
            value={paymentStudent ?? ""}
            onChange={(e) => {
              setPaymentStudent(Number(e.target.value) || null);
              setPinnedInvoice(null);
              setPaymentPayload((p) => ({ ...p, invoice: null }));
            }}
          >
            <option value="">All students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name || `${student.first_name} ${student.last_name}`}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Invoice" hint="Only invoices with a remaining balance are listed." required>
          <Select
            value={paymentPayload.invoice ?? ""}
            onChange={(e) =>
              setPaymentPayload((p) => ({ ...p, invoice: Number(e.target.value) || null }))
            }
          >
            <option value="">
              {payableQuery.isLoading ? "Loading invoices…" : "Choose an invoice"}
            </option>
            {paymentOptions.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.student_name || "Student"} — {typeLabel(invoice)} · {invoice.status}, balance ₨{" "}
                {invoice.balance ?? 0}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Amount received (PKR)"
          hint={
            selectedBalance > 0
              ? `Remaining balance ₨ ${selectedBalance}. Partial amounts are allowed.`
              : "Enter only the amount received in this transaction."
          }
          required
        >
          <Input
            type="number"
            min={0}
            max={selectedBalance > 0 ? selectedBalance : undefined}
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
