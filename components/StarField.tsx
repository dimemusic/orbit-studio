"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { starFragment, starVertex } from "@/lib/starShaders";
import { buildStars, type Stars } from "@/lib/stars";
import { useContent } from "./Lang";


type Setup = { stars: Stars; camZ: number; visH: number; width: number; aspect: number; small: boolean };

const camZFor = (aspect: number) => (aspect < 0.8 ? 15 : 10);
/** phones get fewer stars; by width (or a touch screen), never by height: a low desktop window keeps the full field */
const isSmall = (w: number, h: number) => w < 700 || (matchMedia("(pointer: coarse)").matches && Math.min(w, h) < 700);

/** one screen of stars for the current viewport (the shader scrolls and wraps it) */
function generate(): Setup {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  const camZ = camZFor(aspect);
  const small = isSmall(w, h);
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(22.5)) * camZ; // world units per viewport height
  return { stars: buildStars({ visW: visH * aspect, visH, small }), camZ, visH, width: w, aspect, small };
}

/**
 * The camera's field of view is vertical, so a lower window shows more of the world on the sides.
 * Regenerate when the view got wider than the field (empty sides) or much narrower (stars spread too thin),
 * or the camera distance / star budget changes; not only on width.
 */
const stale = (cur: Setup) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  return (
    Math.abs(w - cur.width) / cur.width > 0.2 ||
    aspect > cur.aspect * 1.03 ||
    aspect < cur.aspect * 0.85 ||
    camZFor(aspect) !== cur.camZ ||
    isSmall(w, h) !== cur.small
  );
};

/** 0 in the hero → 1 one screen down: the stars (shader) and the canvas wrapper (opacity) dim together */
const dimAt = () => Math.min(1, Math.max(0, (window.scrollY - window.innerHeight * 0.25) / (window.innerHeight * 0.65)));

/** clicks on these never send the background wave */
const INTERACTIVE = "button, a, input, label, summary, textarea, .card";

function Field({ setup, reduce }: { setup: Setup; reduce: boolean }) {
  const { stars, camZ, visH } = setup;
  const camera = useThree((s) => s.camera);
  const dpr = useThree((s) => s.viewport.dpr);
  const group = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMotion: { value: reduce ? 0 : 1 },
      uPulse: { value: 0 },
      uPulseOrigin: { value: new THREE.Vector3(99, 99, 0) },
      uMouse: { value: new THREE.Vector3(999, 999, 0) },
      uMouseOn: { value: 0 },
      uDPR: { value: 1 },
      /** page scroll in world units at z = 0 */
      uScroll: { value: 0 },
      uFieldH: { value: visH + 0.8 },
      uCamZ: { value: camZ },
      uDim: { value: 0 },
    }),
    [reduce, visH, camZ],
  );
  useEffect(() => {
    uniforms.uDPR.value = dpr;
  }, [uniforms, dpr]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(stars.position, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(stars.color, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(stars.seed, 1));
    g.setAttribute("aTwinkle", new THREE.BufferAttribute(stars.twinkle, 1));
    return g;
  }, [stars]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: starVertex,
        fragmentShader: starFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    camera.position.z = camZ;
    camera.updateProjectionMatrix();
  }, [camera, camZ]);

  // input: listeners on window (the canvas ignores pointer events)
  const input = useRef({ client: null as [number, number] | null, on: 0, tiltX: 0, tiltY: 0 });
  useEffect(() => {
    const st = input.current;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const onMove = (e: PointerEvent) => {
      st.client = [e.clientX, e.clientY];
      st.on = 1;
      st.tiltX = -((e.clientY / window.innerHeight) * 2 - 1) * 0.05;
      st.tiltY = ((e.clientX / window.innerWidth) * 2 - 1) * 0.08;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        uniforms.uPulseOrigin.value.copy(hit);
        uniforms.uPulse.value = 1;
      }
    };
    const onLeave = () => {
      st.on = 0;
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
  }, [camera, uniforms]);

  // per-frame scratch objects (no allocations inside useFrame)
  const scratch = useRef({ ray: new THREE.Raycaster(), ndc: new THREE.Vector2(), hit: new THREE.Vector3(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0) });

  useFrame((state, delta) => {
    const u = uniforms;
    const st = input.current;
    const S = scratch.current;
    const dt = Math.min(delta, 0.05);
    u.uTime.value = state.clock.elapsedTime;
    const scroll = (window.scrollY / window.innerHeight) * visH;
    u.uScroll.value = reduce ? scroll : u.uScroll.value + (scroll - u.uScroll.value) * Math.min(1, dt * 10);
    u.uPulse.value = Math.max(0, u.uPulse.value - dt * 0.55);
    u.uDim.value = dimAt();

    if (st.client) {
      S.ndc.set((st.client[0] / window.innerWidth) * 2 - 1, -(st.client[1] / window.innerHeight) * 2 + 1);
      S.ray.setFromCamera(S.ndc, camera);
      if (S.ray.ray.intersectPlane(S.plane, S.hit)) u.uMouse.value.lerp(S.hit, Math.min(1, dt * 10));
    }
    u.uMouseOn.value += (st.on - u.uMouseOn.value) * Math.min(1, dt * 5);

    const g = group.current;
    if (g && !reduce) {
      const k = Math.min(1, dt * 3);
      g.rotation.x += (st.tiltX - g.rotation.x) * k;
      g.rotation.y += (st.tiltY - g.rotation.y) * k;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

/**
 * Fixed full-screen star field behind the whole site (client only, see Scene.tsx).
 * Generated for the viewport; regenerated when the width changes by more than 20% or the view gets wider than the field (see stale).
 * Ends the boot (html.booting) once the first frames are on screen, so stars, nav and hero appear together.
 */
export default function StarField() {
  const { UI } = useContent();
  const [setup, setSetup] = useState<Setup | null>(null);
  const reduce = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  // first build after fonts + one frame (the viewport is final by then)
  useEffect(() => {
    let cancelled = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() =>
      requestAnimationFrame(() => {
        if (!cancelled) setSetup(generate());
      }),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setSetup((cur) => (cur && stale(cur) ? generate() : cur)), 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // two frames rendered → end the boot (the intro title card, if any, holds it until it lifts away)
  useEffect(() => {
    if (!setup) return;
    let r2 = 0;
    let t = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
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

  // render loop only while the tab is visible
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const on = () => setVisible(document.visibilityState === "visible");
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  // below the hero the whole layer dims a little (opacity only: no CSS filter on a full-screen layer)
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onScroll = () => {
      el.style.opacity = String(1 - dimAt() * 0.35);
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
    <div ref={wrap} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[1] h-lvh w-screen">
      <div className="scene-fade h-full w-full">
        <Canvas
          // linear + flat: no colour management / tone mapping (colours as authored)
          linear
          flat
          dpr={[1, 1.5]}
          frameloop={visible ? "always" : "never"}
          camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 10] }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor("#05070d", 1)}
          style={{ pointerEvents: "none" }}
          fallback={<p className="fixed inset-x-4 bottom-20 text-center text-[13px] text-grey">{UI.noWebgl}</p>}
        >
          {setup && <Field setup={setup} reduce={reduce} />}
        </Canvas>
      </div>
    </div>
  );
}
