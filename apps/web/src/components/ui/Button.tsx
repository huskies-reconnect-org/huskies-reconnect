import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "inverse";
export type ButtonSize = "md" | "lg";

const base =
  "voice-linear inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  // One per view: the action the screen exists for (Send intro, Join, Save profile).
  primary: "bg-red text-on-red hover:bg-red-ink",
  // Everything else a person might do next (Edit intro, Show intro).
  secondary: "border-2 border-ink text-ink hover:bg-ink hover:text-on-ink",
  // Low-stakes or backing-out actions (Not now, Cancel). Looks like a link, acts like a button.
  quiet: "text-ink underline underline-offset-4 hover:text-red-ink",
  // Secondary action placed on an ink surface (header, dark dialogs).
  inverse:
    "border-2 border-on-ink text-on-ink hover:bg-on-ink hover:text-ink focus-visible:outline-on-ink",
};

// lg matches the field height (h-12) so a button can sit beside an input.
const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-base",
};

const quietSizes: Record<ButtonSize, string> = {
  md: "h-11 px-3 text-base",
  lg: "h-12 px-3 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(base, variants[variant], variant === "quiet" ? quietSizes[size] : sizes[size]);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** A real <button>. Label it with the verb that happens: "Send intro", not "Submit". */
export function Button({ variant = "primary", size = "md", type = "button", className, ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonClasses(variant, size), className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** Navigation that looks like a button. Use when the action moves to another page. */
export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonClasses(variant, size), "no-underline", className)} {...props} />;
}
