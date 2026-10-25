// Ivy shaders, ported 1:1 from reference/ivy-scene.html.
// Hover only brightens (no displacement, no hole/ring); click sends an impulse wave.
// Hero: a breathing field morphs into the top of the ivy (uMorph); lines fade in after it (uIvy).

/** Shared by particles and lines: uniforms, hover, sway field, impulse wave. */
export const ivyCommon = /* glsl */ `
uniform float uTime, uMotion, uGrow, uPulse, uMouseOn, uMorph, uIvy;
uniform vec3 uPulseOrigin, uMouse;

float hoverAt(vec4 w) { return uMouseOn * smoothstep(2.2, 0.0, length(w.xy - uMouse.xy)); }

// continuous sway field: everything at the same spot moves together,
// so stems, lines and leaves stay attached
vec3 sway(vec3 p, float depth) {
  float t = uTime * uMotion;
  float amp = 0.03 + depth * 0.035;
  return vec3(sin(p.y * 0.9 + t * 0.5), cos(p.x * 0.7 + t * 0.4), sin((p.x + p.y) * 0.5 + t * 0.3)) * amp;
}

float waveAt(inout vec4 w) {
  float pd = length(w.xy - uPulseOrigin.xy);
  float front = (1.0 - uPulse) * 11.0;
  float band = uPulse * smoothstep(1.5, 0.0, abs(pd - front));
  w.z += band * 0.5;
  return band;
}
`;

export const ivyPointsVertex = /* glsl */ `
${ivyCommon}
uniform float uDPR;
attribute float aBirth;
attribute vec3 aColor;
attribute float aDepth;
attribute float aSeed;
attribute float aClaimed;
attribute float aTop;
varying vec3 vCol;
varying float vA;
varying float vHot;
varying float vHov;

void main() {
  vec3 p = position + sway(position, aDepth);
  vec4 w = modelMatrix * vec4(p, 1.0);
  float band = waveAt(w);
  vec4 mv = viewMatrix * w;
  gl_Position = projectionMatrix * mv;
  float on = smoothstep(aBirth, aBirth + 0.35, uGrow);
  float fresh = 1.0 - smoothstep(0.0, 1.6, uGrow - aBirth);
  float hov = hoverAt(w);
  vHot = clamp(fresh * on + band, 0.0, 1.0);
  vHov = hov;
  float twinkle = 0.8 + 0.2 * sin(uTime * 1.5 + aSeed * 30.0);
  gl_PointSize = (20.0 + aSeed * 28.0 + vHot * 16.0 + hov * 14.0) * on * uDPR / -mv.z;
  vA = on * twinkle * (0.55 + 0.55 * smoothstep(-3.0, 2.0, w.z)) * (1.0 + hov * 1.6);
  // a hero field point lands exactly here and takes over this particle
  vA *= 1.0 - aClaimed;
  // top particles no dust point reached fade in as the dust lands
  vA *= mix(1.0, uIvy, aTop);
  vCol = aColor;
}
`;

export const ivyPointsFragment = /* glsl */ `
varying vec3 vCol;
varying float vA;
varying float vHot;
varying float vHov;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  // hover brightens in the particle's own colour
  vec3 col = mix(vCol * (1.85 + vHov * 1.6), vec3(1.0), vHot * 0.45 + vHov * 0.12);
  gl_FragColor = vec4(col, a * vA);
}
`;

export const ivyLinesVertex = /* glsl */ `
${ivyCommon}
attribute float aBirth;
attribute vec3 aColor;
attribute float aDepth;
attribute float aEnd;
varying vec3 vCol;
varying float vA;

void main() {
  vec3 p = position + sway(position, aDepth);
  vec4 w = modelMatrix * vec4(p, 1.0);
  float band = waveAt(w);
  gl_Position = projectionMatrix * viewMatrix * w;
  float b = aBirth + aEnd * 0.12;
  float on = smoothstep(b, b + 0.08, uGrow);
  float fresh = 1.0 - smoothstep(0.0, 1.2, uGrow - aBirth);
  float hov = hoverAt(w);
  // lines as quiet as the prototype (base 0.5); brightness lives in the particles
  vA = on * (0.5 + fresh * 0.8 + band + hov * 2.6) * uIvy;
  vCol = aColor;
}
`;

export const ivyLinesFragment = /* glsl */ `
varying vec3 vCol;
varying float vA;

void main() { gl_FragColor = vec4(vCol, vA); }
`;

/**
 * Hero field: sparse drifting dust over the first screen. Each point morphs (staggered) to its ivy particle:
 * small arc toward the camera, lands on aTarget + sway, and at m = 1 matches that particle exactly
 * (size, colour, alpha, twinkle; aMult splits brightness between points sharing a target). No fade.
 */
export const ivyFieldVertex = /* glsl */ `
${ivyCommon}
uniform float uDPR;
uniform float uScroll;
uniform float uFieldH;
uniform float uCamZ;
/** 0 in the hero → 1 below it: stars go softly out of focus (bigger, dimmer sprites) instead of a CSS blur */
uniform float uDefocus;
attribute vec3 aTarget;
attribute vec3 aColor;
attribute float aDepth;
attribute float aSeed;
attribute float aStagger;
attribute float aMult;
varying vec3 vCol;
varying float vA;

const vec3 FIELD_COL = vec3(0.239, 0.545, 1.0); // #3d8bff
float ease(float x) { x = clamp(x, 0.0, 1.0); return x * x * (3.0 - 2.0 * x); }

void main() {
  float m = ease((uMorph - aStagger * 0.2) / 0.6);
  float f = 1.0 - m;
  float t = uTime * uMotion;

  // drifting dust; scrolls with the page (nearer stars a bit faster = parallax) and wraps vertically
  vec3 fp = position;
  float sc = (uCamZ - fp.z) / uCamZ;
  float near = clamp((fp.z + 5.0) / 7.5, 0.0, 1.0);
  float period = uFieldH * sc;
  fp.y = mod(fp.y + uScroll * sc * mix(0.55, 1.0, near) + period * 0.5, period) - period * 0.5;
  fp += f * 0.06 * vec3(sin(t * 0.9 + fp.y * 2.1 + aStagger * 6.28), cos(t * 0.7 + fp.x * 1.9), sin(t * 0.8 + fp.z * 2.3 + aStagger * 3.0));
  fp += vec3(sin(t * 0.21 + aStagger * 6.28), cos(t * 0.17 + aStagger * 4.0), sin(t * 0.13 + aStagger * 9.0)) * 0.18;

  // lands where the ivy particle is, swaying with it
  vec3 p = mix(fp, aTarget + sway(aTarget, aDepth), m);
  p.z += sin(m * 3.14159265) * 0.8;

  vec4 w = modelMatrix * vec4(p, 1.0);
  float band = waveAt(w);
  vec4 mv = viewMatrix * w;
  gl_Position = projectionMatrix * mv;

  float hov = hoverAt(w);
  float hot = clamp(band, 0.0, 1.0);
  float twinkle = 0.8 + 0.2 * sin(uTime * 1.5 + aSeed * 30.0);

  float sizeField = 18.0 + aStagger * 24.0 + hov * 14.0;
  float sizeIvy = 20.0 + aSeed * 28.0 + hot * 16.0 + hov * 14.0; // = ivy particle size
  // defocus (≈ the old 7px CSS blur, without a full-screen filter): the sprite grows by up to 14 CSS px and
  // its alpha drops with the area, so the same light spreads into a faint soft glow
  float s0 = mix(sizeField, sizeIvy, m) * uDPR / -mv.z;
  float s1 = s0 + uDefocus * 14.0 * uDPR;
  gl_PointSize = s1;
  float spread = (s0 * s0) / (s1 * s1);

  float aField = (0.45 + 0.55 * smoothstep(-5.0, 2.5, w.z)) * 1.25 * (1.0 + hov * 1.6);
  float aIvy = twinkle * (0.55 + 0.55 * smoothstep(-3.0, 2.0, w.z)) * (1.0 + hov * 1.6) * aMult; // = ivy particle alpha
  vA = mix(aField, aIvy, m) * spread;

  // dust takes a soft tint of the ivy colour it will become (half brand blue, half its own hue)
  vec3 tint = mix(FIELD_COL, min(aColor * 1.85, vec3(1.0)), 0.55);
  vec3 cField = mix(tint * (1.0 + hov * 0.9), vec3(1.0), hot * 0.85 + 0.12);
  vec3 cIvy = mix(aColor * (1.85 + hov * 1.6), vec3(1.0), hot * 0.45); // = ivy particle colour
  vCol = mix(cField, cIvy, m);
}
`;

export const ivyFieldFragment = /* glsl */ `
varying vec3 vCol;
varying float vA;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(vCol, a * vA);
}
`;
