import { AVATAR_COLORS, avatarColor, badgeIcon, Icon, initials } from "@/lib/avatar";

const SIZES = {
  sm: { box: "h-11 w-11 text-[15px]", bubble: "h-5 w-5 -bottom-0.5 -right-0.5", icon: "h-3 w-3" },
  md: { box: "h-14 w-14 text-lg", bubble: "h-6 w-6 -bottom-0.5 -right-0.5", icon: "h-3.5 w-3.5" },
  lg: { box: "h-[72px] w-[72px] text-2xl", bubble: "h-7 w-7 -bottom-0.5 -right-0.5", icon: "h-4 w-4" },
  xl: { box: "h-28 w-28 text-[40px]", bubble: "h-10 w-10 bottom-0 right-0", icon: "h-5 w-5" },
} as const;

/**
 * Initials in the student's chosen color (or a stable one from their id), with an
 * optional badge bubble showing the icon of one of their interests.
 */
export function Avatar({
  id, name, color, badge, size = "md", className = "",
}: {
  id: string;
  name: string | null | undefined;
  color?: string | null;
  badge?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const c = AVATAR_COLORS[avatarColor(id, color)];
  const s = SIZES[size];
  return (
    <span aria-hidden="true" className={`relative inline-flex shrink-0 ${className}`}>
      <span
        className={`flex items-center justify-center rounded-full font-display font-bold tracking-tight ${s.box}`}
        style={{ backgroundColor: c.bg, color: c.ink }}
      >
        {initials(name)}
      </span>
      {badge && (
        <span
          className={`absolute flex items-center justify-center rounded-full bg-white ring-2 ring-white shadow-[0_2px_6px_rgba(26,26,26,0.12)] ${s.bubble}`}
          style={{ color: c.ink }}
        >
          <Icon name={badgeIcon(badge)} className={s.icon} />
        </span>
      )}
    </span>
  );
}
