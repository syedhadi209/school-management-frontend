"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, UserCheck, Users } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Panel } from "@/components/dashboard/panel";
import { teacherDashboard } from "@/lib/dashboard-data";
import { api } from "@/lib/api";

const { activity, quickActions } = teacherDashboard;

type TeacherDashboardStats = {
  assigned_sections: number;
  students: number;
  subjects: number;
  incharge_sections: number;
};

export default function TeacherDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: async () => {
      const { data } = await api.get<TeacherDashboardStats>("/accounts/teacher-dashboard/");
      return data;
    },
  });

  const data = statsQuery.data;
  const stats = [
    {
      label: "My Sections",
      value: data ? String(data.assigned_sections) : "—",
      icon: GraduationCap,
      tint: "bg-blue-100 text-blue-600",
    },
    {
      label: "My Students",
      value: data ? String(data.students) : "—",
      icon: Users,
      tint: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "My Subjects",
      value: data ? String(data.subjects) : "—",
      icon: BookOpen,
      tint: "bg-amber-100 text-amber-600",
    },
    {
      label: "Class Incharge",
      value: data ? String(data.incharge_sections) : "—",
      icon: UserCheck,
      tint: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {statsQuery.isError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load your dashboard totals. Refresh the page to try again.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recent Activity">
          <ActivityFeed items={activity} />
        </Panel>
        <Panel title="Quick Actions">
          <QuickActions items={quickActions} />
        </Panel>
      </div>
    </div>
  );
}
