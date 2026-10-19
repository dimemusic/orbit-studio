"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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

type IvyProps = { setup: Setup; reduce: boolean };

function Ivy({ setup, reduce }: IvyProps) {
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
    }),
    [reduce],
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

  // camera distance depends on aspect at generation time (as in the prototype)
  useEffect(() => {
    camera.position.z = camZ;
    camera.updateProjectionMatrix();
  }, [camera, camZ]);

  // ---------- input: listeners on window, the canvas itself ignores pointer events ----------
  const input = useRef({ client: null as [number, number] | null, onTarget: 0, tiltX: 0, tiltY: 0 });
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const st = input.current;

    const onMove = (ev: PointerEvent) => {
      st.client = [ev.clientX, ev.clientY];
      st.onTarget = 1;
      st.tiltX = -((ev.clientY / window.innerHeight) * 2 - 1) * 0.05;
      st.tiltY = ((ev.clientX / window.innerWidth) * 2 - 1) * 0.08;
    };
    const onDown = (ev: PointerEvent) => {
      const target = ev.target as Element | null;
      if (target?.closest?.(INTERACTIVE)) return;
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
  }, [camera, uniforms]);

  // ---------- loop ----------
  const loop = useRef({
    camY: 0,
    /** new page: snap the camera and restart growth from the top of the current view */
    fresh: true,
    ray: new THREE.Raycaster(),
    ndc: new THREE.Vector2(),
    hit: new THREE.Vector3(),
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
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
    u.uPulse.value = Math.max(0, u.uPulse.value - dt * 0.55);

    // the ivy is attached to the page: camera follows scroll 1:1
    const targetY = -(window.scrollY / window.innerHeight) * visH;
    // hero field → ivy: follows scroll over the first 0.9 screen, smoothed and reversible
    const morphTarget = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
    if (L.fresh) {
      // growth is one-way per page: each route starts again, already grown above the visible screen
      L.fresh = false;
      L.camY = targetY;
      u.uGrow.value = Math.max(0, -targetY);
      u.uMorph.value = morphTarget;
    }
    u.uMorph.value = reduce ? morphTarget : u.uMorph.value + (morphTarget - u.uMorph.value) * Math.min(1, dt * 4);
    // ivy lines fade in once the field is half-way into the roots
    u.uIvy.value = Math.min(1, Math.max(0, (u.uMorph.value - 0.45) / 0.5));
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
  });

  return (
    <group ref={group}>
      <points geometry={pointsGeo} material={pointsMat} frustumCulled={false} />
      <lineSegments geometry={linesGeo} material={linesMat} frustumCulled={false} />
      <points geometry={fieldGeo} material={fieldMat} frustumCulled={false} />
    </group>
  );
}

export default function IvyScene() {
  const [setup, setSetup] = useState<Setup | null>(null);
  const setupRef = useRef<Setup | null>(null);
  const pathname = usePathname();
  const routeRef = useRef(pathname);
  routeRef.current = pathname;
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

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

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-0 h-lvh w-screen">
        <Canvas
          // linear + flat: no colour management / tone mapping, matching the r128 prototype's colours
          linear
          flat
          dpr={[1, 2]}
          camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 10] }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor("#05070d", 1)}
          style={{ pointerEvents: "none" }}
          fallback={<p className="fixed inset-x-4 bottom-20 text-center text-[13px] text-grey">Цей браузер не підтримує WebGL.</p>}
        >
          {setup && <Ivy setup={setup} reduce={reduce} />}
        </Canvas>
      </div>
    </>
  );
}
