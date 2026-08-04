"use client";

import { ParentTimetableView } from "@/components/timetable/parent-timetable-view";

export default function ParentTimetablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Children&apos;s Timetable</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View the weekly schedule for each of your children.
        </p>
      </div>
      <ParentTimetableView />
    </div>
  );
}
