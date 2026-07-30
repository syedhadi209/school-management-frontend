"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import { getDefaultRouteForRole, getRoleFromJwt, login } from "@/lib/auth";
import { AuthSplitShell } from "@/components/auth/auth-split-shell";
import { AuthField, PasswordField } from "@/components/auth/auth-field";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await login({ email, password });
      localStorage.setItem("access_token", data.access);
      document.cookie = `access_token=${data.access}; path=/; samesite=lax`;
      const role = getRoleFromJwt(data.access);
      router.push(getDefaultRouteForRole(role));
    } catch {
      setError("Invalid login credentials.");
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitShell
      eyebrow="School OS"
      title="Welcome back"
      subtitle="Sign in to access your school admin, teacher, or parent portal."
      panelTitle="Run your entire school from one platform"
      panelSubtitle="Admissions, academics, fees, and parent communication — unified and effortless."
      highlights={[
        "Role-based portals for every team member",
        "Real-time dashboards and reports",
        "Secure access with JWT authentication",
        "24/7 implementation support",
      ]}
      testimonial={{
        quote:
          "School OS helped us reduce admin workload dramatically. Our office team now finishes tasks in hours instead of days.",
        name: "Ayesha Farooq",
        role: "Principal, Bright Future School",
      }}
      footer={
        <p>
          New here?{" "}
          <Link href="/auth/register" className="font-semibold text-primary hover:text-primary/80">
            Register your school
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <AuthField
          label="Email"
          type="email"
          placeholder="you@school.edu"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            buttonVariants({ size: "lg" }),
            "btn-cta h-11 w-full rounded-xl text-base font-semibold shadow-sm"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-1 size-4" />
            </>
          )}
        </button>
      </form>
    </AuthSplitShell>
  );
}
