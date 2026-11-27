// Initials avatar. The color is derived from the user id, so it is stable per person
// and needs no extra profile data.
const PALETTE = [
  "bg-[#dce6f7] text-[#23407a]",
  "bg-[#f6e3cf] text-[#7a4a1e]",
  "bg-[#ddefe3] text-[#2c5e3d]",
  "bg-[#e8e3f5] text-[#4b3b8a]",
  "bg-[#faf0c8] text-[#6b5410]",
  "bg-[#d8efef] text-[#1f5a5a]",
  "bg-blush text-husky-ink",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

export function Avatar({ id, name, size = "md" }: { id: string; name: string | null; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-11 w-11 text-[15px]" : "h-14 w-14 text-lg";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold ${dims} ${PALETTE[hash(id) % PALETTE.length]}`}
    >
      {initials(name)}
    </span>
  );
}
