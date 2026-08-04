"use client";

import { AttendanceSessionsManager } from "@/components/attendance/attendance-sessions-manager";

export default function SchoolAdminAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submitted attendance sessions by date and section.
        </p>
      </div>
      <AttendanceSessionsManager />
    </div>
  );
}
