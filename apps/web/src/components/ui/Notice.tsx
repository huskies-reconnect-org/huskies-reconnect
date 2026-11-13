import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type NoticeProps = {
  /** "error" is announced immediately (role=alert); the others politely (role=status). */
  tone?: "info" | "success" | "error";
  title?: string;
  children: ReactNode;
  className?: string;
};

const tones = {
  info: "border-ink",
  success: "border-ink",
  error: "border-red",
};

/**
 * An inline message about what just happened or what went wrong.
 * Errors say what happened and how to fix it. No icons, no apologies.
 */
export function Notice({ tone = "info", title, children, className }: NoticeProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-field border-2 bg-card px-4 py-3", tones[tone], className)}
    >
      {title ? <p className={cn("font-bold", tone === "error" && "text-red-ink")}>{title}</p> : null}
      <div className="text-small">{children}</div>
    </div>
  );
}
