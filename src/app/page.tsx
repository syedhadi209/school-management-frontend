import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="w-full max-w-2xl rounded-lg border bg-card p-8 text-center">
        <h1 className="text-3xl font-semibold">School Management SaaS</h1>
        <p className="mt-3 text-muted-foreground">
          Multi-tenant school platform with role-based portals and secure tenant-scoped APIs.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link className="rounded-md bg-primary px-4 py-2 text-primary-foreground" href="/auth/login">
            Login
          </Link>
          <Link className="rounded-md border px-4 py-2" href="/auth/register">
            Register School
          </Link>
        </div>
      </main>
    </div>
  );
}
