import { PortalShell } from "@/components/portal-shell";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Manager"
      heading="Dashboard"
      subheading="Academic planning and operations at a glance."
      links={[
        { href: "/manager", label: "Dashboard", icon: "dashboard" },
        { href: "/manager/students", label: "Students", icon: "students" },
        { href: "/manager/classes", label: "Classes", icon: "classes" },
        { href: "/manager/admissions", label: "Admissions", icon: "admissions" },
        { href: "/manager/timetable", label: "Timetable", icon: "timetable" },
        { href: "/manager/promotions", label: "Promotions", icon: "promotions" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
