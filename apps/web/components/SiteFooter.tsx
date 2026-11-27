"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/PawLogo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
];

export function SiteFooter() {
  const pathname = usePathname();
  // The login page is its own full screen; its links would only bounce back to /login.
  if (pathname === "/login") return null;

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-1">
          <Link href="/" className="inline-flex min-h-11 items-center self-start text-ink">
            <Wordmark />
          </Link>
          <p className="text-sm text-muted">Built for Northeastern students.</p>
        </div>
        <nav aria-label="Footer" className="-ml-3 flex gap-1 sm:ml-0">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted hover:bg-sand hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
