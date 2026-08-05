"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { logout } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Session = { email: string; role: string | null };

function decodeAccessToken(): Session | null {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { email?: string; role?: string | null };
    return { email: payload.email ?? "", role: payload.role ?? null };
  } catch {
    return null;
  }
}

function initialsFor(email: string) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : local.slice(0, 2);
  return (letters || "U").toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSession(decodeAccessToken());
  }, []);

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

  const email = session?.email ?? "";
  const roleLabel = session?.role ? session.role.replaceAll("_", " ") : "Signed in";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {email ? initialsFor(email) : "…"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <div className="px-1.5 py-1.5">
          <p className="truncate text-sm font-semibold">{email || "Account"}</p>
          <p className="text-xs capitalize text-muted-foreground">{roleLabel}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={loading} onClick={handleLogout}>
          <LogOut />
          {loading ? "Logging out…" : "Log Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
