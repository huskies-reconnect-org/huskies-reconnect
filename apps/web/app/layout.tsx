import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { PawTrail } from "@/components/PawTrail";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} flex min-h-dvh flex-col antialiased`}>
        <PawTrail />
        <NavBar />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
