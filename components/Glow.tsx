"use client";

import { useEffect, useRef, useState } from "react";
import { useContent } from "./Lang";

/**
 * Background test (branch bg-gradient): a quiet mesh of coloured light on the deep page black, one full-screen
 * fragment shader (WebGL2). Three soft lights drift slowly; the main one leans towards the cursor, the hues follow
 * the section on screen (hero violet, process teal, work coral, pricing violet, contact teal), fast scrolling and a
 * click make it breathe a little brighter. Kept dark on purpose: the copy always reads first.
 * Same boot handshake as StarField: two frames on screen → fade in, then html.booting may end.
 */

const VERT = `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uRes;     // device px
uniform float uTime;
uniform vec2 uMouse;   // 0..1, y down
uniform float uMouseOn;
uniform vec3 uA;       // main light colour
uniform vec3 uB;       // second light colour
uniform float uEnergy; // 0..1 scroll speed / click
uniform float uDim;

float blob(vec2 p, vec2 c, vec2 r) {
  vec2 d = (p - c) / r;
  return exp(-dot(d, d));
}
// tiny hash for dithering (kills banding in the dark gradient; invisible as texture)
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float t = uTime;

  // three lights on slow Lissajous paths
  vec2 c1 = vec2((0.62 + 0.10 * sin(t * 0.11)) * asp, 0.55 + 0.10 * cos(t * 0.09));
  vec2 m = vec2(uMouse.x * asp, uMouse.y);
  c1 = mix(c1, m, 0.38 * uMouseOn);            // leans towards the cursor
  vec2 c2 = vec2((0.28 + 0.08 * cos(t * 0.07)) * asp, 0.30 + 0.12 * sin(t * 0.08));
  vec2 c3 = vec2((0.85 + 0.06 * sin(t * 0.05 + 1.3)) * asp, 0.95 + 0.06 * cos(t * 0.06));

  float breathe = 1.0 + 0.06 * sin(t * 0.35) + 0.35 * uEnergy;
  float w1 = blob(p, c1, vec2(0.62, 0.52) * breathe);
  float w2 = blob(p, c2, vec2(0.55, 0.45));
  float w3 = blob(p, c3, vec2(0.50, 0.38));

  vec3 bg = vec3(0.0196, 0.0275, 0.051);   // #05070d
  vec3 col = bg;
  col += uA * w1 * 0.36;
  col += uB * w2 * 0.20;
  col += mix(uA, uB, 0.5) * w3 * 0.12;
  // a warm core where the main light is strongest, like the reference but much quieter
  col += vec3(1.0, 0.55, 0.6) * pow(w1, 3.0) * 0.05;

  col = mix(bg, col, 1.0 - uDim * 0.2);
  col += (hash(gl_FragCoord.xy + t) - 0.5) / 255.0;
  o = vec4(col, 1.0);
}`;

const DPR_MAX = 1;
const dimAt = () => Math.min(1, Math.max(0, (window.scrollY - window.innerHeight * 0.25) / (window.innerHeight * 0.65)));

/** colours per home section: [main, second] */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const TONES: Record<string, [number[], number[]]> = {
  top: [hex("#8b5cf6"), hex("#3d8bff")],
  process: [hex("#2dd4bf"), hex("#3d8bff")],
  work: [hex("#fb7185"), hex("#8b5cf6")],
  services: [hex("#8b5cf6"), hex("#3d8bff")],
  contact: [hex("#2dd4bf"), hex("#8b5cf6")],
};
const IDS = Object.keys(TONES);

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

export default function Glow() {
  const { UI } = useContent();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
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
    const u = { res: U("uRes"), time: U("uTime"), mouse: U("uMouse"), mouseOn: U("uMouseOn"), a: U("uA"), b: U("uB"), energy: U("uEnergy"), dim: U("uDim") };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    // the gradient is soft: rendering it at half resolution and letting the browser upscale looks identical and is cheap
    const SCALE = 0.5;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX) * SCALE;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    size();

    const mouse = { x: 0.6, y: 0.5, tx: 0.6, ty: 0.5, on: 0, ton: 0 };
    const onMove = (e: PointerEvent) => {
      if (!fine) return;
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = e.clientY / window.innerHeight;
      mouse.ton = 1;
    };
    const onLeave = () => (mouse.ton = 0);
    let energy = 0;
    const onDown = () => {
      if (!reduce) energy = Math.min(1, energy + 0.6);
    };
    let lastY = window.scrollY;
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    // the section in the middle of the screen sets the target hues
    const tone = { a: [...TONES.top[0]], b: [...TONES.top[1]] };
    const pick = () => {
      const mid = window.innerHeight / 2;
      for (const id of IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) return TONES[id];
      }
      return TONES.top;
    };

    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    let frames = 0;
    let bootT = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const k = 1 - Math.exp(-dt * 2.2);
      mouse.x += (mouse.tx - mouse.x) * k;
      mouse.y += (mouse.ty - mouse.y) * k;
      mouse.on += (mouse.ton - mouse.on) * k;
      const [ta, tb] = pick();
      const kc = 1 - Math.exp(-dt * 1.2);
      for (let i = 0; i < 3; i++) {
        tone.a[i] += (ta[i] - tone.a[i]) * kc;
        tone.b[i] += (tb[i] - tone.b[i]) * kc;
      }
      const y = window.scrollY;
      if (!reduce) energy = Math.min(1, energy + Math.min(0.08, Math.abs(y - lastY) / 4000));
      lastY = y;
      energy *= Math.exp(-dt * 1.5);

      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, reduce ? 20 : (now - t0) / 1000);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.mouseOn, mouse.on);
      gl.uniform3f(u.a, tone.a[0], tone.a[1], tone.a[2]);
      gl.uniform3f(u.b, tone.b[0], tone.b[1], tone.b[2]);
      gl.uniform1f(u.energy, energy);
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
    window.addEventListener("resize", size);
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
      window.removeEventListener("resize", size);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[1] h-lvh w-screen">
      <div className="scene-fade h-full w-full" data-on={on || undefined}>
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
      {failed && <p className="fixed inset-x-4 bottom-20 text-center text-xs text-grey">{UI.noWebgl}</p>}
    </div>
  );
}
