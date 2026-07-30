"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Users, Wallet } from "lucide-react";

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
  }>;
}

export default function SchoolAdminDashboardPage() {
  const quickActions = schoolAdminDashboard.quickActions;
  const { data, isLoading } = useQuery({
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
    : schoolAdminDashboard.stats;

  const activity = data?.recent_activity?.length
    ? data.recent_activity.map((item) => ({
        ...schoolAdminDashboard.activity[0],
        title: item.title,
        subtitle: item.subtitle,
      }))
    : schoolAdminDashboard.activity;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(isLoading ? schoolAdminDashboard.stats : stats).map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recent Activity">
          <ActivityFeed items={isLoading ? schoolAdminDashboard.activity : activity} />
        </Panel>
        <Panel title="Quick Actions">
          <QuickActions items={quickActions} />
        </Panel>
      </div>
    </div>
  );
}
