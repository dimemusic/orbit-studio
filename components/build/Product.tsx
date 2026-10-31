import type { CSSProperties } from "react";
import { CmsScreen } from "./Cms";
import { CodeScreen } from "./Code";
import { designFrame, DesignScreen } from "./Design";
import { PhoneButtons } from "./IPhone";
import { launchLift, LaunchScreen } from "./Launch";
import { beatsOf, blur, box, handover, MB, PROD, STAGE_START, stageAt } from "./shared";
import { useFit } from "./Stage";
import { seg, smooth } from "./util";

/**
 * The product: ONE object through the whole film. A Figma artboard while it is designed, the live preview next to the
 * code, a phone while the panel edits it, a browser when it launches. Between stages it slides and reshapes
 * (rect, corner radius, phone body) while its screen cross-fades from one stage's content to the next,
 * so the story never cuts to an empty frame. Desktop only (ProductFrame); on phones each stage shows its own
 * product inside its cropped layer (ProductAt), since only one part of a stage is visible there.
 */

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** phone body: titanium rim + black bezel, as thick as the bezel the rect carries (0 → 12 px) */
const RIM = 3;

function Screen({ i, s, hold }: { i: number; s: number; hold: number }) {
  if (i === 0) return <DesignScreen s={s} />;
  if (i === 1) return <CodeScreen s={s} />;
  if (i === 2) return <CmsScreen s={s} />;
  return <LaunchScreen s={s} hold={hold} />;
}

/** the frame between stage `from` and `from + 1` at hand-over progress m (0 = stage `from` as it is) */
function Body({ from, m, t, hold, style }: { from: number; m: number; t: number; hold: number; style?: CSSProperties }) {
  const a = PROD[from];
  const b = PROD[Math.min(from + 1, PROD.length - 1)];
  const x = lerp(a.x, b.x, m);
  const w = lerp(a.w, b.w, m);
  const r = lerp(a.r, b.r, m);
  const bezel = lerp(a.bezel, b.bezel, m);
  const phone = bezel / 12;
  const innerW = w - bezel * 2;
  const innerH = a.h - bezel * 2;
  // the browser's border turns green as the site goes live
  const launchW = from === 3 ? 1 : from === 2 ? m : 0;
  const lift = launchLift(beatsOf(t, 3));
  // stage 0, before any hand-over: the designer is still dragging the artboard open
  const frame = from === 0 && m === 0 ? designFrame(beatsOf(t, 0)) : 1;
  if (frame <= 0) return null;
  const screens = [
    { i: from, o: 1 - smooth(seg(m, 0.05, 0.55)) },
    { i: from + 1, o: smooth(seg(m, 0.45, 0.95)) },
  ].filter((v) => v.i < PROD.length && v.o > 0.001);

  return (
    <div
      aria-hidden="true"
      style={{
        ...box(x, a.y, w, a.h),
        ...style,
        clipPath: frame < 1 ? `inset(0 ${((1 - frame) * 100).toFixed(2)}% ${((1 - frame) * 100).toFixed(2)}% 0 round ${r.toFixed(1)}px)` : style?.clipPath,
      }}
    >
      {phone > 0.01 && (
        <div className="absolute inset-0" style={{ opacity: phone }}>
          <PhoneButtons />
        </div>
      )}
      {/* body: titanium rim, black bezel (both 0 wide unless it is a phone), then the screen */}
      <div
        className="absolute inset-0 shadow-[0_50px_100px_-30px_rgb(0_0_0/0.95)]"
        style={{
          borderRadius: r,
          background: phone > 0.01 ? "linear-gradient(145deg,#4a4e57,#1d1f24 35%,#2b2e35 70%,#121317)" : "#f4f0e8",
          boxShadow: launchW > 0 ? `0 0 0 1px rgb(52 211 153 / ${(launchW * (0.15 + lift * 0.45)).toFixed(3)}), 0 50px 110px -30px rgb(0 0 0 / 0.95)` : undefined,
        }}
      >
        {phone > 0.01 && <div className="absolute bg-black" style={{ inset: RIM * phone, borderRadius: Math.max(0, r - RIM * phone) }} />}
        <div
          className="absolute overflow-hidden bg-[#f4f0e8]"
          style={{ inset: bezel, borderRadius: Math.max(6, r - bezel + 1) }}
        >
          {screens.map(({ i, o }) => {
            // each stage's screen keeps its own natural size, centred in the frame while it reshapes
            const natW = PROD[i].w - PROD[i].bezel * 2;
            const natH = PROD[i].h - PROD[i].bezel * 2;
            const settling = o < 1;
            return (
              <div
                key={i}
                className="absolute top-0"
                style={{
                  left: (innerW - natW) / 2,
                  width: natW,
                  height: Math.max(natH, innerH),
                  opacity: o,
                  filter: settling && MB ? blur((1 - o) * 6) : undefined,
                }}
              >
                <Screen i={i} s={beatsOf(t, i)} hold={hold} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** desktop: the one product frame, above nothing but below every stage's tools (selections, cursors, toasts) */
export function ProductFrame({ t, fin, hold }: { t: number; fin: number; hold: number }) {
  const fit = useFit();
  if (fit.mobile) return null;
  // which hand-over is running (the one that started before this boundary may still be finishing after it)
  const cur = stageAt(t);
  const from = cur > 0 && handover(t, cur - 1) < 1 && t < STAGE_START[cur] + 1 ? cur - 1 : cur;
  const m = handover(t, from);
  // end of the lap: the whole product whips out with the launch stage
  const out = fin * fin * fin;
  return (
    <Body
      from={from}
      m={m}
      t={t}
      hold={hold}
      style={
        out > 0
          ? {
              transform: `translate(${(-out * 220).toFixed(1)}px, 0) scale(${(1 - out * 0.03).toFixed(4)})`,
              filter: blur(out * 14),
              opacity: 1 - out,
              willChange: MB ? "transform, filter, opacity" : "transform, opacity",
            }
          : undefined
      }
    />
  );
}

/** phones / tablets: stage i's product inside its own cropped stage layer (no hand-over) */
export function ProductAt({ i, t, hold }: { i: number; t: number; hold: number }) {
  const fit = useFit();
  if (!fit.mobile) return null;
  return <Body from={i} m={0} t={t} hold={hold} />;
}
