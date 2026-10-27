// Star field shaders. Additive sprites; hover brightens nearby stars (no displacement), a click sends an impulse wave.

export const starVertex = /* glsl */ `
uniform float uTime, uMotion, uPulse, uMouseOn, uDPR, uScroll, uFieldH, uCamZ;
/** 0 in the hero → 1 below it: stars only dim (never grow: bigger sprites = additive overdraw = slow site) */
uniform float uDim;
uniform vec3 uPulseOrigin, uMouse;
attribute vec3 aColor;
attribute float aSeed;
attribute float aTwinkle;
varying vec3 vCol;
varying float vA;

const vec3 BRAND = vec3(0.239, 0.545, 1.0); // #3d8bff

void main() {
  float t = uTime * uMotion;

  // scrolls with the page (nearer stars a bit faster = parallax) and wraps vertically
  vec3 p = position;
  float sc = (uCamZ - p.z) / uCamZ;
  float near = clamp((p.z + 5.0) / 7.5, 0.0, 1.0);
  float period = uFieldH * sc;
  p.y = mod(p.y + uScroll * sc * mix(0.55, 1.0, near) + period * 0.5, period) - period * 0.5;
  // slow drift
  p += 0.06 * vec3(sin(t * 0.9 + p.y * 2.1 + aSeed * 6.28), cos(t * 0.7 + p.x * 1.9), sin(t * 0.8 + p.z * 2.3 + aSeed * 3.0));
  p += 0.18 * vec3(sin(t * 0.21 + aSeed * 6.28), cos(t * 0.17 + aSeed * 4.0), sin(t * 0.13 + aSeed * 9.0));

  vec4 w = modelMatrix * vec4(p, 1.0);
  // impulse wave from the last click
  float band = uPulse * smoothstep(1.5, 0.0, abs(length(w.xy - uPulseOrigin.xy) - (1.0 - uPulse) * 11.0));
  w.z += band * 0.5;
  vec4 mv = viewMatrix * w;
  gl_Position = projectionMatrix * mv;

  float hov = uMouseOn * smoothstep(2.2, 0.0, length(w.xy - uMouse.xy));
  float hot = clamp(band, 0.0, 1.0);
  float tw = 0.85 + 0.15 * sin(uTime * 1.5 + aTwinkle * 30.0) * uMotion;

  gl_PointSize = (18.0 + aSeed * 24.0 + hov * 14.0) * uDPR / -mv.z;
  vA = (0.45 + 0.55 * smoothstep(-5.0, 2.5, w.z)) * 1.25 * (1.0 + hov * 1.6) * tw * (1.0 - uDim * 0.45);

  // half brand blue, half the star's own hue; the wave and the cursor lift it towards white
  vec3 tint = mix(BRAND, min(aColor * 1.85, vec3(1.0)), 0.55);
  vCol = mix(tint * (1.0 + hov * 0.9), vec3(1.0), hot * 0.85 + 0.12);
}
`;

export const starFragment = /* glsl */ `
varying vec3 vCol;
varying float vA;

void main() {
  float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
  gl_FragColor = vec4(vCol, a * a * vA);
}
`;
