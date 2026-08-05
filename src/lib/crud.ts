"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { api } from "@/lib/api";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListParams {
  page?: number;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

function buildQueryParams(params: ListParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  return query.toString();
}

function isBinaryValue(value: unknown): value is Blob {
  if (typeof Blob === "undefined") return false;
  return value instanceof Blob;
}

function payloadHasFile(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  if (isBinaryValue(payload)) return true;
  if (Array.isArray(payload)) return payload.some((item) => payloadHasFile(item));
  return Object.values(payload).some((value) => payloadHasFile(value));
}

function appendToFormData(formData: FormData, key: string, value: unknown) {
  if (value === undefined) return;
  if (value === null) {
    formData.append(key, "");
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => appendToFormData(formData, key, item));
    return;
  }
  if (isBinaryValue(value)) {
    formData.append(key, value);
    return;
  }
  if (typeof value === "boolean") {
    formData.append(key, value ? "true" : "false");
    return;
  }
  formData.append(key, String(value));
}

function toRequestBody(payload: unknown): unknown {
  if (!payloadHasFile(payload) || !payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }
  const formData = new FormData();
  Object.entries(payload as Record<string, unknown>).forEach(([key, value]) =>
    appendToFormData(formData, key, value)
  );
  return formData;
}

const FIELD_LABELS: Record<string, string> = {
  non_field_errors: "",
  school_name: "School name",
  full_name: "Full name",
  class_level: "Class",
  class_teacher: "Class incharge",
  teachers: "Assigned teachers",
  academic_year: "Academic year",
  fee_structure: "Fee structure",
  date_of_birth: "Date of birth",
  board_roll_number: "Board roll number",
  father_name: "Father's name",
  mother_name: "Mother's name",
  father_cnic: "Father's CNIC",
  mother_cnic: "Mother's CNIC",
  parent_email: "Parent email",
  parent_phone: "Parent phone",
  guardian_phone: "Parent phone",
  parent_alternate_phone: "Alternate phone",
  parent_occupation: "Parent occupation",
  interested_class_level: "Interested class",
  preferred_section: "Preferred section",
  rejection_reason: "Rejection reason",
  monthly_salary: "Monthly salary",
  phone_number: "Phone number",
  cnic: "CNIC",
  subjects_taught: "Subjects taught",
  designation: "Designation",
  shift_start_time: "Shift start time",
  shift_end_time: "Shift end time",
  profile_image: "Profile image",
  day_of_week: "Day",
  start_time: "Start time",
  end_time: "End time",
  slot_type: "Slot type",
  section_ids: "Sections",
  class_level_ids: "Classes",
};

function humanizeField(field: string) {
  if (field in FIELD_LABELS) return FIELD_LABELS[field];
  return field.replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase());
}

/**
 * Returns the field names present in a DRF validation error body.
 * Useful for routing the user to the form step that owns the failing field.
 */
export function extractApiErrorFields(error: unknown): string[] {
  const axiosError = error as AxiosError<unknown>;
  const data = axiosError.response?.data;
  if (!data || typeof data !== "object") return [];
  const body = data as Record<string, unknown>;
  return Object.keys(body).filter((key) => key !== "detail" && key !== "non_field_errors");
}

/**
 * Flattens DRF error bodies, which may be `{detail: "..."}`, `{field: ["..."]}`,
 * or `{non_field_errors: ["..."]}`, into one readable sentence.
 */
export function extractApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<unknown>;
  const data = axiosError.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;
    if (typeof body.detail === "string") return body.detail;

    const messages = Object.entries(body).flatMap(([field, value]) => {
      const parts = Array.isArray(value) ? value : [value];
      const label = humanizeField(field);
      return parts
        .filter((part): part is string => typeof part === "string")
        .map((part) => (label ? `${label}: ${part}` : part));
    });

    if (messages.length) return messages.join(" ");
  }

  if (axiosError.message === "Network Error") {
    return "Cannot reach the server. Make sure the backend is running.";
  }

  return fallback;
}

const extractErrorMessage = extractApiErrorMessage;

export function createCrudHooks<TItem, TInput extends Record<string, unknown>>(resource: string) {
  const path = resource.startsWith("/") ? resource : `/${resource}/`;
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;

  function useList(params: ListParams = {}, options?: { enabled?: boolean }) {
    return useQuery({
      queryKey: [normalizedPath, params],
      queryFn: async () => {
        const queryString = buildQueryParams(params);
        const { data } = await api.get<PaginatedResponse<TItem>>(
          queryString ? `${normalizedPath}?${queryString}` : normalizedPath
        );
        return data;
      },
      enabled: options?.enabled ?? true,
    });
  }

  function useDetail(id: number | string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
      queryKey: [normalizedPath, id],
      queryFn: async () => {
        const { data } = await api.get<TItem>(`${normalizedPath}${id}/`);
        return data;
      },
      enabled: (options?.enabled ?? true) && id !== null && id !== undefined && id !== "",
    });
  }

  function useCreate(options?: { successMessage?: string }) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (payload: TInput) => {
        const { data } = await api.post<TItem>(normalizedPath, toRequestBody(payload));
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [normalizedPath] });
        toast.success(options?.successMessage ?? "Created successfully.");
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, "Failed to create item."));
      },
    });
  }

  function useUpdate(options?: { successMessage?: string }) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, payload }: { id: number | string; payload: Partial<TInput> }) => {
        const { data } = await api.patch<TItem>(`${normalizedPath}${id}/`, toRequestBody(payload));
        return data;
      },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [normalizedPath] });
        queryClient.invalidateQueries({ queryKey: [normalizedPath, variables.id] });
        toast.success(options?.successMessage ?? "Updated successfully.");
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, "Failed to update item."));
      },
    });
  }

  function useDelete(options?: { successMessage?: string }) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: number | string) => {
        await api.delete(`${normalizedPath}${id}/`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [normalizedPath] });
        toast.success(options?.successMessage ?? "Deleted successfully.");
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, "Failed to delete item."));
      },
    });
  }

  return {
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  };
}
