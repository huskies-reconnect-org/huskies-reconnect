"use client";

import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/PawLogo";

// Deliberately not a second nav: the header already has Home and Courses.
export function SiteFooter() {
  const pathname = usePathname();
  // The login page is its own full screen.
  if (pathname === "/login") return null;

  return (
    <footer className="bg-husky text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-7 sm:px-6">
        <Wordmark inverse />
        <p className="text-sm">Built for Northeastern students.</p>
        <p className="text-[13px] text-white/90">A student project, not an official Northeastern service.</p>
      </div>
    </footer>
  );
}
