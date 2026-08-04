import { PortalShell } from "@/components/portal-shell";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Teacher"
      heading="Dashboard"
      subheading="Your classes, students, and pending tasks."
      links={[
        { href: "/teacher", label: "Dashboard", icon: "dashboard" },
        { href: "/teacher/students", label: "My Students", icon: "students" },
        { href: "/teacher/timetable", label: "Timetable", icon: "timetable" },
        { href: "/teacher/marks", label: "Mark Entry", icon: "marks" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
