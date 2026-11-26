// Ported from Shaad Qureshi's UI library (PR #2). SidebarLayout left out (unused here).
import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Page width and side gutters. Every page section sits inside one. */
export function Container({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</Tag>;
}

export type FooterLink = { href: string; label: string };

/** Footer for every page. Only link to pages that exist. */
export function SiteFooter({ links = [] }: { links?: FooterLink[] }) {
  return (
    <footer className="mt-auto border-t-2 border-heather-deep">
      <Container className="flex flex-wrap justify-between gap-x-6 gap-y-2 py-5 text-small text-muted">
        <span>Huskies Reconnect · for Northeastern students</span>
        {links.length > 0 ? (
          <nav aria-label="Footer" className="flex flex-wrap gap-5">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-ink underline underline-offset-4 hover:text-red-ink">
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </Container>
    </footer>
  );
}
