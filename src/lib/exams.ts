import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/crud";

export type ExamType = "class_test" | "midterm" | "final";
export type ExamStatus = "draft" | "open" | "published";
export type MarkSheetStatus = "draft" | "submitted";

export type ExamCompletion = {
  sheets_total: number;
  sheets_submitted: number;
  sheets_draft: number;
};

export type Exam = {
  id: number;
  name: string;
  exam_type: ExamType;
  status: ExamStatus;
  section: number | null;
  section_label?: string;
  subject: number | null;
  subject_name?: string;
  max_marks: string | number;
  starts_on: string | null;
  ends_on: string | null;
  created_by_name?: string;
  published_at: string | null;
  completion?: ExamCompletion;
};

export type MarkSheet = {
  id: number;
  exam: number;
  exam_name: string;
  exam_type: ExamType;
  exam_status: ExamStatus;
  section: number;
  section_label: string;
  subject: number;
  subject_name: string;
  teacher_name?: string;
  status: MarkSheetStatus;
  max_marks: string | number;
  notes: string;
  submitted_at: string | null;
  summary?: {
    count: number;
    average: number | null;
    average_percentage: number | null;
  };
};

export type MarkDraftRecord = {
  student: number;
  student_name: string;
  roll_number: string;
  marks_obtained: number | null;
  remarks: string;
};

export type MarkForEntry = {
  sheet_id: number;
  exam: number;
  exam_name: string;
  exam_type: ExamType;
  exam_status: ExamStatus;
  section: number;
  section_label: string;
  subject: number;
  subject_name: string;
  status: MarkSheetStatus;
  max_marks: number;
  notes: string;
  records: MarkDraftRecord[];
};

export type MarkRow = {
  id: number;
  exam: number;
  exam_name: string;
  exam_type: ExamType;
  exam_status: ExamStatus;
  student: number;
  student_name: string;
  subject: number;
  subject_name: string;
  marks_obtained: string | number;
  max_marks: string | number;
  remarks: string;
  percentage: number | null;
  marked_at: string;
};

export type TeacherAssignment = {
  id: number;
  teacher: number;
  subject: number;
  subject_name?: string;
  section: number;
  section_label?: string;
  class_level_name?: string;
  academic_year: number;
};

export const examTypeLabel: Record<ExamType, string> = {
  class_test: "Class test",
  midterm: "Midterm",
  final: "Final",
};

export async function fetchExams(params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  const { data } = await api.get<PaginatedResponse<Exam>>(`/exams/?${query.toString()}`);
  return data;
}

export async function createExam(payload: Record<string, unknown>) {
  const { data } = await api.post<Exam>("/exams/", payload);
  return data;
}

export async function publishExam(id: number) {
  const { data } = await api.post<Exam>(`/exams/${id}/publish/`);
  return data;
}

export async function unpublishExam(id: number) {
  const { data } = await api.post<Exam>(`/exams/${id}/unpublish/`);
  return data;
}

export async function fetchMarkSheets(params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  const { data } = await api.get<PaginatedResponse<MarkSheet>>(`/mark-sheets/?${query.toString()}`);
  return data;
}

export async function fetchMarkForEntry(exam: number, section: number, subject: number) {
  const params = new URLSearchParams({
    exam: String(exam),
    section: String(section),
    subject: String(subject),
  });
  const { data } = await api.get<MarkForEntry>(`/mark-sheets/for-entry/?${params.toString()}`);
  return data;
}

export async function enterMarks(payload: {
  exam: number;
  section: number;
  subject: number;
  max_marks?: number;
  notes?: string;
  records: Array<{ student: number; marks_obtained: number; remarks?: string }>;
}) {
  const { data } = await api.post<MarkSheet>("/mark-sheets/enter/", payload);
  return data;
}

export async function fetchMarks(params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  const { data } = await api.get<PaginatedResponse<MarkRow>>(`/marks/?${query.toString()}`);
  return data;
}

export async function fetchMyAssignments() {
  const { data } = await api.get<PaginatedResponse<TeacherAssignment>>(
    "/teacher-assignments/?page_size=200"
  );
  return data;
}
