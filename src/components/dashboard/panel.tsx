import type { ReactNode } from "react";

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="font-bold">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}
