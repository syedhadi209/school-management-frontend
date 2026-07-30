import { PortalShell } from "@/components/portal-shell";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Parent"
      heading="Dashboard"
      subheading="Stay connected with your children's school life."
      links={[
        { href: "/parent", label: "Dashboard", icon: "dashboard" },
        { href: "/parent/invoices", label: "Invoices", icon: "invoices" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
