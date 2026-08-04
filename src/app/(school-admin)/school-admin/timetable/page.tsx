"use client";

import { TimetableManager } from "@/components/timetable/timetable-manager";

export default function SchoolAdminTimetablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Timetable</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage weekly lecture and break schedules for every section.
        </p>
      </div>
      <TimetableManager />
    </div>
  );
}
