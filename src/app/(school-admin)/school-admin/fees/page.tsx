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
type FeeStructurePayload = { name: string; amount: number; class_level: number | null };

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
type Student = { id: number; full_name?: string; first_name: string; last_name: string };
type ClassLevel = { id: number; name: string };

const feeHooks = createCrudHooks<FeeStructure, FeeStructurePayload>("/fee-structures/");
const invoiceHooks = createCrudHooks<Invoice, InvoicePayload>("/invoices/");
const paymentHooks = createCrudHooks<{ id: number }, PaymentPayload>("/payments/");
const studentHooks = createCrudHooks<Student, Record<string, unknown>>("/students/");
const classLevelHooks = createCrudHooks<ClassLevel, Record<string, unknown>>("/class-levels/");

const emptyFee: FeeStructurePayload = { name: "", amount: 0, class_level: null };
const emptyInvoice: InvoicePayload = {
  student: null,
  fee_structure: null,
  total_amount: 0,
  paid_amount: 0,
  status: "unpaid",
  due_date: "",
};

export default function SchoolAdminFeesPage() {
  const [feePage, setFeePage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);
  const [search, setSearch] = useState("");

  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [feePayload, setFeePayload] = useState<FeeStructurePayload>(emptyFee);
  const [invoicePayload, setInvoicePayload] = useState<InvoicePayload>(emptyInvoice);
  const [paymentPayload, setPaymentPayload] = useState<PaymentPayload>({ invoice: null, amount: 0, method: "cash" });

  const [feeError, setFeeError] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const feeQuery = feeHooks.useList({ page: feePage, search });
  const invoiceQuery = invoiceHooks.useList({ page: invoicePage, search });
  const studentQuery = studentHooks.useList({ page: 1 });
  const classLevelQuery = classLevelHooks.useList({ page: 1 });

  const createFee = feeHooks.useCreate({ successMessage: "Fee structure created." });
  const createInvoice = invoiceHooks.useCreate({ successMessage: "Invoice created." });
  const createPayment = paymentHooks.useCreate({ successMessage: "Payment recorded." });

  const feeStructures = feeQuery.data?.results ?? [];
  const invoices = invoiceQuery.data?.results ?? [];
  const students = studentQuery.data?.results ?? [];
  const levels = classLevelQuery.data?.results ?? [];

  async function submitFee() {
    if (!feePayload.name.trim()) {
      setFeeError("Enter a fee name, for example Term 1 Tuition.");
      return;
    }
    if (!feePayload.class_level) {
      setFeeError(
        levels.length === 0
          ? "This school has no classes yet. Create a class first, then add fee structures."
          : "Choose the class this fee applies to.",
      );
      return;
    }

    setFeeError(null);
    try {
      await createFee.mutateAsync(feePayload);
      setFeeModalOpen(false);
      setFeePayload(emptyFee);
    } catch (error) {
      setFeeError(extractApiErrorMessage(error, "Could not save this fee structure. Please try again."));
    }
  }

  async function submitInvoice() {
    if (!invoicePayload.student) {
      setInvoiceError("Choose the student this invoice is for.");
      return;
    }
    if (!invoicePayload.fee_structure) {
      setInvoiceError("Choose which fee structure this invoice charges.");
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
      <DataTableShell
        title="Fee Structures"
        count={feeQuery.data?.count ?? 0}
        searchValue={search}
        searchPlaceholder="Search fee structures"
        onSearchChange={setSearch}
        onCreate={() => {
          setFeeError(null);
          setFeeModalOpen(true);
        }}
        createLabel="Add Structure"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeStructures.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="font-medium">{fee.name}</TableCell>
                <TableCell>{fee.class_level_name || "-"}</TableCell>
                <TableCell>₨ {fee.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          page={feePage}
          total={feeQuery.data?.count ?? 0}
          hasNext={Boolean(feeQuery.data?.next)}
          hasPrevious={Boolean(feeQuery.data?.previous)}
          onPageChange={setFeePage}
        />
      </DataTableShell>

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
        open={feeModalOpen}
        onOpenChange={setFeeModalOpen}
        title="Add Fee Structure"
        description="Define a reusable fee amount for a specific class, such as Class 1."
        submitLabel="Create"
        loading={createFee.isPending}
        error={feeError}
        onSubmit={submitFee}
      >
        <FormField label="Fee name" hint="A recognizable name shown on invoices." required>
          <Input
            value={feePayload.name}
            placeholder="e.g. Monthly Tuition"
            onChange={(e) => setFeePayload((p) => ({ ...p, name: e.target.value }))}
          />
        </FormField>
        <FormField label="Amount (PKR)" hint="The amount charged to each student for this fee." required>
          <Input
            type="number"
            min={0}
            value={feePayload.amount}
            placeholder="e.g. 12000"
            onChange={(e) => setFeePayload((p) => ({ ...p, amount: Number(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label="Class" hint="This fee structure will be available for this class." required>
          <Select value={feePayload.class_level ?? ""} onChange={(e) => setFeePayload((p) => ({ ...p, class_level: Number(e.target.value) || null }))}>
            <option value="">Choose a class</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </Select>
        </FormField>
      </FormModal>

      <FormModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        title="Create Invoice"
        description="Create a fee invoice for one student and set its due date."
        submitLabel="Create"
        loading={createInvoice.isPending}
        error={invoiceError}
        onSubmit={submitInvoice}
      >
        <FormField label="Student" required>
          <Select value={invoicePayload.student ?? ""} onChange={(e) => setInvoicePayload((p) => ({ ...p, student: Number(e.target.value) || null }))}>
            <option value="">Choose a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name || `${student.first_name} ${student.last_name}`}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Fee structure" hint="Select the type of charge for this invoice." required>
          <Select value={invoicePayload.fee_structure ?? ""} onChange={(e) => setInvoicePayload((p) => ({ ...p, fee_structure: Number(e.target.value) || null }))}>
            <option value="">Choose a fee structure</option>
            {feeStructures.map((fee) => (
              <option key={fee.id} value={fee.id}>
                {fee.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Total amount (PKR)" hint="The full amount the student must pay." required>
          <Input
            type="number"
            min={0}
            value={invoicePayload.total_amount}
            placeholder="e.g. 12000"
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
          <Select value={invoicePayload.status} onChange={(e) => setInvoicePayload((p) => ({ ...p, status: e.target.value }))}>
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
          <Select value={paymentPayload.invoice ?? ""} onChange={(e) => setPaymentPayload((p) => ({ ...p, invoice: Number(e.target.value) || null }))}>
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
          <Select value={paymentPayload.method} onChange={(e) => setPaymentPayload((p) => ({ ...p, method: e.target.value }))}>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="card">Card</option>
          </Select>
        </FormField>
      </FormModal>
    </div>
  );
}

