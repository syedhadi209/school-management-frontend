import { api, Role } from "@/lib/api";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  school_name: string;
  full_name: string;
  email: string;
  password: string;
};

type TokenResponse = { access: string; refresh: string };

export async function registerSchoolOwner(payload: RegisterPayload) {
  const { data } = await api.post("/auth/register/", payload);
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<TokenResponse>("/auth/login/", payload);
  return data;
}

export async function refresh(refresh?: string) {
  const { data } = await api.post<TokenResponse>("/auth/refresh/", refresh ? { refresh } : {});
  return data;
}

export async function logout() {
  await api.post("/auth/logout/");
}

export function getRoleFromJwt(token: string): Role | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { role?: Role };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function getDefaultRouteForRole(role: Role | null): string {
  if (role === "super_admin") return "/super-admin";
  if (role === "manager") return "/manager";
  if (role === "teacher") return "/teacher";
  if (role === "parent") return "/parent";
  return "/school-admin";
}

