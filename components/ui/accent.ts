// Category colours. Full class strings so Tailwind can see them.
export type Accent = "blue" | "cyan" | "violet" | "green";

export const ACCENT: Record<Accent, { text: string; dot: string; tint: string; border: string }> = {
  blue: { text: "text-blue", dot: "bg-blue", tint: "bg-blue/12", border: "border-blue/35" },
  cyan: { text: "text-cyan", dot: "bg-cyan", tint: "bg-cyan/12", border: "border-cyan/35" },
  violet: { text: "text-violet-soft", dot: "bg-violet", tint: "bg-violet/12", border: "border-violet/35" },
  green: { text: "text-green", dot: "bg-green", tint: "bg-green/12", border: "border-green/35" },
};
