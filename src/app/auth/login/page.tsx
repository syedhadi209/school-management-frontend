"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { login } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const data = await login({ email, password });
      localStorage.setItem("access_token", data.access);
      document.cookie = `access_token=${data.access}; path=/; samesite=lax`;
      router.push("/school-admin");
    } catch {
      setError("Invalid login credentials.");
    }
  }

  return (
    <div className="mx-auto my-16 w-full max-w-md rounded-lg border p-6">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded bg-primary py-2 text-primary-foreground" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

