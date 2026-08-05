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
  UserCheck,
  UserCog,
  Wallet,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";
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
  managers: UserCog,
  admissions: TrendingUp,
  attendance: UserCheck,
  funds: Wallet,
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
    <div className="flex h-full flex-col bg-white">
      <div className="p-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] via-[#0284C7] to-[#06B6D4] text-white">
            <Building2 className="size-4" />
          </div>
          <div>
            <p className="font-brand text-sm font-bold leading-none text-[#181818]">Edunity</p>
            <p className="mt-0.5 text-[10px] leading-tight text-[#B7B7B7]">School Operating System</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 pb-4">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#B7B7B7]">{title}</p>
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
                "mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-xs transition-colors",
                isActive
                  ? "bg-[#C4EAFB] font-bold text-[#181818]"
                  : "font-medium text-[#B7B7B7] hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="size-[18px]" />
              {link.label}
            </Link>
          );
        })}
      </nav>
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">
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
            <SheetContent side="left" className="w-64 bg-white p-0">
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

          <UserMenu />
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
