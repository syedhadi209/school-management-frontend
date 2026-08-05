"use client";

import { ParentResultsView } from "@/components/exams/parent-results-view";

export default function ParentResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Published exam marks for your children.
        </p>
      </div>
      <ParentResultsView />
    </div>
  );
}
