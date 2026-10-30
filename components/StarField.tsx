"use client";

import { useEffect, useRef, useState } from "react";
import { starFragment, starVertex } from "@/lib/starShaders";
import { buildStars, type Stars } from "@/lib/stars";
import { useContent } from "./Lang";

/**
 * Fixed full-screen star field behind the whole site (client only, see Scene.tsx).
 * Plain WebGL, no 3D library: one draw call of additive point sprites (lib/stars.ts, lib/starShaders.ts),
 * so the background costs a few KB instead of a 3D engine. One screen of stars, generated for the viewport
 * and regenerated when it goes stale (see `stale`); the shader scrolls and wraps it with the page.
 * Once two frames are on screen the stars fade in and the boot may end (html.booting, see Shell).
 */

const FOV = (45 * Math.PI) / 180;
const TAN = Math.tan(FOV / 2);
const DPR_MAX = 1.5;

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
  const visH = 2 * TAN * camZ; // world units per viewport height at z = 0
  return { stars: buildStars({ visW: visH * aspect, visH, small }), camZ, visH, width: w, aspect, small };
}

/**
 * The field of view is vertical, so a lower window shows more of the world on the sides.
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

// ---- small column-major 4×4 helpers (no allocations per frame: they write into `out`) ----
const perspective = (out: Float32Array, aspect: number, near: number, far: number) => {
  const f = 1 / TAN;
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
};
/** rotation X then Y (Euler XYZ, as the old scene graph did): out = Rx · Ry */
const rotXY = (out: Float32Array, x: number, y: number) => {
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y);
  out.set([cy, sx * sy, -cx * sy, 0, 0, cx, sx, 0, sy, -sx * cy, cx * cy, 0, 0, 0, 0, 1]);
};

const VERT_HEAD = "precision highp float;\nuniform mat4 modelMatrix, viewMatrix, projectionMatrix;\nattribute vec3 position;\n";
const FRAG_HEAD = "precision mediump float;\n";
const UNIFORMS = ["uTime", "uMotion", "uPulse", "uMouseOn", "uDPR", "uScroll", "uFieldH", "uCamZ", "uDim", "uPulseOrigin", "uMouse", "modelMatrix", "viewMatrix", "projectionMatrix"] as const;
type U = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;

function program(gl: WebGLRenderingContext) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT_HEAD + starVertex));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG_HEAD + starFragment));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "star shader");
  const u = Object.fromEntries(UNIFORMS.map((n) => [n, gl.getUniformLocation(p, n)])) as U;
  return { p, u };
}

export default function StarField() {
  const { UI } = useContent();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // antialias ON: the stars are 1-4 px sprites; without multisampling they snap from pixel to pixel while the page
    // scrolls and the whole background shimmers (looked like the site shaking on DPR 1 screens)
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true, depth: false, powerPreference: "high-performance" });
    if (!gl) return setFailed(true);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let prog: ReturnType<typeof program>;
    try {
      prog = program(gl);
    } catch {
      return setFailed(true);
    }
    const { u } = prog;
    gl.useProgram(prog.p);
    // #05070d converted to linear light, exactly what the previous renderer cleared to (keeps the same deep black)
    const lin = (c: number) => Math.pow(c / 255, 2.2);
    gl.clearColor(lin(0x05), lin(0x07), lin(0x0d), 1);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive
    gl.uniform1f(u.uMotion, reduce ? 0 : 1);

    // attributes: one buffer each, re-filled when the field is regenerated
    const attrs = (["position", "aColor", "aSeed", "aTwinkle"] as const).map((name, i) => ({
      loc: gl.getAttribLocation(prog.p, name),
      size: i < 2 ? 3 : 1,
      buf: gl.createBuffer(),
    }));
    let setup: Setup | null = null;
    const upload = (s: Setup) => {
      setup = s;
      const data = [s.stars.position, s.stars.color, s.stars.seed, s.stars.twinkle];
      attrs.forEach((a, i) => {
        if (a.loc < 0) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, a.buf);
        gl.bufferData(gl.ARRAY_BUFFER, data[i], gl.STATIC_DRAW);
        gl.enableVertexAttribArray(a.loc);
        gl.vertexAttribPointer(a.loc, a.size, gl.FLOAT, false, 0, 0);
      });
      gl.uniform1f(u.uFieldH, s.visH + 0.8);
      gl.uniform1f(u.uCamZ, s.camZ);
      const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -s.camZ, 1]);
      gl.uniformMatrix4fv(u.viewMatrix, false, view);
      size();
    };

    // canvas size follows its box (full viewport, lvh), DPR capped
    const proj = new Float32Array(16);
    let aspect = 1;
    let dpr = 1;
    function size() {
      const r = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
      canvas!.width = Math.max(1, Math.round(r.width * dpr));
      canvas!.height = Math.max(1, Math.round(r.height * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      aspect = r.width / Math.max(1, r.height);
      perspective(proj, aspect, 0.1, 100);
      gl!.uniformMatrix4fv(u.projectionMatrix, false, proj);
      gl!.uniform1f(u.uDPR, dpr);
    }

    // input: listeners on window (the canvas ignores pointer events)
    const st = { client: null as [number, number] | null, on: 0, tiltX: 0, tiltY: 0 };
    /** pointer → point on the z = 0 plane (camera on the z axis looking down -z) */
    const toPlane = (cx: number, cy: number, out: [number, number]) => {
      const camZ = setup?.camZ ?? 10;
      out[0] = ((cx / window.innerWidth) * 2 - 1) * TAN * aspect * camZ;
      out[1] = (-(cy / window.innerHeight) * 2 + 1) * TAN * camZ;
    };
    const pulse = { v: 0, at: [99, 99] as [number, number] };
    const onMove = (e: PointerEvent) => {
      st.client = [e.clientX, e.clientY];
      st.on = 1;
      st.tiltX = -((e.clientY / window.innerHeight) * 2 - 1) * 0.05;
      st.tiltY = ((e.clientX / window.innerWidth) * 2 - 1) * 0.08;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return;
      toPlane(e.clientX, e.clientY, pulse.at);
      pulse.v = 1;
    };
    const onLeave = () => {
      st.on = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    // render loop (paused while the tab is hidden); scratch values live here, nothing is allocated per frame
    const model = new Float32Array(16);
    const mouse: [number, number] = [999, 999];
    const target: [number, number] = [0, 0];
    let mouseOn = 0;
    let rotX = 0;
    let rotY = 0;
    let raf = 0;
    let last = 0;
    let frames = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!setup) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      const s = setup as Setup;
      pulse.v = Math.max(0, pulse.v - dt * 0.55);
      if (st.client) {
        toPlane(st.client[0], st.client[1], target);
        const k = Math.min(1, dt * 10);
        mouse[0] += (target[0] - mouse[0]) * k;
        mouse[1] += (target[1] - mouse[1]) * k;
      }
      mouseOn += (st.on - mouseOn) * Math.min(1, dt * 5);
      if (!reduce) {
        const k = Math.min(1, dt * 3);
        rotX += (st.tiltX - rotX) * k;
        rotY += (st.tiltY - rotY) * k;
      }
      rotXY(model, rotX, rotY);

      gl.uniform1f(u.uTime, (now - t0) / 1000);
      // the stars follow the page scroll in the same frame (no easing: an eased lag made the background trail the
      // content and the page read as low-fps)
      gl.uniform1f(u.uScroll, (window.scrollY / window.innerHeight) * s.visH);
      gl.uniform1f(u.uPulse, pulse.v);
      gl.uniform3f(u.uPulseOrigin, pulse.at[0], pulse.at[1], 0);
      gl.uniform3f(u.uMouse, mouse[0], mouse[1], 0);
      gl.uniform1f(u.uMouseOn, mouseOn);
      gl.uniform1f(u.uDim, dimAt());
      gl.uniformMatrix4fv(u.modelMatrix, false, model);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, s.stars.count);

      // two frames on screen → the stars fade in and the boot may end (the intro card, if any, holds it until it lifts away)
      if (++frames === 2) {
        setOn(true);
        const wait = Math.max(0, ((window as { __introEnd?: number }).__introEnd ?? 0) - performance.now());
        bootT = window.setTimeout(() => document.documentElement.classList.remove("booting"), wait);
      }
    };
    let bootT = 0;
    const play = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (document.visibilityState === "visible") raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", play);

    // first build after fonts + one frame (the viewport is final by then)
    let cancelled = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() =>
      requestAnimationFrame(() => {
        if (cancelled) return;
        upload(generate());
        play();
      }),
    );

    // resize: canvas always; the star field only when it went stale
    let resizeT: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (!setup) return;
      size();
      clearTimeout(resizeT);
      resizeT = setTimeout(() => setup && stale(setup) && upload(generate()), 200);
    };
    window.addEventListener("resize", onResize);

    // below the hero the whole layer dims a little (opacity only: no CSS filter on a full-screen layer)
    const onScroll = () => {
      if (wrap.current) wrap.current.style.opacity = String(1 - dimAt() * 0.35);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // a lost GPU context (driver reset, too many tabs) just stops the stars; the page stays usable
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      clearTimeout(bootT);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", play);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("webglcontextlost", onLost);
      attrs.forEach((a) => gl.deleteBuffer(a.buf));
      gl.deleteProgram(prog.p);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[1] h-lvh w-screen">
      <div className="scene-fade h-full w-full" data-on={on || undefined}>
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
      {failed && <p className="fixed inset-x-4 bottom-20 text-center text-[13px] text-grey">{UI.noWebgl}</p>}
    </div>
  );
}
