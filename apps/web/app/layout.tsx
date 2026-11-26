import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";

// One family, three voices (casual, linear, mono). From Shaad Qureshi's UI library (PR #2).
const recursive = Recursive({
  subsets: ["latin"],
  axes: ["CASL", "MONO"],
  variable: "--font-recursive",
});

export const metadata: Metadata = {
  title: "Huskies Reconnect",
  description: "The classmate network that doesn't disappear when the semester does.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={recursive.variable}>
      <body className="flex min-h-dvh flex-col bg-heather font-sans text-base text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
