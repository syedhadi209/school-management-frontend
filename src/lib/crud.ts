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

const FIELD_LABELS: Record<string, string> = {
  non_field_errors: "",
  class_level: "Class",
  class_teacher: "Class teacher",
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

  function useCreate(options?: { successMessage?: string }) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (payload: TInput) => {
        const { data } = await api.post<TItem>(normalizedPath, payload);
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
        const { data } = await api.patch<TItem>(`${normalizedPath}${id}/`, payload);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [normalizedPath] });
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
    useCreate,
    useUpdate,
    useDelete,
  };
}
