import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export type Role =
  | "super_admin"
  | "school_admin"
  | "manager"
  | "teacher"
  | "accountant"
  | "front_desk"
  | "parent"
  | "student";

