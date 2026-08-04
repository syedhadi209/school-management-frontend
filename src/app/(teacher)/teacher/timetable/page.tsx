"use client";

import { TeacherTimetableView } from "@/components/timetable/teacher-timetable-view";

export default function TeacherTimetablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Timetable</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your weekly schedule and the class that is active right now.
        </p>
      </div>
      <TeacherTimetableView />
    </div>
  );
}
