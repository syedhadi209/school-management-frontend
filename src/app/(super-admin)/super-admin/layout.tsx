import { PortalShell } from "@/components/portal-shell";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Super Admin"
      heading="Platform Overview"
      subheading="All schools, subscriptions, and revenue at a glance."
      links={[
        { href: "/super-admin", label: "Dashboard", icon: "dashboard" },
        { href: "/super-admin/schools", label: "Schools", icon: "schools" },
        { href: "/super-admin/billing", label: "Billing", icon: "billing" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
