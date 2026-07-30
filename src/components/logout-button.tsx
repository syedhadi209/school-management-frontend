"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
    } catch {
      // Ignore API failures and still clear client-side session.
    } finally {
      localStorage.removeItem("access_token");
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
      router.push("/auth/login");
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}

