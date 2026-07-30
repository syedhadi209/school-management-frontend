"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GraduationCap, Pencil } from "lucide-react";

import { api } from "@/lib/api";
import { createCrudHooks, extractApiErrorFields, extractApiErrorMessage } from "@/lib/crud";
import { DataTableShell } from "@/components/data/data-table";
import { FormField } from "@/components/data/form-field";
import { FormModal } from "@/components/data/form-modal";
import { StatusTabs } from "@/components/data/status-tabs";
import { TablePagination } from "@/components/data/table-pagination";
import {
  EMPTY_FAMILY_DETAILS,
  FAMILY_FIELD_KEYS,
  FamilyDetailsFields,
} from "@/components/students/family-details-fields";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Inquiry = {
  id: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  email?: string;
  interested_class: string;
  interested_class_level: number | null;
  interested_class_name?: string;
  preferred_section: number | null;
  preferred_section_name?: string;
  source: string;
  status: string;
  notes?: string;
  follow_up_date?: string | null;
  application_date?: string | null;
  rejection_reason?: string;
  gender?: string;
  date_of_birth?: string | null;
  father_name?: string;
  mother_name?: string;
  father_cnic?: string;
  mother_cnic?: string;
  address?: string;
  region?: string;
  parent_email?: string;
  parent_phone?: string;
  parent_alternate_phone?: string;
  student_id?: number | null;
  student_roll_number?: string;
};

type InquiryPayload = {
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  interested_class: string;
  interested_class_level: number | null;
  preferred_section: number | null;
  source: string;
  status: string;
  notes: string;
  follow_up_date: string;
  application_date: string;
  rejection_reason: string;
  gender: string;
  date_of_birth: string;
  father_name: string;
  mother_name: string;
  father_cnic: string;
  mother_cnic: string;
  address: string;
  region: string;
  parent_email: string;
  parent_phone: string;
  parent_alternate_phone: string;
};

type ClassLevel = {
  id: number;
  name: string;
};

type Section = {
  id: number;
  name: string;
  class_level: number;
  class_level_name?: string;
  capacity?: number;
};

type AdmitResult = {
  created: boolean;
  student: { id: number; roll_number: string; first_name: string; last_name: string };
  inquiry: Inquiry;
};

const inquiryHooks = createCrudHooks<Inquiry, InquiryPayload>("/inquiries/");
const classHooks = createCrudHooks<ClassLevel, Record<string, unknown>>("/class-levels/");
const sectionHooks = createCrudHooks<Section, Record<string, unknown>>("/sections/");

const inquiryStatusTabs = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "visited", label: "Visited" },
  { key: "applied", label: "Applied" },
  { key: "admitted", label: "Admitted" },
  { key: "rejected", label: "Rejected" },
];

const DETAIL_STEPS = [
  { id: "applicant", label: "Applicant details" },
  { id: "family", label: "Family details" },
];

const emptyInquiry: InquiryPayload = {
  full_name: "",
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  interested_class: "",
  interested_class_level: null,
  preferred_section: null,
  source: "",
  status: "new",
  notes: "",
  follow_up_date: "",
  application_date: "",
  rejection_reason: "",
  gender: "",
  date_of_birth: "",
  father_name: "",
  mother_name: "",
  father_cnic: "",
  mother_cnic: "",
  address: "",
  region: "",
  parent_email: "",
  parent_phone: "",
  parent_alternate_phone: "",
};

type ModalMode = "quick" | "detailed" | "edit" | null;

function inquiryToPayload(inquiry: Inquiry): InquiryPayload {
  return {
    full_name: inquiry.full_name ?? "",
    first_name: inquiry.first_name ?? "",
    last_name: inquiry.last_name ?? "",
    phone: inquiry.phone ?? "",
    email: inquiry.email ?? "",
    interested_class: inquiry.interested_class ?? "",
    interested_class_level: inquiry.interested_class_level,
    preferred_section: inquiry.preferred_section,
    source: inquiry.source ?? "",
    status: inquiry.status,
    notes: inquiry.notes ?? "",
    follow_up_date: inquiry.follow_up_date ?? "",
    application_date: inquiry.application_date ?? "",
    rejection_reason: inquiry.rejection_reason ?? "",
    gender: inquiry.gender ?? "",
    date_of_birth: inquiry.date_of_birth ?? "",
    father_name: inquiry.father_name ?? "",
    mother_name: inquiry.mother_name ?? "",
    father_cnic: inquiry.father_cnic ?? "",
    mother_cnic: inquiry.mother_cnic ?? "",
    address: inquiry.address ?? "",
    region: inquiry.region ?? "",
    parent_email: inquiry.parent_email ?? "",
    parent_phone: inquiry.parent_phone ?? inquiry.phone ?? "",
    parent_alternate_phone: inquiry.parent_alternate_phone ?? "",
  };
}

function toApiPayload(payload: InquiryPayload) {
  return {
    ...payload,
    full_name:
      payload.full_name.trim() ||
      `${payload.first_name} ${payload.last_name}`.trim(),
    date_of_birth: payload.date_of_birth || null,
    follow_up_date: payload.follow_up_date || null,
    application_date: payload.application_date || null,
    interested_class_level: payload.interested_class_level,
    preferred_section: payload.preferred_section,
  };
}

export function AdmissionsManager({ studentsHref = "/school-admin/students" }: { studentsHref?: string }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("new");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Inquiry | null>(null);
  const [payload, setPayload] = useState<InquiryPayload>(emptyInquiry);
  const [formError, setFormError] = useState<string | null>(null);
  const [detailStep, setDetailStep] = useState(0);
  const [admitTarget, setAdmitTarget] = useState<Inquiry | null>(null);
  const [admitSection, setAdmitSection] = useState<number | "">("");
  const [admitDate, setAdmitDate] = useState("");
  const [admitError, setAdmitError] = useState<string | null>(null);
  const [admitSuccess, setAdmitSuccess] = useState<AdmitResult | null>(null);

  const listQuery = inquiryHooks.useList({ page, search, status });
  const classesQuery = classHooks.useList({ page: 1, page_size: 200 });
  const sectionsQuery = sectionHooks.useList({ page: 1, page_size: 200 });
  const createMutation = inquiryHooks.useCreate({ successMessage: "Inquiry saved." });
  const updateMutation = inquiryHooks.useUpdate({ successMessage: "Inquiry updated." });

  const admitMutation = useMutation({
    mutationFn: async ({
      id,
      section,
      admission_date,
    }: {
      id: number;
      section: number;
      admission_date?: string | null;
    }) => {
      const { data } = await api.post<AdmitResult>(`/inquiries/${id}/admit/`, {
        section,
        admission_date: admission_date || null,
        student_status: "active",
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/inquiries/"] });
      queryClient.invalidateQueries({ queryKey: ["/students/"] });
      setAdmitSuccess(data);
      toast.success(
        data.created
          ? `Student enrolled with roll number ${data.student.roll_number}.`
          : `Already enrolled as ${data.student.roll_number}.`
      );
    },
    onError: (error) => {
      setAdmitError(extractApiErrorMessage(error, "Could not admit this inquiry."));
    },
  });

  const inquiries = listQuery.data?.results ?? [];
  const total = listQuery.data?.count ?? 0;
  const classes = classesQuery.data?.results ?? [];
  const sections = sectionsQuery.data?.results ?? [];

  const filteredSections = useMemo(() => {
    if (!payload.interested_class_level) return sections;
    return sections.filter((section) => section.class_level === payload.interested_class_level);
  }, [payload.interested_class_level, sections]);

  const admitSections = useMemo(() => {
    if (!admitTarget?.interested_class_level) return sections;
    return sections.filter((section) => section.class_level === admitTarget.interested_class_level);
  }, [admitTarget, sections]);

  const isModalOpen = modalMode !== null;
  const isDetailedCreate = modalMode === "detailed";
  const isEdit = modalMode === "edit";
  const showStepper = isDetailedCreate;

  function closeModal() {
    setModalMode(null);
    setEditing(null);
    setDetailStep(0);
    setFormError(null);
  }

  function openQuickInquiry() {
    setEditing(null);
    setPayload({ ...emptyInquiry, status: "new" });
    setFormError(null);
    setDetailStep(0);
    setModalMode("quick");
  }

  function openDetailedApplication() {
    setEditing(null);
    setPayload({ ...emptyInquiry, status: "applied" });
    setFormError(null);
    setDetailStep(0);
    setModalMode("detailed");
  }

  function openEdit(inquiry: Inquiry) {
    setEditing(inquiry);
    setPayload(inquiryToPayload(inquiry));
    setFormError(null);
    setDetailStep(0);
    setModalMode("edit");
  }

  function openAdmit(inquiry: Inquiry) {
    setAdmitTarget(inquiry);
    setAdmitSection(inquiry.preferred_section ?? "");
    setAdmitDate(new Date().toISOString().slice(0, 10));
    setAdmitError(null);
    setAdmitSuccess(null);
  }

  function validateQuick(): string | null {
    if (!payload.full_name.trim() && !payload.first_name.trim()) {
      return "Enter the prospective student's name.";
    }
    if (!payload.phone.trim() && !payload.email.trim() && !payload.parent_email.trim()) {
      return "Provide a phone number or email.";
    }
    return null;
  }

  function validateApplicantStep(): string | null {
    if (!payload.first_name.trim() && !payload.full_name.trim()) {
      return "Enter the applicant's first name.";
    }
    if (payload.status === "applied" && !payload.date_of_birth) {
      return "Date of birth is required for an applied inquiry.";
    }
    if (payload.status === "applied" && !payload.gender) {
      return "Gender is required for an applied inquiry.";
    }
    if (payload.status === "rejected" && !payload.rejection_reason.trim()) {
      return "Provide a rejection reason.";
    }
    return null;
  }

  function validateFamilyStep(): string | null {
    if (payload.status !== "applied") return null;
    if (!payload.father_name.trim() && !payload.mother_name.trim()) {
      return "Provide at least a father or mother name.";
    }
    if (!payload.address.trim()) return "Home address is required for an applied inquiry.";
    if (!payload.parent_email.trim()) return "Parent email is required for an applied inquiry.";
    return null;
  }

  function jumpToErrorStep(error: unknown) {
    const fields = extractApiErrorFields(error);
    if (fields.some((field) => (FAMILY_FIELD_KEYS as readonly string[]).includes(field))) {
      setDetailStep(1);
    } else if (fields.length) {
      setDetailStep(0);
    }
  }

  async function submitModal() {
    if (modalMode === "quick") {
      const error = validateQuick();
      if (error) {
        setFormError(error);
        return;
      }
      setFormError(null);
      try {
        await createMutation.mutateAsync(toApiPayload(payload) as InquiryPayload);
        closeModal();
      } catch (err) {
        setFormError(extractApiErrorMessage(err, "Could not save this inquiry."));
      }
      return;
    }

    if (isDetailedCreate && detailStep === 0) {
      const error = validateApplicantStep();
      if (error) {
        setFormError(error);
        return;
      }
      setFormError(null);
      setDetailStep(1);
      return;
    }

    if (isDetailedCreate) {
      const applicantError = validateApplicantStep();
      if (applicantError) {
        setFormError(applicantError);
        setDetailStep(0);
        return;
      }
      const familyError = validateFamilyStep();
      if (familyError) {
        setFormError(familyError);
        return;
      }
    }

    if (isEdit) {
      const applicantError = validateApplicantStep();
      if (applicantError) {
        setFormError(applicantError);
        return;
      }
      if (payload.status === "applied") {
        const familyError = validateFamilyStep();
        if (familyError) {
          setFormError(familyError);
          return;
        }
      }
    }

    setFormError(null);
    try {
      const apiPayload = toApiPayload(payload) as InquiryPayload;
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: apiPayload });
      } else {
        await createMutation.mutateAsync(apiPayload);
      }
      closeModal();
    } catch (err) {
      if (showStepper) jumpToErrorStep(err);
      setFormError(extractApiErrorMessage(err, "Could not save this inquiry."));
    }
  }

  async function submitAdmit() {
    if (!admitTarget) return;
    if (!admitSection) {
      setAdmitError("Choose the section to enrol this student into.");
      return;
    }
    setAdmitError(null);
    await admitMutation.mutateAsync({
      id: admitTarget.id,
      section: Number(admitSection),
      admission_date: admitDate || null,
    });
  }

  function renderApplicantFields({ includeStatus }: { includeStatus: boolean }) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First name" required>
          <Input
            placeholder="e.g. Ayesha"
            value={payload.first_name || payload.full_name}
            onChange={(e) =>
              setPayload((p) => ({
                ...p,
                first_name: e.target.value,
                full_name: `${e.target.value} ${p.last_name}`.trim(),
              }))
            }
          />
        </FormField>
        <FormField label="Last name">
          <Input
            placeholder="e.g. Khan"
            value={payload.last_name}
            onChange={(e) =>
              setPayload((p) => ({
                ...p,
                last_name: e.target.value,
                full_name: `${p.first_name} ${e.target.value}`.trim(),
              }))
            }
          />
        </FormField>
        <FormField label="Contact phone" hint="Applicant or family phone.">
          <Input
            type="tel"
            placeholder="e.g. 0300 1234567"
            value={payload.phone}
            onChange={(e) => setPayload((p) => ({ ...p, phone: e.target.value }))}
          />
        </FormField>
        <FormField label="Applicant email">
          <Input
            type="email"
            placeholder="Optional"
            value={payload.email}
            onChange={(e) => setPayload((p) => ({ ...p, email: e.target.value }))}
          />
        </FormField>
        <FormField label="Date of birth" required={payload.status === "applied"}>
          <Input
            type="date"
            value={payload.date_of_birth}
            onChange={(e) => setPayload((p) => ({ ...p, date_of_birth: e.target.value }))}
          />
        </FormField>
        <FormField label="Gender" required={payload.status === "applied"}>
          <Select value={payload.gender} onChange={(e) => setPayload((p) => ({ ...p, gender: e.target.value }))}>
            <option value="">Choose gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </FormField>
        <FormField label="Interested class">
          <Select
            value={payload.interested_class_level ?? ""}
            onChange={(e) => {
              const classId = e.target.value ? Number(e.target.value) : null;
              const className = classes.find((item) => item.id === classId)?.name ?? "";
              setPayload((p) => ({
                ...p,
                interested_class_level: classId,
                interested_class: className,
                preferred_section: null,
              }));
            }}
          >
            <option value="">Select class</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Preferred section" hint="Optional until enrolment.">
          <Select
            value={payload.preferred_section ?? ""}
            onChange={(e) =>
              setPayload((p) => ({
                ...p,
                preferred_section: e.target.value ? Number(e.target.value) : null,
              }))
            }
          >
            <option value="">Not chosen yet</option>
            {filteredSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.class_level_name ? `${section.class_level_name} - ` : ""}
                {section.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Inquiry source">
          <Input
            placeholder="e.g. Website, walk-in, referral"
            value={payload.source}
            onChange={(e) => setPayload((p) => ({ ...p, source: e.target.value }))}
          />
        </FormField>
        <FormField label="Follow-up date">
          <Input
            type="date"
            value={payload.follow_up_date}
            onChange={(e) => setPayload((p) => ({ ...p, follow_up_date: e.target.value }))}
          />
        </FormField>
        {includeStatus ? (
          <FormField label="Admission stage" required className="sm:col-span-2">
            <Select
              value={payload.status}
              onChange={(e) => setPayload((p) => ({ ...p, status: e.target.value }))}
              disabled={payload.status === "admitted"}
            >
              {inquiryStatusTabs
                .filter((tab) => tab.key !== "admitted" || payload.status === "admitted")
                .map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.label}
                  </option>
                ))}
            </Select>
          </FormField>
        ) : null}
        {payload.status === "rejected" ? (
          <FormField label="Rejection reason" required className="sm:col-span-2">
            <textarea
              className="flex min-h-20 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={payload.rejection_reason}
              onChange={(e) => setPayload((p) => ({ ...p, rejection_reason: e.target.value }))}
            />
          </FormField>
        ) : null}
        <FormField label="Notes" className="sm:col-span-2">
          <textarea
            className="flex min-h-20 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            placeholder="Optional notes from the conversation"
            value={payload.notes}
            onChange={(e) => setPayload((p) => ({ ...p, notes: e.target.value }))}
          />
        </FormField>
      </div>
    );
  }

  function renderFamilyFields(required: boolean) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {required
            ? "Family details are required before marking an inquiry as Applied. Parent email creates or links the parent portal account at enrolment."
            : "Family details can be completed later. Parent email will create or link the parent portal account at enrolment."}
        </p>
        <FamilyDetailsFields
          values={{
            ...EMPTY_FAMILY_DETAILS,
            father_name: payload.father_name,
            mother_name: payload.mother_name,
            father_cnic: payload.father_cnic,
            mother_cnic: payload.mother_cnic,
            address: payload.address,
            region: payload.region,
            guardian_phone: payload.parent_phone,
            parent_phone: payload.parent_phone,
            parent_alternate_phone: payload.parent_alternate_phone,
            parent_email: payload.parent_email,
          }}
          onChange={(patch) =>
            setPayload((p) => ({
              ...p,
              ...patch,
              parent_phone: patch.parent_phone ?? patch.guardian_phone ?? p.parent_phone,
            }))
          }
          showOccupation={false}
          required={required}
          phoneField="parent_phone"
        />
      </div>
    );
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
        onCreate={openQuickInquiry}
        createLabel="New Inquiry"
      >
        <div className="mb-3 flex flex-wrap gap-2 px-1">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            onClick={openDetailedApplication}
          >
            Detailed application
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Interested Class</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium">{inquiry.full_name}</TableCell>
                <TableCell>{inquiry.phone || inquiry.parent_phone || "-"}</TableCell>
                <TableCell>
                  {inquiry.interested_class_name || inquiry.interested_class || "-"}
                </TableCell>
                <TableCell>{inquiry.source || "-"}</TableCell>
                <TableCell className="capitalize">
                  {inquiry.status}
                  {inquiry.student_roll_number ? (
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {inquiry.student_roll_number}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                      onClick={() => openEdit(inquiry)}
                      title="Edit inquiry"
                    >
                      <Pencil className="size-4" />
                    </button>
                    {inquiry.status === "applied" ? (
                      <button
                        type="button"
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
                        onClick={() => openAdmit(inquiry)}
                      >
                        <GraduationCap className="size-4" />
                        Admit
                      </button>
                    ) : null}
                    {inquiry.status === "admitted" && inquiry.student_id ? (
                      <Link
                        href={studentsHref}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        View students
                      </Link>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && !listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No inquiries in this stage.
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
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        title={
          modalMode === "quick"
            ? "New Inquiry"
            : modalMode === "detailed"
              ? "Detailed Application"
              : "Edit Inquiry"
        }
        description={
          modalMode === "quick"
            ? "Capture a quick lead with name and contact details."
            : modalMode === "detailed"
              ? "Collect applicant details, then family details for a full application."
              : "Update stage, applicant details, and family information."
        }
        submitLabel={
          modalMode === "detailed"
            ? detailStep === 0
              ? "Next"
              : "Create Application"
            : editing
              ? "Save Changes"
              : "Create Inquiry"
        }
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={submitModal}
        steps={showStepper ? DETAIL_STEPS : undefined}
        currentStep={detailStep}
        onStepChange={(index) => {
          if (index < detailStep) {
            setFormError(null);
            setDetailStep(index);
          }
        }}
        showBack={showStepper && detailStep > 0}
        onBack={() => {
          setFormError(null);
          setDetailStep((step) => Math.max(0, step - 1));
        }}
        contentClassName="sm:max-w-2xl"
      >
        {modalMode === "quick" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Prospective student name" required className="sm:col-span-2">
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
            <FormField label="Email">
              <Input
                type="email"
                placeholder="Optional"
                value={payload.email}
                onChange={(e) => setPayload((p) => ({ ...p, email: e.target.value }))}
              />
            </FormField>
            <FormField label="Interested class">
              <Select
                value={payload.interested_class_level ?? ""}
                onChange={(e) => {
                  const classId = e.target.value ? Number(e.target.value) : null;
                  const className = classes.find((item) => item.id === classId)?.name ?? "";
                  setPayload((p) => ({
                    ...p,
                    interested_class_level: classId,
                    interested_class: className,
                  }));
                }}
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Inquiry source">
              <Input
                placeholder="e.g. Website, walk-in, referral"
                value={payload.source}
                onChange={(e) => setPayload((p) => ({ ...p, source: e.target.value }))}
              />
            </FormField>
          </div>
        ) : null}

        {modalMode === "detailed" ? (
          detailStep === 0 ? (
            renderApplicantFields({ includeStatus: false })
          ) : (
            renderFamilyFields(true)
          )
        ) : null}

        {modalMode === "edit" ? (
          <div className="space-y-8">
            <div>
              <h3 className="mb-3 text-sm font-bold">Applicant details</h3>
              {renderApplicantFields({ includeStatus: true })}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold">Family details</h3>
              {renderFamilyFields(payload.status === "applied")}
            </div>
          </div>
        ) : null}
      </FormModal>

      <FormModal
        open={Boolean(admitTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setAdmitTarget(null);
            setAdmitSuccess(null);
            setAdmitError(null);
          }
        }}
        title={admitSuccess ? "Enrolment complete" : "Admit & Enrol"}
        description={
          admitSuccess
            ? "The inquiry was converted into a student record."
            : "Choose the final section. Family and applicant details will transfer automatically."
        }
        submitLabel={admitSuccess ? "Done" : "Admit & Enrol"}
        loading={admitMutation.isPending}
        error={admitError}
        onSubmit={() => {
          if (admitSuccess) {
            setAdmitTarget(null);
            setAdmitSuccess(null);
            return;
          }
          void submitAdmit();
        }}
        contentClassName="sm:max-w-lg"
      >
        {admitSuccess ? (
          <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            <p>
              <strong>
                {admitSuccess.student.first_name} {admitSuccess.student.last_name}
              </strong>{" "}
              enrolled with roll number <strong>{admitSuccess.student.roll_number}</strong>.
            </p>
            <Link href={studentsHref} className="font-semibold underline underline-offset-2">
              Open students list
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Transferring <strong>{admitTarget?.full_name}</strong>
              {admitTarget?.father_name || admitTarget?.mother_name
                ? ` · Parent: ${admitTarget.father_name || admitTarget.mother_name}`
                : ""}
              {admitTarget?.parent_email ? ` · ${admitTarget.parent_email}` : ""}
            </div>
            <FormField label="Enrol into section" required>
              <Select
                value={admitSection}
                onChange={(e) => setAdmitSection(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Select section</option>
                {(admitSections.length ? admitSections : sections).map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.class_level_name ? `${section.class_level_name} - ` : ""}
                    {section.name}
                    {section.capacity ? ` (cap ${section.capacity})` : ""}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Admission date">
              <Input type="date" value={admitDate} onChange={(e) => setAdmitDate(e.target.value)} />
            </FormField>
          </div>
        )}
      </FormModal>
    </div>
  );
}
