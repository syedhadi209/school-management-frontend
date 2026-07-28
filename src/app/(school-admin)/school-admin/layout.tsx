import { PortalShell } from "@/components/portal-shell";

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="School Admin"
      links={[
        { href: "/school-admin", label: "Dashboard" },
        { href: "/school-admin/students", label: "Students" },
        { href: "/school-admin/fees", label: "Fees" },
      ]}
    >
      {children}
    </PortalShell>
  );
}

