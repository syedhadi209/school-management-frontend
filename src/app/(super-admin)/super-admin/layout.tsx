import { PortalShell } from "@/components/portal-shell";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Super Admin Portal"
      links={[
        { href: "/super-admin", label: "Dashboard" },
        { href: "/super-admin/schools", label: "Schools" },
        { href: "/super-admin/billing", label: "Billing" },
      ]}
    >
      {children}
    </PortalShell>
  );
}

