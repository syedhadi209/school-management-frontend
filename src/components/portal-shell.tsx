"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
  Bell,
  Building2,
  CalendarClock,
  CreditCard,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Menu,
  School,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const iconRegistry: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  students: Users,
  fees: CreditCard,
  marks: FileText,
  timetable: CalendarClock,
  promotions: TrendingUp,
  invoices: CreditCard,
  schools: School,
  billing: CreditCard,
  academics: GraduationCap,
  classes: GraduationCap,
  sections: Layers,
  subjects: FileText,
  teachers: Users,
  admissions: TrendingUp,
};

export interface NavLink {
  href: string;
  label: string;
  icon: string;
}

interface PortalShellProps {
  title: string;
  heading?: string;
  subheading?: string;
  links: NavLink[];
  children: ReactNode;
}

function SidebarNav({
  title,
  links,
  pathname,
  onNavigate,
}: {
  title: string;
  links: NavLink[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </div>
          <div>
            <p className="text-sm font-extrabold leading-none">School OS</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{title}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const Icon = iconRegistry[link.icon] ?? LayoutDashboard;
          const isActive =
            link.href === pathname ||
            (pathname.startsWith(link.href) && link.href !== links[0]?.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-[18px]" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <LogoutButton />
      </div>
    </div>
  );
}

export function PortalShell({
  title,
  heading,
  subheading,
  links,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <SidebarNav title={title} links={links} pathname={pathname} />
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur-md sm:px-6">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              className="inline-flex items-center rounded-xl border p-2 text-muted-foreground lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarNav
                title={title}
                links={links}
                pathname={pathname}
                onNavigate={() => setDrawerOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">
              {heading ?? title}
            </h1>
            {subheading && (
              <p className="text-xs text-muted-foreground">{subheading}</p>
            )}
          </div>

          <div className="hidden items-center gap-1 rounded-xl border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground sm:flex">
            <Search className="size-3.5" />
            <span className="ml-1">Search…</span>
          </div>

          <button
            type="button"
            className="relative inline-flex items-center rounded-xl border p-2 text-muted-foreground hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary" />
          </button>

          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            SO
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
