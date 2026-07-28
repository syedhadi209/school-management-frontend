import { PortalShell } from "@/components/portal-shell";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Manager Portal"
      links={[
        { href: "/manager", label: "Dashboard" },
        { href: "/manager/timetable", label: "Timetable" },
        { href: "/manager/promotions", label: "Promotions" },
      ]}
    >
      {children}
    </PortalShell>
  );
}

