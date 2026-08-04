"use client";

import { ParentAttendanceView } from "@/components/attendance/parent-attendance-view";

export default function ParentAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View attendance history for your linked children.
        </p>
      </div>
      <ParentAttendanceView />
    </div>
  );
}
