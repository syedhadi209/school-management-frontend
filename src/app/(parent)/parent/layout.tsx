import { PortalShell } from "@/components/portal-shell";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Parent Portal"
      links={[
        { href: "/parent", label: "Dashboard" },
        { href: "/parent/invoices", label: "Invoices" },
      ]}
    >
      {children}
    </PortalShell>
  );
}

