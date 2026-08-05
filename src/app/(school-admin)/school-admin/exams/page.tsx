"use client";

import { ExamsManager } from "@/components/exams/exams-manager";

export default function SchoolAdminExamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Exams</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create midterms and finals, track sheet completion, and publish results.
        </p>
      </div>
      <ExamsManager />
    </div>
  );
}
