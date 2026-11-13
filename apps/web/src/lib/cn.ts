/**
 * Join class names, skipping falsy values.
 * Components accept `className` for layout (margin, width, grid placement),
 * not for restyling. See docs/ui/components.md.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
