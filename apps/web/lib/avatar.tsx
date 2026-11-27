// Avatar look shared by the profile page, match cards, nav and login illustration.
// Colors must match the check constraint in migration 20261127010000_users_avatar.sql.

export const AVATAR_COLORS = {
  blush: { bg: "#fbe9ec", ink: "#8e0b21", name: "Pink" },
  sky: { bg: "#dce6f7", ink: "#23407a", name: "Blue" },
  peach: { bg: "#f6e3cf", ink: "#7a4a1e", name: "Peach" },
  mint: { bg: "#ddefe3", ink: "#2c5e3d", name: "Green" },
  lavender: { bg: "#e8e3f5", ink: "#4b3b8a", name: "Lavender" },
  butter: { bg: "#faf0c8", ink: "#6b5410", name: "Yellow" },
  teal: { bg: "#d8efef", ink: "#1f5a5a", name: "Teal" },
  stone: { bg: "#efebe7", ink: "#3f3a36", name: "Stone" },
} as const;

export type AvatarColor = keyof typeof AVATAR_COLORS;
export const AVATAR_COLOR_KEYS = Object.keys(AVATAR_COLORS) as AvatarColor[];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** The chosen color, or a stable one derived from the user id. */
export function avatarColor(id: string, chosen: string | null | undefined): AvatarColor {
  if (chosen && chosen in AVATAR_COLORS) return chosen as AvatarColor;
  return AVATAR_COLOR_KEYS[hash(id) % AVATAR_COLOR_KEYS.length];
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

/** Interests are stored as free text; the UI treats them as comma-separated tags. */
export function splitInterests(interests: string | null | undefined): string[] {
  return (interests ?? "").split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
}

// ---- Badges: picked from the student's interests, shown on their avatar ----

export type BadgeIcon =
  | "chat" | "chart" | "code" | "scale" | "robot" | "eye" | "heart" | "trend" | "cap" | "game" | "spark";

// First match wins, so more specific topics come first ("Evaluating LLMs" is a chart, not a chat).
const ICON_RULES: [RegExp, BadgeIcon][] = [
  [/evaluat|benchmark|metric|statistic|analytics|experiment/i, "chart"],
  [/ethic|policy|fair|law|responsib|governance|safety/i, "scale"],
  [/health|medic|clinic|bio|care|neuro/i, "heart"],
  [/fintech|financ|forecast|quant|econom|trading|time.series|market/i, "trend"],
  [/robot|drone|reinforcement|hardware|embedded|autonom/i, "robot"],
  [/vision|image|augmented|\bar\b|\bvr\b|photo|graphic|design/i, "eye"],
  [/educat|teach|tutor|mentor|school|accessib/i, "cap"],
  [/game|music|play|procedural/i, "game"],
  [/open.source|code|software|developer|programming|web|systems|compiler|librar/i, "code"],
  [/language|nlp|linguist|speech|chat|llm|text/i, "chat"],
];

export function badgeIcon(interest: string): BadgeIcon {
  return ICON_RULES.find(([re]) => re.test(interest))?.[1] ?? "spark";
}

/** Short label for a badge: "Natural language processing" -> "NLP", "Open-source ML" -> "Open-source". */
export function badgeLabel(interest: string): string {
  const s = interest.trim();
  if (/^natural language processing$/i.test(s)) return "NLP";
  if (/^open[- ]source\b/i.test(s)) return "Open-source";
  const short = s.replace(/large language models?/i, "LLMs");
  const label = short.charAt(0).toUpperCase() + short.slice(1);
  return label.length > 24 ? `${label.slice(0, 23).trimEnd()}…` : label;
}

const ICON_PATHS: Record<BadgeIcon | "none", React.ReactNode> = {
  chat: <path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19.5l1.4-4.4A7.5 7.5 0 1 1 20 11.5z" />,
  chart: <path d="M4 20h16M7 17v-5M11 17V7M15 17v-8M19 17v-3" />,
  code: <path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5" />,
  scale: (
    <>
      <path d="M12 4v16M8 20h8M5 7h14M12 4l0 3" />
      <path d="M5 7 2.5 13a2.5 2.5 0 0 0 5 0L5 7zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0L19 7z" />
    </>
  ),
  robot: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="2.5" />
      <path d="M12 4.5V8M9.5 13h.01M14.5 13h.01M9.5 16.5h5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />,
  trend: <path d="M3.5 16.5 9 11l4 4 7.5-7.5M15 7.5h5.5V13" />,
  cap: <path d="M22 9.5 12 5 2 9.5l10 4.5 10-4.5zM6 11.5v5c3.2 2.2 8.8 2.2 12 0v-5" />,
  game: (
    <>
      <path d="M7.5 7h9a4.5 4.5 0 0 1 4.5 4.5v1A4.5 4.5 0 0 1 16.5 17h-9A4.5 4.5 0 0 1 3 12.5v-1A4.5 4.5 0 0 1 7.5 7z" />
      <path d="M7 12h4M9 10v4M15.5 11h.01M17.5 13h.01" />
    </>
  ),
  spark: <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7-5.6-1.9L10.1 9 12 3.5z" />,
  none: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m6 6 12 12" />
    </>
  ),
};

export function Icon({ name, className = "h-4 w-4" }: { name: BadgeIcon | "none"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-none stroke-current`}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name]}
    </svg>
  );
}
