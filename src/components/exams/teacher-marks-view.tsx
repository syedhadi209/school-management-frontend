"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { FormModal } from "@/components/data/form-modal";
import { SelectMenu } from "@/components/data/select-menu";
import { MarkEntryPanel } from "@/components/exams/mark-entry-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractApiErrorMessage } from "@/lib/crud";
import {
  createExam,
  examTypeLabel,
  fetchExams,
  fetchMarkSheets,
  fetchMyAssignments,
  publishExam,
  type Exam,
  type MarkSheet,
} from "@/lib/exams";
import { cn } from "@/lib/utils";

type Tab = "class_tests" | "term";

type CreateForm = {
  name: string;
  assignmentKey: string;
  max_marks: string;
  starts_on: string;
};

const emptyCreate: CreateForm = {
  name: "",
  assignmentKey: "",
  max_marks: "100",
  starts_on: "",
};

function statusTint(status: string) {
  if (status === "published") return "bg-emerald-100 text-emerald-700";
  if (status === "submitted") return "bg-blue-100 text-blue-700";
  if (status === "open") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export function TeacherMarksView() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("class_tests");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreate);
  const [createError, setCreateError] = useState("");
  const [entryTarget, setEntryTarget] = useState<{
    examId: number;
    sectionId: number;
    subjectId: number;
    label: string;
  } | null>(null);

  const assignmentsQuery = useQuery({
    queryKey: ["/teacher-assignments/"],
    queryFn: fetchMyAssignments,
  });

  const classTestsQuery = useQuery({
    queryKey: ["/exams/", { exam_type: "class_test" }],
    queryFn: () => fetchExams({ exam_type: "class_test", page_size: 100 }),
  });

  const termExamsQuery = useQuery({
    queryKey: ["/exams/", { term: true }],
    queryFn: async () => {
      const [mid, fin] = await Promise.all([
        fetchExams({ exam_type: "midterm", page_size: 50 }),
        fetchExams({ exam_type: "final", page_size: 50 }),
      ]);
      return [...mid.results, ...fin.results];
    },
  });

  const termSheetsQuery = useQuery({
    queryKey: ["/mark-sheets/", { teacher_term: true }],
    queryFn: () => fetchMarkSheets({ page_size: 200 }),
    enabled: tab === "term",
  });

  const assignments = assignmentsQuery.data?.results ?? [];
  const assignmentOptions = useMemo(
    () =>
      assignments.map((a) => ({
        value: `${a.section}:${a.subject}`,
        label: `${a.section_label || `Section ${a.section}`} · ${a.subject_name || `Subject ${a.subject}`}`,
      })),
    [assignments]
  );

  const createMutation = useMutation({
    mutationFn: createExam,
    onSuccess: async () => {
      toast.success("Class test created.");
      setCreateOpen(false);
      setCreateForm(emptyCreate);
      setCreateError("");
      await queryClient.invalidateQueries({ queryKey: ["/exams/"] });
      await queryClient.invalidateQueries({ queryKey: ["/mark-sheets/"] });
    },
    onError: (error) => {
      setCreateError(extractApiErrorMessage(error, "Could not create class test."));
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishExam,
    onSuccess: async () => {
      toast.success("Class test published. Parents can now see results.");
      await queryClient.invalidateQueries({ queryKey: ["/exams/"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Could not publish."));
    },
  });

  function handleCreate() {
    const name = createForm.name.trim();
    if (!name) {
      setCreateError("Name is required.");
      return;
    }
    if (!createForm.assignmentKey) {
      setCreateError("Choose a section and subject.");
      return;
    }
    const [section, subject] = createForm.assignmentKey.split(":").map(Number);
    const maxMarks = Number(createForm.max_marks);
    if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
      setCreateError("Max marks must be greater than 0.");
      return;
    }
    setCreateError("");
    createMutation.mutate({
      name,
      exam_type: "class_test",
      section,
      subject,
      max_marks: maxMarks,
      starts_on: createForm.starts_on || null,
      ends_on: createForm.starts_on || null,
    });
  }

  function openEntry(exam: Exam, sheet?: MarkSheet) {
    const sectionId = sheet?.section ?? exam.section;
    const subjectId = sheet?.subject ?? exam.subject;
    if (!sectionId || !subjectId) return;
    setEntryTarget({
      examId: exam.id,
      sectionId,
      subjectId,
      label: `${exam.name} · ${sheet?.subject_name || exam.subject_name || ""} · ${
        sheet?.section_label || exam.section_label || ""
      }`,
    });
  }

  const classTests = classTestsQuery.data?.results ?? [];
  const termExams = termExamsQuery.data ?? [];
  const termSheets = (termSheetsQuery.data?.results ?? []).filter(
    (s) => s.exam_type === "midterm" || s.exam_type === "final"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {(
          [
            { id: "class_tests" as const, label: "My class tests" },
            { id: "term" as const, label: "Term exams" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setEntryTarget(null);
            }}
            className={cn(
              "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              tab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
        {tab === "class_tests" ? (
          <Button
            type="button"
            className="ml-auto"
            size="sm"
            onClick={() => {
              setCreateForm({
                ...emptyCreate,
                assignmentKey: assignmentOptions[0]?.value ?? "",
              });
              setCreateError("");
              setCreateOpen(true);
            }}
          >
            <Plus className="size-4" />
            New class test
          </Button>
        ) : null}
      </div>

      {entryTarget ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Enter marks</p>
              <p className="text-xs text-muted-foreground">{entryTarget.label}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setEntryTarget(null)}>
              Back to list
            </Button>
          </div>
          <MarkEntryPanel
            examId={entryTarget.examId}
            sectionId={entryTarget.sectionId}
            subjectId={entryTarget.subjectId}
            onSuccess={() => {
              void queryClient.invalidateQueries({ queryKey: ["/exams/"] });
              void queryClient.invalidateQueries({ queryKey: ["/mark-sheets/"] });
            }}
          />
        </div>
      ) : tab === "class_tests" ? (
        classTestsQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading class tests…
          </div>
        ) : classTests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
            No class tests yet. Create one for a subject you teach.
          </div>
        ) : (
          <ul className="space-y-3">
            {classTests.map((exam) => (
              <li
                key={exam.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{exam.name}</p>
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
                    {exam.subject_name || "Subject"} · {exam.section_label || "Section"} · max{" "}
                    {exam.max_marks}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={exam.status === "published"}
                    onClick={() => openEntry(exam)}
                  >
                    {exam.status === "published" ? "View locked" : "Enter marks"}
                  </Button>
                  {exam.status !== "published" ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={publishMutation.isPending}
                      onClick={() => publishMutation.mutate(exam.id)}
                    >
                      Publish
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : termExamsQuery.isLoading || termSheetsQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading term exams…
        </div>
      ) : termExams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
          No midterms or finals yet. Admins create these school-wide.
        </div>
      ) : (
        <div className="space-y-6">
          {termExams.map((exam) => {
            const sheets = termSheets.filter((s) => s.exam === exam.id);
            return (
              <section key={exam.id} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{exam.name}</h2>
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
                {sheets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Open entry for one of your assigned subjects below.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {sheets.map((sheet) => (
                      <li
                        key={sheet.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {sheet.subject_name} · {sheet.section_label}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{sheet.status}</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={exam.status === "published"}
                          onClick={() => openEntry(exam, sheet)}
                        >
                          {exam.status === "published" ? "Locked" : "Enter marks"}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {exam.status !== "published" && assignments.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {assignments
                      .filter(
                        (a) =>
                          !sheets.some((s) => s.section === a.section && s.subject === a.subject)
                      )
                      .slice(0, 8)
                      .map((a) => (
                        <Button
                          key={a.id}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEntryTarget({
                              examId: exam.id,
                              sectionId: a.section,
                              subjectId: a.subject,
                              label: `${exam.name} · ${a.subject_name} · ${a.section_label}`,
                            })
                          }
                        >
                          Enter · {a.section_label} / {a.subject_name}
                        </Button>
                      ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New class test"
        description="Create a test for a section and subject you teach."
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
              placeholder="e.g. Chapter 3 quiz"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Section & subject</label>
            <SelectMenu
              value={createForm.assignmentKey}
              onValueChange={(value) => setCreateForm((f) => ({ ...f, assignmentKey: value }))}
              options={assignmentOptions}
              placeholder="Choose assignment"
              menuLabel="Your assignments"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={createForm.starts_on}
                onChange={(e) => setCreateForm((f) => ({ ...f, starts_on: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
