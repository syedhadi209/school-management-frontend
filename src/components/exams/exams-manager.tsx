"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { FormModal } from "@/components/data/form-modal";
import { SelectMenu } from "@/components/data/select-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractApiErrorMessage } from "@/lib/crud";
import {
  createExam,
  examTypeLabel,
  fetchExams,
  fetchMarkSheets,
  publishExam,
  unpublishExam,
  type ExamType,
} from "@/lib/exams";
import { cn } from "@/lib/utils";

type CreateForm = {
  name: string;
  exam_type: ExamType;
  max_marks: string;
  starts_on: string;
  ends_on: string;
};

const emptyCreate: CreateForm = {
  name: "",
  exam_type: "midterm",
  max_marks: "100",
  starts_on: "",
  ends_on: "",
};

function statusTint(status: string) {
  if (status === "published") return "bg-emerald-100 text-emerald-700";
  if (status === "submitted") return "bg-blue-100 text-blue-700";
  if (status === "open") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export function ExamsManager() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreate);
  const [createError, setCreateError] = useState("");
  const [expandedExamId, setExpandedExamId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState("");

  const examsQuery = useQuery({
    queryKey: ["/exams/", { admin: true, typeFilter }],
    queryFn: () =>
      fetchExams({
        page_size: 100,
        exam_type: typeFilter || undefined,
      }),
  });

  const sheetsQuery = useQuery({
    queryKey: ["/mark-sheets/", { exam: expandedExamId }],
    queryFn: () =>
      fetchMarkSheets({
        exam: expandedExamId ?? undefined,
        page_size: 200,
      }),
    enabled: expandedExamId !== null,
  });

  const createMutation = useMutation({
    mutationFn: createExam,
    onSuccess: async () => {
      toast.success("Exam created.");
      setCreateOpen(false);
      setCreateForm(emptyCreate);
      setCreateError("");
      await queryClient.invalidateQueries({ queryKey: ["/exams/"] });
    },
    onError: (error) => {
      setCreateError(extractApiErrorMessage(error, "Could not create exam."));
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishExam,
    onSuccess: async () => {
      toast.success("Exam published.");
      await queryClient.invalidateQueries({ queryKey: ["/exams/"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Could not publish."));
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: unpublishExam,
    onSuccess: async () => {
      toast.success("Exam unpublished. Teachers can edit again.");
      await queryClient.invalidateQueries({ queryKey: ["/exams/"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Could not unpublish."));
    },
  });

  const exams = useMemo(() => {
    const list = examsQuery.data?.results ?? [];
    return list.filter((e) => e.exam_type === "midterm" || e.exam_type === "final" || e.exam_type === "class_test");
  }, [examsQuery.data]);

  function handleCreate() {
    const name = createForm.name.trim();
    if (!name) {
      setCreateError("Name is required.");
      return;
    }
    if (createForm.exam_type === "class_test") {
      setCreateError("Use the teacher portal to create class tests.");
      return;
    }
    const maxMarks = Number(createForm.max_marks);
    if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
      setCreateError("Max marks must be greater than 0.");
      return;
    }
    setCreateError("");
    createMutation.mutate({
      name,
      exam_type: createForm.exam_type,
      max_marks: maxMarks,
      starts_on: createForm.starts_on || null,
      ends_on: createForm.ends_on || createForm.starts_on || null,
    });
  }

  const sheets = sheetsQuery.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-xs space-y-2">
          <label className="text-sm font-medium">Filter by type</label>
          <SelectMenu
            value={typeFilter}
            onValueChange={setTypeFilter}
            options={[
              { value: "", label: "All exams" },
              { value: "midterm", label: "Midterms" },
              { value: "final", label: "Finals" },
              { value: "class_test", label: "Class tests" },
            ]}
            placeholder="All exams"
            menuLabel="Exam type"
          />
        </div>
        <Button
          type="button"
          onClick={() => {
            setCreateForm(emptyCreate);
            setCreateError("");
            setCreateOpen(true);
          }}
        >
          <Plus className="size-4" />
          New midterm / final
        </Button>
      </div>

      {examsQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading exams…
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
          No exams yet. Create a midterm or final to get started.
        </div>
      ) : (
        <ul className="space-y-3">
          {exams.map((exam) => {
            const expanded = expandedExamId === exam.id;
            const completion = exam.completion;
            return (
              <li key={exam.id} className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{exam.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {examTypeLabel[exam.exam_type]}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          statusTint(exam.status)
                        )}
                      >
                        {exam.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {exam.exam_type === "class_test"
                        ? `${exam.subject_name || "Subject"} · ${exam.section_label || "Section"}`
                        : `Max ${exam.max_marks}`}
                      {completion
                        ? ` · ${completion.sheets_submitted}/${completion.sheets_total} sheets submitted`
                        : ""}
                      {completion && completion.sheets_draft > 0
                        ? ` · ${completion.sheets_draft} draft`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedExamId(expanded ? null : exam.id)}
                    >
                      {expanded ? "Hide sheets" : "Sheet status"}
                    </Button>
                    {exam.status === "published" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={unpublishMutation.isPending}
                        onClick={() => unpublishMutation.mutate(exam.id)}
                      >
                        Unpublish
                      </Button>
                    ) : exam.exam_type !== "class_test" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={publishMutation.isPending}
                        onClick={() => publishMutation.mutate(exam.id)}
                      >
                        Publish
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled={publishMutation.isPending}
                        onClick={() => publishMutation.mutate(exam.id)}
                      >
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
                {expanded ? (
                  <div className="border-t border-border bg-muted/20 px-4 py-3">
                    {sheetsQuery.isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading sheets…</p>
                    ) : sheets.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No mark sheets yet. Teachers create sheets when they enter marks.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {sheets.map((sheet) => (
                          <li
                            key={sheet.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm"
                          >
                            <span>
                              {sheet.subject_name} · {sheet.section_label}
                              {sheet.teacher_name ? ` · ${sheet.teacher_name}` : ""}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                                statusTint(sheet.status)
                              )}
                            >
                              {sheet.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New term exam"
        description="Create a school-wide midterm or final. Teachers enter marks per section and subject."
        submitLabel="Create"
        loading={createMutation.isPending}
        error={createError}
        onSubmit={handleCreate}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Midterm 2026"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <SelectMenu
              value={createForm.exam_type}
              onValueChange={(value) =>
                setCreateForm((f) => ({ ...f, exam_type: value as ExamType }))
              }
              options={[
                { value: "midterm", label: "Midterm" },
                { value: "final", label: "Final" },
              ]}
              menuLabel="Exam type"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max marks</label>
              <Input
                type="number"
                min={1}
                value={createForm.max_marks}
                onChange={(e) => setCreateForm((f) => ({ ...f, max_marks: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Starts</label>
              <Input
                type="date"
                value={createForm.starts_on}
                onChange={(e) => setCreateForm((f) => ({ ...f, starts_on: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ends</label>
              <Input
                type="date"
                value={createForm.ends_on}
                onChange={(e) => setCreateForm((f) => ({ ...f, ends_on: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
