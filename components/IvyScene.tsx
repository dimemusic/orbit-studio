"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { buildIvy, type IvyData } from "@/lib/ivy";
import {
  ivyFieldFragment,
  ivyFieldVertex,
  ivyLinesFragment,
  ivyLinesVertex,
  ivyPointsFragment,
  ivyPointsVertex,
} from "@/lib/ivyShaders";
import { WORK } from "@/lib/content";
import { CASE_HOVER } from "./home";

type Setup = { data: IvyData; camZ: number; visH: number; genWidth: number; genHeight: number; route: string };

/** Ivy is generated after layout so it spans the real page height (one ivy per route). */
function generate(route: string): Setup {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const small = Math.min(w, h) < 700;
  const camZ = w / h < 0.8 ? 15 : 10;
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(22.5)) * camZ; // world units per viewport height
  const visW = visH * (w / h);
  const genHeight = document.documentElement.scrollHeight;
  return { data: buildIvy({ visH, visW, pageScreens: genHeight / h, small }), camZ, visH, genWidth: w, genHeight, route };
}

/** Elements that must not trigger the background impulse wave. */
const INTERACTIVE = "button, a, input, label, summary, .card";

/**
 * Case nodes: the Work section places [data-case-node] anchors in its side margins; each one is snapped to the
 * nearest real ivy particle, projected to the screen every frame, and hovering near it reveals that case.
 */
type CaseNode = { i: number; p: THREE.Vector3 };
type NodeUi = {
  enabled: boolean;
  world: CaseNode[];
  markers: (HTMLDivElement | null)[];
  /** case shown right now (node under the cursor, or the hovered case card) */
  hot: number | null;
  /** the glass preview is allowed (node hit by the cursor, not a hovered card) */
  preview: boolean;
  /** set by the Work cards (CASE_HOVER) */
  forced: number | null;
};
/** cursor distance (px) that counts as hovering a node */
const NODE_HIT = 40;
/** max snap distance from an anchor to an ivy particle (world units) */
const NODE_SNAP = 1.1;

type IvyProps = { setup: Setup; reduce: boolean; nodes: RefObject<NodeUi>; onHot: (i: number | null, preview: boolean) => void };

function Ivy({ setup, reduce, nodes, onHot }: IvyProps) {
  const { data, camZ, visH } = setup;
  const camera = useThree((s) => s.camera);
  const dpr = useThree((s) => s.viewport.dpr);
  const group = useRef<THREE.Group>(null);

  // one uniform set shared by points and lines; kept across regenerations so growth continues
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMotion: { value: reduce ? 0 : 1 },
      uGrow: { value: 0 },
      uPulse: { value: 0 },
      uPulseOrigin: { value: new THREE.Vector3(99, 99, 0) },
      uDPR: { value: 1 },
      uMouse: { value: new THREE.Vector3(999, 999, 0) },
      uMouseOn: { value: 0 },
      uMorph: { value: 0 },
      uIvy: { value: 0 },
      /** page scroll in world units at z = 0 (the star field scrolls with the page and wraps) */
      uScroll: { value: 0 },
      uFieldH: { value: visH + 0.8 },
      uCamZ: { value: camZ },
      /** 0 in the hero → 1 below it (shader-side defocus, see ivyFieldVertex) */
      uDefocus: { value: 0 },
    }),
    [reduce, visH, camZ],
  );
  useEffect(() => {
    uniforms.uDPR.value = dpr;
  }, [uniforms, dpr]);

  const pointsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = data.particles;
    g.setAttribute("position", new THREE.BufferAttribute(p.position, 3));
    g.setAttribute("aBirth", new THREE.BufferAttribute(p.birth, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(p.color, 3));
    g.setAttribute("aDepth", new THREE.BufferAttribute(p.depth, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(p.seed, 1));
    g.setAttribute("aClaimed", new THREE.BufferAttribute(p.claimed, 1));
    g.setAttribute("aTop", new THREE.BufferAttribute(p.top, 1));
    return g;
  }, [data]);

  // hero field: regenerated together with the ivy (same data)
  const fieldGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const fl = data.field;
    g.setAttribute("position", new THREE.BufferAttribute(fl.position, 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(fl.target, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(fl.color, 3));
    g.setAttribute("aDepth", new THREE.BufferAttribute(fl.depth, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(fl.seed, 1));
    g.setAttribute("aStagger", new THREE.BufferAttribute(fl.stagger, 1));
    g.setAttribute("aMult", new THREE.BufferAttribute(fl.mult, 1));
    return g;
  }, [data]);

  const linesGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const l = data.lines;
    g.setAttribute("position", new THREE.BufferAttribute(l.position, 3));
    g.setAttribute("aBirth", new THREE.BufferAttribute(l.birth, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(l.color, 3));
    g.setAttribute("aDepth", new THREE.BufferAttribute(l.depth, 1));
    g.setAttribute("aEnd", new THREE.BufferAttribute(l.end, 1));
    return g;
  }, [data]);

  const [pointsMat, linesMat, fieldMat] = useMemo(
    () => [
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: ivyPointsVertex,
        fragmentShader: ivyPointsFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: ivyLinesVertex,
        fragmentShader: ivyLinesFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: ivyFieldVertex,
        fragmentShader: ivyFieldFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ],
    [uniforms],
  );

  useEffect(() => () => pointsGeo.dispose(), [pointsGeo]);
  useEffect(() => () => linesGeo.dispose(), [linesGeo]);
  useEffect(() => () => fieldGeo.dispose(), [fieldGeo]);
  useEffect(
    () => () => {
      pointsMat.dispose();
      linesMat.dispose();
      fieldMat.dispose();
    },
    [pointsMat, linesMat, fieldMat],
  );

  // case nodes: anchors → world positions, snapped to the nearest ivy particle of the trunks / first branches
  useEffect(() => {
    const ui = nodes.current;
    ui.world = [];
    if (!ui.enabled) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const visW = visH * (w / h);
    const P = data.particles.position;
    const D = data.particles.depth;
    // world x of the content edge (cards span the central 1120px) minus a 28px gap: nodes stay in the margins
    const edge = Math.abs(((Math.max(0, (w - 1120) / 2) - 28) / w - 0.5) * visW);
    // ...and at least 24px inside the screen edge (the ivy itself reaches past it)
    const outer = (0.5 - 24 / w) * visW;
    document.querySelectorAll<HTMLElement>("[data-case-node]").forEach((el) => {
      const r = el.getBoundingClientRect();
      // only where the side margin is wide enough to sit beside the cards
      if (r.left < 40 || r.right > w - 40) return;
      const wx = ((r.left + r.width / 2) / w - 0.5) * visW;
      const wy = visH / 2 - ((r.top + window.scrollY) / h) * visH;
      let best = -1;
      let bd = NODE_SNAP * NODE_SNAP;
      for (let k = 0; k < data.particles.count; k++) {
        // same side as the anchor, outside the cards
        // x as seen on screen: particles closer to the camera (z > 0) project further out
        const px = (P[k * 3] * camZ) / (camZ - P[k * 3 + 2]);
        const ax = Math.abs(px);
        if (D[k] > 2 || ax < edge || ax > outer || px * wx < 0) continue;
        const dx = px - wx;
        const dy = P[k * 3 + 1] - wy;
        const d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = k;
        }
      }
      const p = best >= 0 ? new THREE.Vector3(P[best * 3], P[best * 3 + 1], P[best * 3 + 2]) : new THREE.Vector3(wx, wy, 0);
      ui.world.push({ i: Number(el.dataset.caseNode), p });
    });
  }, [data, visH, camZ, nodes]);

  // camera distance depends on aspect at generation time (as in the prototype)
  useEffect(() => {
    camera.position.z = camZ;
    camera.updateProjectionMatrix();
  }, [camera, camZ]);

  // ---------- input: listeners on window, the canvas itself ignores pointer events ----------
  const input = useRef({ client: null as [number, number] | null, onTarget: 0, overGrid: false, tiltX: 0, tiltY: 0 });
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const st = input.current;

    const onMove = (ev: PointerEvent) => {
      st.client = [ev.clientX, ev.clientY];
      st.onTarget = 1;
      st.overGrid = !!(ev.target as Element | null)?.closest?.("[data-work-grid]");
      st.tiltX = -((ev.clientY / window.innerHeight) * 2 - 1) * 0.05;
      st.tiltY = ((ev.clientX / window.innerWidth) * 2 - 1) * 0.08;
    };
    const onDown = (ev: PointerEvent) => {
      const target = ev.target as Element | null;
      if (target?.closest?.(INTERACTIVE)) return;
      // click on a case node: scroll to its card
      const hot = nodes.current.hot;
      if (hot !== null && nodes.current.forced === null) {
        document.querySelector(`[data-case-card="${hot}"]`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      }
      ndc.set((ev.clientX / window.innerWidth) * 2 - 1, -(ev.clientY / window.innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        uniforms.uPulseOrigin.value.copy(hit);
        uniforms.uPulse.value = 1;
      }
    };
    const onLeave = () => {
      st.onTarget = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [camera, uniforms, nodes, reduce]);

  // ---------- loop ----------
  const loop = useRef({
    camY: 0,
    /** new page: snap the camera and restart growth from the top of the current view */
    fresh: true,
    ray: new THREE.Raycaster(),
    ndc: new THREE.Vector2(),
    hit: new THREE.Vector3(),
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    node: new THREE.Vector3(),
  });
  useEffect(() => {
    loop.current.fresh = true;
  }, [setup.route]);

  useFrame((state, delta) => {
    const L = loop.current;
    const st = input.current;
    const dt = Math.min(delta, 0.05);
    const u = uniforms;
    u.uTime.value = state.clock.elapsedTime;
    // stars follow the page scroll (smoothed); the field wraps vertically so it never runs out
    const scrollTarget = (window.scrollY / window.innerHeight) * visH;
    u.uScroll.value = reduce ? scrollTarget : u.uScroll.value + (scrollTarget - u.uScroll.value) * Math.min(1, dt * 10);
    u.uPulse.value = Math.max(0, u.uPulse.value - dt * 0.55);
    // below the hero the stars go softly out of focus (same curve as the wrapper's dimming)
    const vh = window.innerHeight;
    u.uDefocus.value = Math.min(1, Math.max(0, (window.scrollY - vh * 0.25) / (vh * 0.65)));

    // the ivy is attached to the page: camera follows scroll 1:1
    const targetY = 0; // the star field is the whole page background: it stays put while the page scrolls
    // hero field → ivy: follows scroll over the first 0.9 screen, smoothed and reversible
    const morphTarget = 0; // stars stay stars: the ivy (neurons) is switched off site-wide
    if (L.fresh) {
      // growth is one-way per page: each route starts again, already grown above the visible screen
      L.fresh = false;
      L.camY = targetY;
      u.uGrow.value = Math.max(0, -targetY);
      u.uMorph.value = morphTarget;
    }
    u.uMorph.value = reduce ? morphTarget : u.uMorph.value + (morphTarget - u.uMorph.value) * Math.min(1, dt * 4);
    // ivy lines fade in once the field is half-way into the roots
    u.uIvy.value = 0;
    L.camY += (targetY - L.camY) * Math.min(1, dt * 10);
    camera.position.y = L.camY;

    // growth front sits just below the bottom edge; it never jumps and is one-way (scrolling up keeps what grew)
    const growTarget = -L.camY + visH * 1.08;
    const g = u.uGrow.value;
    const diff = growTarget - g;
    const maxSpeed = reduce ? 100 : 9;
    if (diff > 0) u.uGrow.value = g + Math.min(diff, maxSpeed * dt, diff * dt * 6 + 0.004);

    if (st.client) {
      L.ndc.set((st.client[0] / window.innerWidth) * 2 - 1, -(st.client[1] / window.innerHeight) * 2 + 1);
      L.ray.setFromCamera(L.ndc, camera);
      if (L.ray.ray.intersectPlane(L.plane, L.hit)) u.uMouse.value.lerp(L.hit, Math.min(1, dt * 10));
    }
    u.uMouseOn.value += (st.onTarget - u.uMouseOn.value) * Math.min(1, dt * 5);

    const grp = group.current;
    if (grp) {
      const k = Math.min(1, dt * 3);
      grp.rotation.x += (st.tiltX - grp.rotation.x) * k;
      grp.rotation.y += (st.tiltY - grp.rotation.y) * k;
    }

    // case nodes: project onto the screen, move their DOM markers, pick the one under the cursor
    const ui = nodes.current;
    if (grp && ui.world.length) {
      grp.updateMatrixWorld();
      camera.updateMatrixWorld();
      const W = window.innerWidth;
      const H = window.innerHeight;
      let hit: number | null = null;
      let bd = NODE_HIT * NODE_HIT;
      const overGrid = st.overGrid;
      for (const n of ui.world) {
        L.node.copy(n.p).applyMatrix4(grp.matrixWorld).project(camera);
        const sx = ((L.node.x + 1) / 2) * W;
        const sy = ((1 - L.node.y) / 2) * H;
        const el = ui.markers[n.i];
        if (el) el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
        if (st.client && st.onTarget && !overGrid) {
          const d = (st.client[0] - sx) ** 2 + (st.client[1] - sy) ** 2;
          if (d < bd) {
            bd = d;
            hit = n.i;
          }
        }
      }
      const show = hit ?? ui.forced;
      // glass preview only for a node hit in the margin, never while a case card is hovered (it would cover the cards)
      const preview = hit !== null;
      if (show !== ui.hot || preview !== ui.preview) {
        ui.hot = show;
        ui.preview = preview;
        onHot(show, preview);
      }
    }
  });

  return (
    <group ref={group}>
      <points geometry={fieldGeo} material={fieldMat} frustumCulled={false} />
    </group>
  );
}

export default function IvyScene() {
  const [setup, setSetup] = useState<Setup | null>(null);
  // the stars are built: let them render two frames, then end the boot so hero, nav and stars appear together
  useEffect(() => {
    if (!setup) return;
    let r2 = 0;
    let t = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        // the intro title card holds the boot until it lifts away
        const wait = Math.max(0, ((window as { __introEnd?: number }).__introEnd ?? 0) - performance.now());
        t = window.setTimeout(() => document.documentElement.classList.remove("booting"), wait);
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      clearTimeout(t);
    };
  }, [setup]);
  const setupRef = useRef<Setup | null>(null);
  const pathname = usePathname();
  const routeRef = useRef(pathname);
  routeRef.current = pathname;
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  // case nodes only for hover-capable fine pointers (touch keeps the plain ivy)
  const fine = useMemo(() => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches, []);
  const nodes = useRef<NodeUi>({ enabled: fine, world: [], markers: [], hot: null, preview: false, forced: null });
  const [hot, setHot] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);

  // a Work card hover lights its node; the shown case marks its card (data-hot) so both light up together
  useEffect(() => {
    const on = (e: Event) => {
      nodes.current.forced = (e as CustomEvent<number | null>).detail;
    };
    window.addEventListener(CASE_HOVER, on);
    return () => window.removeEventListener(CASE_HOVER, on);
  }, []);
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-case-card]").forEach((el) => {
      if (Number(el.dataset.caseCard) === hot) el.setAttribute("data-hot", "");
      else el.removeAttribute("data-hot");
    });
  }, [hot]);

  // per page: first pass after fonts + one frame; once the page has loaded and its height is quiet for
  // 600ms, regenerate once if the document height moved, so DEPTH_TOTAL matches the final scrollHeight
  useEffect(() => {
    let cancelled = false;
    let quiet: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
      if (cancelled) return;
      const s = generate(pathname);
      setupRef.current = s;
      setSetup(s);
    };
    const ro = new ResizeObserver(() => {
      clearTimeout(quiet);
      quiet = setTimeout(settle, 600);
    });
    const settle = () => {
      if (cancelled) return;
      if (document.readyState !== "complete") {
        quiet = setTimeout(settle, 300);
        return;
      }
      ro.disconnect();
      const cur = setupRef.current;
      if (cur && Math.abs(document.documentElement.scrollHeight - cur.genHeight) > 4) run();
    };
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() =>
      requestAnimationFrame(() => {
        run();
        ro.observe(document.body);
      }),
    );
    return () => {
      cancelled = true;
      clearTimeout(quiet);
      ro.disconnect();
    };
  }, [pathname]);

  // regenerate only when the width changes by more than 20%
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const cur = setupRef.current;
        if (cur && Math.abs(window.innerWidth - cur.genWidth) / cur.genWidth > 0.2) {
          const s = generate(routeRef.current);
          setupRef.current = s;
          setSetup(s);
        }
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const on = () => setVisible(document.visibilityState === "visible");
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  // stars are the page background: sharp in the hero, a bit dimmer below it (the defocus itself is in the shader:
  // a CSS filter on this full-screen layer cost a full-screen blur every frame)
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onScroll = () => {
      const h = window.innerHeight;
      // below the hero the same stars stay, softly out of focus
      const k = Math.min(1, Math.max(0, (window.scrollY - h * 0.25) / (h * 0.65)));
      el.style.opacity = String(1 - k * 0.35);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div ref={wrap} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[1] h-lvh w-screen">
        <div className="scene-fade h-full w-full">
        <Canvas
          // linear + flat: no colour management / tone mapping, matching the r128 prototype's colours
          linear
          flat
          dpr={[1, 1.5]}
          // the stars twinkle and drift every frame, so the loop stays continuous, but only while the tab is visible
          frameloop={visible ? "always" : "never"}
          camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 10] }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor("#05070d", 1)}
          style={{ pointerEvents: "none" }}
          fallback={<p className="fixed inset-x-4 bottom-20 text-center text-[13px] text-grey">Цей браузер не підтримує WebGL.</p>}
        >
          {setup && <Ivy setup={setup} reduce={reduce} nodes={nodes} onHot={(i, p) => {
              setHot(i);
              setPreview(p);
            }}
          />}
        </Canvas>
        </div>
      </div>
      
    </>
  );
}

/** DOM layer above the content: one marker per case (moved by the render loop) + a glass preview on hover. */
function CaseNodes({ nodes, hot, preview }: { nodes: RefObject<NodeUi>; hot: number | null; preview: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[3] overflow-hidden">
      {WORK.cases.map((c, i) => {
        const on = hot === i;
        // right-margin nodes open their preview to the left
        const right = i % 2 === 1;
        return (
          <div
            key={c.id}
            ref={(el) => {
              nodes.current.markers[i] = el;
            }}
            className="absolute left-0 top-0"
            style={{ transform: "translate3d(-200px, -200px, 0)", ["--c" as string]: c.color }}
          >
            <span
              className={`absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--c)] transition-[scale] duration-300 ${on ? "scale-150" : ""}`}
            />
            <span
              className={`absolute left-0 top-0 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[scale] duration-500 ease-[var(--ease)] ${on ? "scale-150" : ""}`}
              style={{ borderColor: "color-mix(in srgb, var(--c) 50%, transparent)" }}
            />
            <div
              className={`card absolute top-0 w-[248px] -translate-y-1/2 p-3 text-left transition-[translate,visibility] duration-500 ease-[var(--ease)] ${
                right ? "right-7" : "left-7"
              } ${on && preview ? "visible translate-x-0" : `invisible ${right ? "translate-x-2" : "-translate-x-2"}`}`}
            >
              <div
                className="grid aspect-[16/10] place-items-center rounded-lg border border-white/[0.07]"
                style={{ background: "radial-gradient(80% 90% at 50% 100%, color-mix(in srgb, var(--c) 30%, transparent), transparent 70%)" }}
              >
                <span translate="no" className="text-[22px] font-semibold tracking-[-0.04em] text-fg">
                  {c.name}
                </span>
              </div>
              <p className="mt-3 px-1">
                <span className="block text-[14px] font-semibold text-fg" translate="no">
                  {c.name}
                </span>
                <span className="block text-[12px] text-grey">{c.kind}</span>
              </p>
              <p className="mt-1 px-1 pb-0.5 text-[12px] text-body">{c.tags.join(" · ")}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
