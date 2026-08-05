"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { api } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Panel } from "@/components/dashboard/panel";
import { schoolAdminDashboard } from "@/lib/dashboard-data";

interface DashboardPayload {
  stats: {
    active_students: number;
    pending_admissions: number;
    total_sections: number;
    total_subjects: number;
    total_teachers: number;
    fee_collection_rate: number;
  };
  recent_activity: Array<{
    type: string;
    title: string;
    subtitle: string;
    time?: string;
  }>;
}

const activityIconByType: Record<string, { icon: LucideIcon; tint: string }> = {
  inquiry: { icon: UserCheck, tint: "bg-amber-100 text-amber-600" },
  student: { icon: CheckCircle2, tint: "bg-emerald-100 text-emerald-600" },
  teacher: { icon: Users, tint: "bg-blue-100 text-blue-600" },
  section: { icon: GraduationCap, tint: "bg-purple-100 text-purple-600" },
  timetable: { icon: CalendarClock, tint: "bg-blue-100 text-blue-600" },
};

export default function SchoolAdminDashboardPage() {
  const quickActions = schoolAdminDashboard.quickActions;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["school-admin-dashboard-stats"],
    queryFn: async () => {
      const response = await api.get<DashboardPayload>("/analytics/dashboard/");
      return response.data;
    },
  });

  const stats = data
    ? [
        {
          label: "Active Students",
          value: String(data.stats.active_students),
          icon: Users,
          trend: { value: "live", up: true },
          tint: "bg-blue-100 text-blue-600",
        },
        {
          label: "Pending Admissions",
          value: String(data.stats.pending_admissions),
          icon: GraduationCap,
          trend: { value: "live", up: false },
          tint: "bg-amber-100 text-amber-600",
        },
        {
          label: "Total Subjects",
          value: String(data.stats.total_subjects),
          icon: BookOpen,
          trend: { value: "live", up: true },
          tint: "bg-emerald-100 text-emerald-600",
        },
        {
          label: "Fee Collection",
          value: `${data.stats.fee_collection_rate}%`,
          icon: Wallet,
          trend: { value: "live", up: true },
          tint: "bg-orange-100 text-orange-600",
        },
      ]
    : null;

  // Only use API activity for the active school. Never fall back to mock data.
  const activity =
    data?.recent_activity.map((item) => {
      const visual = activityIconByType[item.type] ?? {
        icon: CheckCircle2,
        tint: "bg-emerald-100 text-emerald-600",
      };
      return {
        icon: visual.icon,
        tint: visual.tint,
        title: item.title,
        subtitle: item.subtitle,
        time: item.time || "",
      };
    }) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(isLoading || !stats
          ? [
              { label: "Active Students", value: "—", icon: Users, tint: "bg-blue-100 text-blue-600" },
              { label: "Pending Admissions", value: "—", icon: GraduationCap, tint: "bg-amber-100 text-amber-600" },
              { label: "Total Subjects", value: "—", icon: BookOpen, tint: "bg-emerald-100 text-emerald-600" },
              { label: "Fee Collection", value: "—", icon: Wallet, tint: "bg-orange-100 text-orange-600" },
            ]
          : stats
        ).map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      {isError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load dashboard data for your school. Refresh to try again.
        </p>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Recent Activity">
          {isLoading ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading activity…</p>
          ) : activity.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No recent activity for this school yet.
            </p>
          ) : (
            <ActivityFeed items={activity} />
          )}
        </Panel>
        <Panel title="Quick Actions">
          <QuickActions items={quickActions} />
        </Panel>
      </div>
    </div>
  );
}
