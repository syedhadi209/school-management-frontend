import { PortalShell } from "@/components/portal-shell";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Teacher Portal"
      links={[
        { href: "/teacher", label: "Dashboard" },
        { href: "/teacher/marks", label: "Mark Entry" },
      ]}
    >
      {children}
    </PortalShell>
  );
}

