"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { registerSchoolOwner } from "@/lib/auth";

export default function RegisterPage() {
  const [schoolName, setSchoolName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await registerSchoolOwner({
      school_name: schoolName,
      full_name: fullName,
      email,
      password,
    });
    setMessage("Registration successful. You can now log in.");
    router.push("/auth/login");
  }

  return (
    <div className="mx-auto my-16 w-full max-w-lg rounded-lg border p-6">
      <h1 className="text-xl font-semibold">Register your school</h1>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <input
          className="rounded border px-3 py-2"
          placeholder="School name"
          value={schoolName}
          onChange={(event) => setSchoolName(event.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Owner full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        <button className="rounded bg-primary py-2 text-primary-foreground" type="submit">
          Create school account
        </button>
      </form>
    </div>
  );
}

