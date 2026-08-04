"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import { registerSchoolOwner } from "@/lib/auth";
import { AuthSplitShell } from "@/components/auth/auth-split-shell";
import { AuthField, PasswordField } from "@/components/auth/auth-field";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function RegisterPage() {
  const [schoolName, setSchoolName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await registerSchoolOwner({
        school_name: schoolName,
        full_name: fullName,
        email,
        password,
      });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setError("Registration failed. The email may already be in use.");
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitShell
      eyebrow="Get started"
      title="Register your school"
      subtitle="Create your school account and start managing operations in minutes."
      panelTitle="Join 320+ schools already on Edunity"
      panelSubtitle="Set up your school, invite your team, and go live in under two weeks."
      highlights={[
        "Guided onboarding in under two weeks",
        "No credit card required to start",
        "Dedicated implementation support",
        "Role portals for admin, teachers, and parents",
      ]}
      testimonial={{
        quote:
          "The fee and exam workflow is incredibly clear. Parents are happier, and our teachers spend more time teaching.",
        name: "Rizwan Malik",
        role: "School Director, Horizon Academy",
      }}
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <AuthField
          label="School name"
          placeholder="e.g. Bright Future Academy"
          required
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        />
        <AuthField
          label="Your full name"
          placeholder="e.g. Ayesha Farooq"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
          placeholder="Create a password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            <CheckCircle2 className="size-4 shrink-0" />
            Registration successful! Redirecting to login…
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
              Creating account…
            </>
          ) : (
            <>
              Create school account
              <ArrowRight className="ml-1 size-4" />
            </>
          )}
        </button>
      </form>
    </AuthSplitShell>
  );
}
