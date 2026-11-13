import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";

// One family, three voices (casual, linear, mono). See docs/ui/README.md.
const recursive = Recursive({
  subsets: ["latin"],
  axes: ["CASL", "MONO"],
  variable: "--font-recursive",
});

export const metadata: Metadata = {
  title: {
    default: "Huskies Reconnect | Keep your classmates after the semester",
    template: "%s | Huskies Reconnect",
  },
  description:
    "Meet a few people from each of your Northeastern classes, and stay in touch after the semester ends.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={recursive.variable}>
      <body className="flex min-h-dvh flex-col bg-heather font-sans text-base text-ink">
        {children}
      </body>
    </html>
  );
}
