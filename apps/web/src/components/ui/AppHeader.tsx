"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Monogram } from "./Monogram";
import { Wordmark } from "./Text";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string };

/** Signed-in navigation. Routes are defined in docs/ui/recipes.md. */
export const appNav: NavItem[] = [
  { href: "/classmates", label: "Classmates" },
  { href: "/courses", label: "Courses" },
  { href: "/past-classes", label: "Past classes" },
  { href: "/profile", label: "Profile" },
];

type AppHeaderProps = {
  /** Leave out for signed-out pages: the header then shows only the wordmark. */
  nav?: NavItem[];
  account?: { name: string; href: string };
};

/** The ink header band. One per page, at the top. */
export function AppHeader({ nav, account }: AppHeaderProps) {
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
        {account ? (
          <Link
            href={account.href}
            aria-label={`Account for ${account.name}`}
            className="order-2 ml-auto rounded-full no-underline focus-visible:outline-on-ink sm:order-3"
          >
            <Monogram name={account.name} tone="card" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
