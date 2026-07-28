import Link from "next/link";
import { ReactNode } from "react";

export function PortalShell({
  title,
  links,
  children,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border bg-background p-4">
          <h2 className="mb-4 text-lg font-semibold">{title}</h2>
          <nav className="flex flex-col gap-2 text-sm">
            {links.map((link) => (
              <Link key={link.href} className="rounded px-2 py-1 hover:bg-muted" href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="rounded-lg border bg-background p-6">{children}</main>
      </div>
    </div>
  );
}

