// Star field: the whole page background. Sparse dust spread through the depth of one screen;
// the shader scrolls it with the page (nearer stars faster) and wraps it vertically, so one screen is enough.

export type Stars = {
  position: Float32Array;
  color: Float32Array;
  /** 0..1 per star: size, drift phase and brightness */
  seed: Float32Array;
  /** 0..1 per star: twinkle phase */
  twinkle: Float32Array;
  count: number;
};

/** brand hues the stars are tinted with: blue, cyan, violet, teal */
const HUES: [number, number, number][] = [
  [0x3d / 255, 0x8b / 255, 1],
  [0x22 / 255, 0xd3 / 255, 0xee / 255],
  [0x8b / 255, 0x5c / 255, 0xf6 / 255],
  [0x2d / 255, 0xd4 / 255, 0xbf / 255],
];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** visW / visH: the view size in world units at z = 0; small: phones (fewer stars) */
export function buildStars({ visW, visH, small }: { visW: number; visH: number; small: boolean }): Stars {
  const count = small ? 2400 : 4300;
  const camZ = visH / (2 * Math.tan((22.5 * Math.PI) / 180));
  const position = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const twinkle = new Float32Array(count);
  // rejection sampling: small (low seed) and far (dim) stars are mostly dropped, bright ones stay;
  // the middle of the screen around the hero buttons is thinned so no dense cluster sits behind them
  for (let i = 0; i < count; ) {
    const z = rnd(-5, 2.5);
    const spread = (camZ - z) / camZ; // wider further back, so the screen stays covered
    let ux = Math.random() * 2 - 1;
    ux = Math.sign(ux) * Math.pow(Math.abs(ux), 0.8);
    const uy = Math.pow(Math.random(), 0.85) * 2 - 1; // a bit denser towards the bottom
    const s = Math.random();
    if (Math.random() > 0.15 + 0.85 * (0.5 * s + 0.5 * ((z + 5) / 7.5))) continue;
    const sx = (ux * (visW / 2 + 0.6)) / visW;
    const sy = (-uy * (visH / 2 + 0.4)) / visH;
    if (Math.abs(sx) < 0.2 && Math.abs(sy + 0.12) < 0.1 && Math.random() < 0.6) continue;
    position.set([ux * (visW / 2 + 0.6) * spread, -uy * (visH / 2 + 0.4) * spread, z], i * 3);
    const [r, g, b] = HUES[Math.floor(Math.random() * HUES.length)];
    const k = rnd(0.75, 1.3) * rnd(0.85, 1.15);
    color.set([r * k, g * k, b * k], i * 3);
    seed[i] = s;
    twinkle[i] = Math.random();
    i++;
  }
  return { position, color, seed, twinkle, count };
}
