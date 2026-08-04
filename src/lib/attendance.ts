import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/crud";

export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export const ATTENDANCE_STATUSES: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "Leave" },
];

export const attendanceStatusTint: Record<AttendanceStatus, string> = {
  present: "bg-emerald-100 text-emerald-800 border-emerald-200",
  absent: "bg-red-100 text-red-800 border-red-200",
  late: "bg-amber-100 text-amber-900 border-amber-200",
  leave: "bg-slate-100 text-slate-800 border-slate-200",
};

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  leave: number;
  total?: number;
  total_records?: number;
  sessions_count?: number;
  attendance_rate?: number;
};

export type AttendanceDraftRecord = {
  student: number;
  student_name: string;
  roll_number: string;
  status: AttendanceStatus;
  remarks: string;
  marked_at?: string | null;
};

export type AttendanceForEntry = {
  session_id: number | null;
  status: "draft" | "submitted";
  date: string;
  timetable_entry: number;
  section: number;
  teacher: number | null;
  subject: number | null;
  notes: string;
  records: AttendanceDraftRecord[];
  summary: AttendanceSummary;
};

export type AttendanceRecordRow = {
  id: number;
  student: number;
  student_name: string;
  roll_number: string;
  status: AttendanceStatus;
  remarks: string;
  marked_at: string;
  session_date?: string;
  section_label?: string;
  subject_name?: string;
  start_time?: string;
  end_time?: string;
};

export type AttendanceSession = {
  id: number;
  timetable_entry: number | null;
  section: number;
  section_label: string;
  teacher: number;
  teacher_name: string;
  subject: number | null;
  subject_name: string;
  date: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  status: "draft" | "submitted";
  taken_by_name: string;
  taken_at: string | null;
  notes: string;
  summary: AttendanceSummary;
  records?: AttendanceRecordRow[];
};

export type TakeAttendancePayload = {
  timetable_entry: number;
  date: string;
  notes?: string;
  records: Array<{ student: number; status: AttendanceStatus; remarks?: string }>;
};

export function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatClock(value?: string) {
  if (!value) return "";
  return value.slice(0, 5);
}

export async function fetchAttendanceForEntry(timetableEntryId: number, date?: string) {
  const params = new URLSearchParams({ timetable_entry: String(timetableEntryId) });
  if (date) params.set("date", date);
  const { data } = await api.get<AttendanceForEntry>(
    `/attendance-sessions/for-entry/?${params.toString()}`
  );
  return data;
}

export async function takeAttendance(payload: TakeAttendancePayload) {
  const { data } = await api.post<AttendanceSession>("/attendance-sessions/take/", payload);
  return data;
}

export async function fetchAttendanceSessions(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  const { data } = await api.get<PaginatedResponse<AttendanceSession>>(
    `/attendance-sessions/?${query.toString()}`
  );
  return data;
}

export async function fetchAttendanceSession(id: number) {
  const { data } = await api.get<AttendanceSession>(`/attendance-sessions/${id}/`);
  return data;
}

export async function fetchAttendanceSummary(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  const { data } = await api.get<AttendanceSummary>(`/attendance-sessions/summary/?${query.toString()}`);
  return data;
}

export async function fetchAttendanceRecords(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  const { data } = await api.get<PaginatedResponse<AttendanceRecordRow>>(
    `/attendance-records/?${query.toString()}`
  );
  return data;
}
