"use client";

import { useState } from "react";
import { createCrudHooks, extractApiErrorMessage } from "@/lib/crud";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { TablePagination } from "@/components/data/table-pagination";
import { StatusTabs } from "@/components/data/status-tabs";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Inquiry = {
  id: number;
  full_name: string;
  phone: string;
  interested_class: string;
  source: string;
  status: string;
};

type InquiryPayload = {
  full_name: string;
  phone: string;
  interested_class: string;
  source: string;
  status: string;
};

const inquiryHooks = createCrudHooks<Inquiry, InquiryPayload>("/inquiries/");

const inquiryStatusTabs = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "visited", label: "Visited" },
  { key: "applied", label: "Applied" },
  { key: "admitted", label: "Admitted" },
  { key: "rejected", label: "Rejected" },
];

const emptyInquiry: InquiryPayload = {
  full_name: "",
  phone: "",
  interested_class: "",
  source: "",
  status: "new",
};

export default function SchoolAdminAdmissionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("new");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Inquiry | null>(null);
  const [payload, setPayload] = useState<InquiryPayload>(emptyInquiry);
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = inquiryHooks.useList({ page, search, status });
  const createMutation = inquiryHooks.useCreate({ successMessage: "Inquiry created." });
  const updateMutation = inquiryHooks.useUpdate({ successMessage: "Inquiry updated." });

  const inquiries = listQuery.data?.results ?? [];
  const total = listQuery.data?.count ?? 0;

  function openCreate() {
    setEditing(null);
    setPayload(emptyInquiry);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(inquiry: Inquiry) {
    setEditing(inquiry);
    setFormError(null);
    setPayload({
      full_name: inquiry.full_name,
      phone: inquiry.phone,
      interested_class: inquiry.interested_class,
      source: inquiry.source,
      status: inquiry.status,
    });
    setIsModalOpen(true);
  }

  async function submitInquiry() {
    if (!payload.full_name.trim()) {
      setFormError("Enter the prospective student's name.");
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
      setFormError(extractApiErrorMessage(error, "Could not save this inquiry. Please try again."));
    }
  }

  return (
    <div className="space-y-4">
      <StatusTabs
        tabs={inquiryStatusTabs.map((tab) => ({
          ...tab,
          count: tab.key === status ? total : undefined,
        }))}
        activeKey={status}
        onChange={(key) => {
          setStatus(key);
          setPage(1);
        }}
      />

      <DataTableShell
        title="Admissions Pipeline"
        count={total}
        searchValue={search}
        searchPlaceholder="Search inquiries"
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCreate={openCreate}
        createLabel="Add Inquiry"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Interested Class</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id} onClick={() => openEdit(inquiry)} className="cursor-pointer">
                <TableCell className="font-medium">{inquiry.full_name}</TableCell>
                <TableCell>{inquiry.phone || "-"}</TableCell>
                <TableCell>{inquiry.interested_class || "-"}</TableCell>
                <TableCell>{inquiry.source || "-"}</TableCell>
                <TableCell className="capitalize">{inquiry.status}</TableCell>
              </TableRow>
            ))}
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
        title={editing ? "Edit Inquiry" : "Create Inquiry"}
        description="Record the prospective student's contact details and current admission stage."
        submitLabel={editing ? "Save Changes" : "Create Inquiry"}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={submitInquiry}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Prospective student name" required>
            <Input
              placeholder="e.g. Ayesha Khan"
              value={payload.full_name}
              onChange={(e) => setPayload((p) => ({ ...p, full_name: e.target.value }))}
            />
          </FormField>
          <FormField label="Contact phone" hint="Parent or guardian's primary phone number.">
            <Input
              type="tel"
              placeholder="e.g. 0300 1234567"
              value={payload.phone}
              onChange={(e) => setPayload((p) => ({ ...p, phone: e.target.value }))}
            />
          </FormField>
          <FormField label="Interested grade" hint="The grade they are asking about.">
            <Input
              placeholder="e.g. Grade 5"
              value={payload.interested_class}
              onChange={(e) => setPayload((p) => ({ ...p, interested_class: e.target.value }))}
            />
          </FormField>
          <FormField label="Inquiry source" hint="How the family found or contacted the school.">
            <Input
              placeholder="e.g. Website, walk-in, referral"
              value={payload.source}
              onChange={(e) => setPayload((p) => ({ ...p, source: e.target.value }))}
            />
          </FormField>
          <FormField label="Admission stage" hint="Move this forward as your team follows up." required className="sm:col-span-2">
            <Select value={payload.status} onChange={(e) => setPayload((p) => ({ ...p, status: e.target.value }))}>
              {inquiryStatusTabs.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </FormModal>
    </div>
  );
}
