import { useId } from "react";
import { current, PROJECTS, type DemoFile, type Look } from "@/lib/demo-files";

// small deterministic hash so each file gets its own composition
const seed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
};

const SECOND: Record<string, string> = { kadr: "#8b5cf6", varta: "#2dd4bf", kyt: "#f472b6" };

/**
 * Generated placeholder preview by file type: no external images. 4:3, fills its box.
 * `look` (per version) shifts hue, offsets the shapes and changes the layout a little; default = latest version.
 */
export function Thumb({ file, look, className = "" }: { file: DemoFile; look?: Look; className?: string }) {
  const l = look ?? current(file).look;
  const uid = useId().replace(/:/g, "");
  const a = PROJECTS.find((p) => p.id === file.project)!.color;
  const b = SECOND[file.project];
  const r = (seed(file.id) + l.variant * 0.31) % 1;
  const g = `g${uid}`;

  return (
    <svg
      viewBox="0 0 160 120"
      preserveAspectRatio="xMidYMid slice"
      className={`block h-full w-full ${className}`}
      style={l.hue ? { filter: `hue-rotate(${l.hue}deg)` } : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} stopOpacity="0.55" />
          <stop offset="1" stopColor={b} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="#0b0f19" />
      <g transform={`translate(${l.dx} ${l.dy})`}>

      {file.kind === "psd" && (
        // photo composite: sky gradient, sun, layered hills
        <>
          <rect width="160" height="120" fill={`url(#${g})`} />
          <circle cx={40 + r * 80} cy={38} r={16 + r * 8} fill="#fff" opacity="0.22" />
          <path d={`M0 ${86 - r * 10} Q50 ${60 + r * 10} 100 84 T160 ${74 + r * 8} V120 H0Z`} fill="#05070d" opacity="0.5" />
          <path d="M0 104 Q60 88 110 100 T160 96 V120 H0Z" fill="#05070d" opacity="0.7" />
        </>
      )}

      {file.kind === "png" && (
        // flat export: framed image with a mountain
        <>
          <rect x="14" y="12" width="132" height="96" rx="6" fill={`url(#${g})`} />
          <circle cx={46 + r * 30} cy="40" r="9" fill="#fff" opacity="0.35" />
          <path d="M14 96 L58 56 L84 80 L104 64 L146 98 V102 Q146 108 140 108 H20 Q14 108 14 102Z" fill="#05070d" opacity="0.55" />
        </>
      )}

      {file.kind === "fig" && (
        // interface frames
        <>
          <rect width="160" height="120" fill={a} opacity="0.08" />
          <rect x="16" y="16" width="78" height="88" rx="5" fill="#fff" opacity="0.06" stroke="#fff" strokeOpacity="0.14" />
          <rect x="24" y="26" width="40" height="5" rx="2.5" fill="#fff" opacity="0.5" />
          <rect x="24" y="36" width="58" height="3" rx="1.5" fill="#fff" opacity="0.2" />
          <rect x="24" y="44" width="62" height="34" rx="3" fill={`url(#${g})`} />
          <rect x="24" y="86" width="26" height="9" rx="4.5" fill={a} />
          <rect x="102" y="16" width="42" height="88" rx="8" fill="#fff" opacity="0.05" stroke="#fff" strokeOpacity="0.14" />
          <rect x="108" y="26" width="30" height="24" rx="3" fill={`url(#${g})`} />
          <rect x="108" y="56" width="22" height="3" rx="1.5" fill="#fff" opacity="0.3" />
          <rect x="108" y="63" width="28" height="3" rx="1.5" fill="#fff" opacity="0.15" />
        </>
      )}

      {file.kind === "ai" && (
        // vector paths with anchor points
        <>
          <rect width="160" height="120" fill={b} opacity="0.07" />
          <path
            d={`M30 ${84 - r * 14} C 52 ${20 + r * 10}, 98 ${18 + r * 20}, 128 ${70 - r * 16}`}
            fill="none"
            stroke={`url(#${g})`}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path d={`M30 ${84 - r * 14} C 52 ${20 + r * 10}, 98 ${18 + r * 20}, 128 ${70 - r * 16}`} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
          <line x1="30" y1={84 - r * 14} x2="52" y2={20 + r * 10} stroke="#fff" strokeOpacity="0.3" strokeWidth="0.6" />
          <line x1="128" y1={70 - r * 16} x2="98" y2={18 + r * 20} stroke="#fff" strokeOpacity="0.3" strokeWidth="0.6" />
          {[
            [30, 84 - r * 14],
            [128, 70 - r * 16],
          ].map(([x, y]) => (
            <rect key={x} x={x - 3} y={y - 3} width="6" height="6" fill="#05070d" stroke="#fff" strokeWidth="1" />
          ))}
          {[
            [52, 20 + r * 10],
            [98, 18 + r * 20],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="2.5" fill="#fff" />
          ))}
        </>
      )}

      {file.kind === "pdf" && (
        // page with a cover band and text lines
        <>
          <rect width="160" height="120" fill={a} opacity="0.06" />
          <rect x="46" y="10" width="68" height="100" rx="3" fill="#e9edf4" opacity="0.92" />
          <rect x="46" y="10" width="68" height={34 + r * 10} rx="3" fill={`url(#${g})`} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="54" y={54 + r * 10 + i * 8} width={i === 4 ? 30 : 52 - (i % 2) * 8} height="3" rx="1.5" fill="#05070d" opacity="0.28" />
          ))}
        </>
      )}

      {file.kind === "mp4" && (
        // video frame, play button, timeline
        <>
          <rect width="160" height="120" fill={`url(#${g})`} opacity="0.75" />
          <rect width="160" height="120" fill="#05070d" opacity="0.35" />
          <circle cx="80" cy="54" r="16" fill="#05070d" opacity="0.55" />
          <path d="M75 46 L88 54 L75 62Z" fill="#fff" />
          <rect x="14" y="98" width="132" height="3" rx="1.5" fill="#fff" opacity="0.2" />
          <rect x="14" y="98" width={30 + r * 70} height="3" rx="1.5" fill="#fff" opacity="0.8" />
        </>
      )}
      </g>
    </svg>
  );
}
