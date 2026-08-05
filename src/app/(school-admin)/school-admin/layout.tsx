import { PortalShell } from "@/components/portal-shell";

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="School Admin"
      heading="Dashboard"
      subheading="Welcome back! Here's what's happening at your school today."
      sections={[
        {
          items: [
            { href: "/school-admin", label: "Dashboard", icon: "dashboard" },
            { href: "/school-admin/students", label: "Students", icon: "students" },
            { href: "/school-admin/classes", label: "Classes", icon: "classes" },
            { href: "/school-admin/sections", label: "Sections", icon: "sections" },
            { href: "/school-admin/subjects", label: "Subjects", icon: "subjects" },
          ],
        },
        {
          label: "Faculty & Staff",
          icon: "faculty",
          items: [
            { href: "/school-admin/teachers", label: "Teachers", icon: "teachers" },
            { href: "/school-admin/managers", label: "Managers", icon: "managers" },
          ],
        },
        {
          items: [
            { href: "/school-admin/admissions", label: "Admissions", icon: "admissions" },
            { href: "/school-admin/timetable", label: "Timetable", icon: "timetable" },
            { href: "/school-admin/attendance", label: "Attendance", icon: "attendance" },
            { href: "/school-admin/exams", label: "Exams", icon: "marks" },
          ],
        },
        {
          label: "Finance",
          icon: "finance",
          items: [
            { href: "/school-admin/funds", label: "Funds", icon: "funds" },
            { href: "/school-admin/fees", label: "Fees", icon: "fees" },
          ],
        },
      ]}
    >
      {children}
    </PortalShell>
  );
}
