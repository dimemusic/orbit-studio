"use client";

import { useEffect, useRef, useState } from "react";
import { useContent } from "./Lang";

/**
 * Background test (branch bg-test): a living topographic map. Contour lines of a slowly drifting height field,
 * drawn as hairlines in one full-screen fragment shader (WebGL2). Every fifth line is an index contour, a little
 * brighter, like on a real survey map. The cursor raises a hill (the lines bend into rings around it and pick up the
 * brand blue), a click sends a ripple. The map scrolls with the page at half speed; below the hero it dims.
 * Same boot handshake as StarField: two frames on screen → fade in, then html.booting may end.
 */

const VERT = `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uRes;      // canvas size, device px
uniform float uDpr;
uniform float uTime;
uniform float uScroll;  // css px
uniform vec2 uMouse;    // css px, page space (y down)
uniform float uMouseOn;
uniform vec3 uPulse;    // x, y (css px), age in s (<0 = none)
uniform float uDim;

// 2D simplex noise (Ashima / Stefan Gustavson, MIT)
vec3 perm(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = perm(perm(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float height(vec2 p, float t) {
  // gentle domain warp: the terrain breathes instead of sliding
  vec2 w = vec2(snoise(p * 0.6 + vec2(0.0, t * 0.05)), snoise(p * 0.6 + vec2(5.2, -t * 0.04)));
  vec2 q = p + 0.35 * w;
  float h = 0.62 * snoise(q + vec2(t * 0.012, 0.0));
  h += 0.22 * snoise(q * 1.9 - vec2(0.0, t * 0.02));
  h += 0.04 * snoise(q * 3.7 + 3.1);
  return h;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;  // css px, y down
  vec2 world = px + vec2(0.0, uScroll * 0.5);
  float unit = 760.0;
  vec2 p = world / unit;

  float h = height(p, uTime);

  // cursor hill
  vec2 dm = (px - uMouse) / 260.0;
  float hill = exp(-dot(dm, dm)) * uMouseOn;
  h += 0.42 * hill;

  // click ripple: one ring running outwards
  if (uPulse.z >= 0.0) {
    float r = length(px - uPulse.xy);
    float front = uPulse.z * 520.0;
    float ring = exp(-pow((r - front) / 70.0, 2.0)) * exp(-uPulse.z * 1.6);
    h += 0.22 * ring;
  }

  float levels = 9.0;
  float v = h * levels;
  float fw = fwidth(v);
  float d = abs(fract(v - 0.5) - 0.5) / max(fw, 1e-4);   // distance to the nearest line, in px
  float line = 1.0 - smoothstep(0.35, 1.25, d);
  // index contours: every fifth line
  float vi = v / 5.0;
  float di = abs(fract(vi - 0.5) - 0.5) / max(fwidth(vi), 1e-4);
  float index = 1.0 - smoothstep(0.5, 1.6, di);

  float a = line * 0.075 + index * 0.085;
  a *= 1.0 + hill * 1.6;
  a *= 1.0 - uDim * 0.45;

  vec3 bg = vec3(0.0196, 0.0275, 0.051);           // #05070d
  vec3 ink = mix(vec3(0.86, 0.9, 1.0), vec3(0.24, 0.55, 1.0), clamp(hill * 1.3, 0.0, 1.0));  // → brand blue at the cursor
  o = vec4(bg + ink * a, 1.0);
}`;

const DPR_MAX = 1.5;
const dimAt = () => Math.min(1, Math.max(0, (window.scrollY - window.innerHeight * 0.25) / (window.innerHeight * 0.65)));

function compile(gl: WebGL2RenderingContext) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  return p;
}

export default function Topo() {
  const { UI } = useContent();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, powerPreference: "high-performance" });
    if (!gl) return setFailed(true);
    let prog: WebGLProgram;
    try {
      prog = compile(gl);
    } catch {
      return setFailed(true);
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = { res: U("uRes"), dpr: U("uDpr"), time: U("uTime"), scroll: U("uScroll"), mouse: U("uMouse"), mouseOn: U("uMouseOn"), pulse: U("uPulse"), dim: U("uDim") };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    size();

    // the hill follows the cursor with a soft lag and fades in / out
    const target = { x: -9999, y: -9999, on: 0 };
    const cur = { x: -9999, y: -9999, on: 0 };
    let pulse = { x: 0, y: 0, t: -1 };
    const onMove = (e: PointerEvent) => {
      if (!fine) return;
      if (cur.on < 0.01) {
        cur.x = e.clientX;
        cur.y = e.clientY;
      }
      target.x = e.clientX;
      target.y = e.clientY;
      target.on = 1;
    };
    const onLeave = () => (target.on = 0);
    const onDown = (e: PointerEvent) => {
      if (reduce) return;
      const t = e.target as Element | null;
      if (t?.closest("a, button, input, textarea, label, select, dialog, .card")) return;
      pulse = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    let frames = 0;
    let bootT = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const k = 1 - Math.exp(-dt * 7);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      cur.on += (target.on - cur.on) * (1 - Math.exp(-dt * 3));
      const age = pulse.t < 0 ? -1 : (now - pulse.t) / 1000;
      if (age > 2.5) pulse.t = -1;

      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.time, reduce ? 12 : (now - t0) / 1000);
      gl.uniform1f(u.scroll, window.scrollY);
      gl.uniform2f(u.mouse, cur.x, cur.y);
      gl.uniform1f(u.mouseOn, cur.on);
      gl.uniform3f(u.pulse, pulse.x, pulse.y, age);
      gl.uniform1f(u.dim, dimAt());
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (++frames === 2) {
        setOn(true);
        const wait = Math.max(0, ((window as { __introEnd?: number }).__introEnd ?? 0) - performance.now());
        bootT = window.setTimeout(() => document.documentElement.classList.remove("booting"), wait);
      }
    };
    const play = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (document.visibilityState === "visible") raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", play);
    play();

    const onResize = () => size();
    window.addEventListener("resize", onResize);
    const onScroll = () => {
      if (wrap.current) wrap.current.style.opacity = String(1 - dimAt() * 0.25);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(bootT);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", play);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[1] h-lvh w-screen">
      <div className="scene-fade h-full w-full" data-on={on || undefined}>
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
      {failed && <p className="fixed inset-x-4 bottom-20 text-center text-xs text-grey">{UI.noWebgl}</p>}
    </div>
  );
}
