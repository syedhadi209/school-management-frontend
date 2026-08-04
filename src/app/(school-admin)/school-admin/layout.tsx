import { PortalShell } from "@/components/portal-shell";

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="School Admin"
      heading="Dashboard"
      subheading="Welcome back! Here's what's happening at your school today."
      links={[
        { href: "/school-admin", label: "Dashboard", icon: "dashboard" },
        { href: "/school-admin/students", label: "Students", icon: "students" },
        { href: "/school-admin/classes", label: "Classes", icon: "classes" },
        { href: "/school-admin/sections", label: "Sections", icon: "sections" },
        { href: "/school-admin/subjects", label: "Subjects", icon: "subjects" },
        { href: "/school-admin/teachers", label: "Teachers", icon: "teachers" },
        { href: "/school-admin/managers", label: "Managers", icon: "managers" },
        { href: "/school-admin/admissions", label: "Admissions", icon: "admissions" },
        { href: "/school-admin/timetable", label: "Timetable", icon: "timetable" },
        { href: "/school-admin/fees", label: "Fees", icon: "fees" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
