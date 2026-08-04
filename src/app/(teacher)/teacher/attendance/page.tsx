"use client";

import { TeacherAttendanceView } from "@/components/attendance/teacher-attendance-view";

export default function TeacherAttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Mark your active lecture, then review how today&apos;s classes look at a glance.
          </p>
        </div>
      </div>
      <TeacherAttendanceView />
    </div>
  );
}
