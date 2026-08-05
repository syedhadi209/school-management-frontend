import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Panel } from "@/components/dashboard/panel";
import { superAdminDashboard } from "@/lib/dashboard-data";

const { stats, activity, quickActions } = superAdminDashboard;

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
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
