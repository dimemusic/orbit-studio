import { ClipboardText, Code, PaintBrushBroad, RocketLaunch, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";

// One icon per idea, reused by Services and Process so the same thing always has the same glyph.
const MAP = {
  brief: ClipboardText,
  design: PaintBrushBroad,
  code: Code,
  cms: SlidersHorizontal,
  launch: RocketLaunch,
} as const;

export type IconKey = keyof typeof MAP;

export function Icon({ name, size = 22 }: { name: IconKey; size?: number }) {
  const Glyph = MAP[name];
  return <Glyph size={size} weight="light" aria-hidden="true" />;
}
