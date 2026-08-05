"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
  Bell,
  Building2,
  CalendarClock,
  ChevronDown,
  CircleDollarSign,
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
  UsersRound,
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
  finance: CircleDollarSign,
  faculty: UsersRound,
};

export interface NavLink {
  href: string;
  label: string;
  icon: string;
}

export interface NavSection {
  label?: string;
  /** When set alongside a label, the section renders as a collapsible submenu. */
  icon?: string;
  items: NavLink[];
}

interface PortalShellProps {
  title: string;
  heading?: string;
  subheading?: string;
  links?: NavLink[];
  sections?: NavSection[];
  children: ReactNode;
}

function flattenLinks(sections: NavSection[]): NavLink[] {
  return sections.flatMap((section) => section.items);
}

function isLinkActive(link: NavLink, pathname: string, allLinks: NavLink[]) {
  if (link.href === pathname) return true;
  const rootHref = allLinks[0]?.href;
  return pathname.startsWith(link.href) && link.href !== rootHref;
}

function SidebarNav({
  title,
  sections,
  pathname,
  onNavigate,
}: {
  title: string;
  sections: NavSection[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const allLinks = flattenLinks(sections);
  const [toggledGroups, setToggledGroups] = useState<Record<string, boolean>>({});

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

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#B7B7B7]">{title}</p>
        {sections.map((section, sectionIndex) => {
          const sectionKey = section.label ?? `section-${sectionIndex}`;

          if (section.label && section.icon) {
            const GroupIcon = iconRegistry[section.icon] ?? LayoutDashboard;
            const hasActiveChild = section.items.some((link) => isLinkActive(link, pathname, allLinks));
            const isOpen = toggledGroups[sectionKey] ?? hasActiveChild;

            return (
              <div key={sectionKey} className="mb-1">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setToggledGroups((previous) => ({ ...previous, [sectionKey]: !isOpen }))
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-xs transition-colors",
                    hasActiveChild
                      ? "bg-[#C4EAFB] font-bold text-[#181818]"
                      : "font-medium text-[#6B7280] hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <GroupIcon className="size-[18px]" />
                  <span className="flex-1 text-left">{section.label}</span>
                  <ChevronDown
                    className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
                  />
                </button>

                {isOpen ? (
                  <div className="mt-1">
                    {section.items.map((link) => {
                      const isActive = isLinkActive(link, pathname, allLinks);

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={onNavigate}
                          className={cn(
                            "mb-1 flex items-center rounded-md py-2 pl-11 pr-3 text-xs transition-colors",
                            isActive
                              ? "font-semibold text-[#181818]"
                              : "font-medium text-[#6B7280] hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <div key={sectionKey} className={cn(sectionIndex > 0 && "mt-3")}>
              {section.label ? (
                <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-[#B7B7B7]">
                  {section.label}
                </p>
              ) : null}
              {section.items.map((link) => {
                const Icon = iconRegistry[link.icon] ?? LayoutDashboard;
                const isActive = isLinkActive(link, pathname, allLinks);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    className={cn(
                      "mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-xs transition-colors",
                      isActive
                        ? "bg-[#C4EAFB] font-bold text-[#181818]"
                        : "font-medium text-[#6B7280] hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className="size-[18px]" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
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
  links = [],
  sections,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const resolvedSections = sections ?? [{ items: links }];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">
        <SidebarNav title={title} sections={resolvedSections} pathname={pathname} />
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
                sections={resolvedSections}
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
