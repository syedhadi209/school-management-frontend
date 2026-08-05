"use client";

import { TeacherMarksView } from "@/components/exams/teacher-marks-view";

export default function TeacherMarksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mark Entry</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Create class tests for subjects you teach, enter full-roster marks, and publish
          results for parents.
        </p>
      </div>
      <TeacherMarksView />
    </div>
  );
}
