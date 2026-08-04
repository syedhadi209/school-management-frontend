"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { TeacherActiveNowCard } from "@/components/attendance/teacher-active-now";
import {
  TimetableEntry,
  TimetableWeekGrid,
} from "@/components/timetable/week-grid";

type MyScheduleResponse = {
  results: TimetableEntry[];
};

export function TeacherTimetableView() {
  const scheduleQuery = useQuery({
    queryKey: ["/timetable-entries/my-schedule/"],
    queryFn: async () => {
      const { data } = await api.get<MyScheduleResponse>("/timetable-entries/my-schedule/");
      return data;
    },
    refetchInterval: 60_000,
  });

  const entries = scheduleQuery.data?.results ?? [];

  return (
    <div className="space-y-6">
      <TeacherActiveNowCard />

      <div>
        <h2 className="mb-3 text-lg font-semibold">My weekly schedule</h2>
        {scheduleQuery.isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            Loading schedule…
          </div>
        ) : (
          <TimetableWeekGrid
            entries={entries}
            emptyMessage="You have no timetable assignments yet. Ask a manager to assign your lectures."
          />
        )}
      </div>
    </div>
  );
}
