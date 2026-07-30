import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let queuedRequests: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  queuedRequests.forEach((resolve) => resolve(token));
  queuedRequests = [];
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = String(originalRequest?.url ?? "").includes("/auth/refresh/");

    if (!isUnauthorized || !originalRequest || originalRequest._retried || isRefreshRequest) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queuedRequests.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    try {
      isRefreshing = true;
      const refreshResponse = await api.post("/auth/refresh/", {});
      const newAccessToken = refreshResponse.data?.access as string | undefined;
      if (!newAccessToken) {
        throw new Error("No access token returned by refresh.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", newAccessToken);
        document.cookie = `access_token=${newAccessToken}; path=/; samesite=lax`;
      }
      flushQueue(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
        window.location.href = "/auth/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export type Role =
  | "super_admin"
  | "school_admin"
  | "manager"
  | "teacher"
  | "accountant"
  | "front_desk"
  | "parent"
  | "student";

