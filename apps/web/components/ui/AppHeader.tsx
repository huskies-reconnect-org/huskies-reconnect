// Ported from Shaad Qureshi's UI library (PR #2).
// Adapted: nav comes from the caller (only pages that exist here), and the right-hand
// slot takes any action (Sign in / Sign out) instead of an account monogram.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "./Text";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string };

type AppHeaderProps = {
  /** Leave out for signed-out pages: the header then shows only the wordmark. */
  nav?: NavItem[];
  /** Right-hand action, e.g. a Sign in link or Sign out button. */
  action?: ReactNode;
};

/** The ink header band. One per page, at the top. */
export function AppHeader({ nav, action }: AppHeaderProps) {
  const pathname = usePathname();
  return (
    <header className="bg-ink text-on-ink">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3.5 sm:px-8">
        <Wordmark tone="on-ink" />
        {nav ? (
          <nav aria-label="Main" className="order-3 flex basis-full flex-wrap gap-1 sm:order-2 sm:flex-auto sm:basis-auto">
            {nav.map((item) => {
              const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-field px-3.5 py-1.5 font-semibold no-underline transition-colors focus-visible:outline-on-ink",
                    current ? "bg-on-ink text-ink" : "text-on-ink hover:bg-ink-raised",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <span className="order-2 flex-auto" />
        )}
        {action ? <div className="order-2 ml-auto sm:order-3">{action}</div> : null}
      </div>
    </header>
  );
}
