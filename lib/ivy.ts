// Ivy generator, ported 1:1 from reference/ivy-scene.html, plus the hero field that morphs into the top of the ivy.
// Roots start at the top centre and grow down the whole page; spread, thickness and branch density
// increase with depth (spreadAt). Pure function: returns typed arrays, no three.js dependency.

export type IvyParams = {
  /** world units per viewport height */
  visH: number;
  /** world units per viewport width */
  visW: number;
  /** document.scrollHeight / innerHeight, measured after layout */
  pageScreens: number;
  /** small screens get fewer particles and segments */
  small: boolean;
};

export type IvyData = {
  particles: {
    position: Float32Array;
    birth: Float32Array;
    color: Float32Array;
    depth: Float32Array;
    seed: Float32Array;
    /** 1 = a hero field point lands here and replaces it (its own ivy point is hidden) */
    claimed: Float32Array;
    /** 1 = top particle no dust point reached: fades in with the lines (uIvy) */
    top: Float32Array;
    count: number;
  };
  /** hero field: sparse dust over the first screen that morphs into the top of the ivy */
  field: {
    position: Float32Array;
    /** ivy particle the point lands on */
    target: Float32Array;
    /** colour / depth / seed of that ivy particle, so at the end of the morph the point IS the particle */
    color: Float32Array;
    depth: Float32Array;
    seed: Float32Array;
    /** own random 0..1: staggers the morph */
    stagger: Float32Array;
    /** 1 / points sharing the same target, so stacked points add up to one particle */
    mult: Float32Array;
    count: number;
  };
  lines: {
    position: Float32Array;
    birth: Float32Array;
    color: Float32Array;
    depth: Float32Array;
    end: Float32Array;
  };
  /** sorted; count of births below uGrow = branches grown so far */
  branchBirths: Float32Array;
  /** sorted; count of births below uGrow = cross-links grown so far */
  linkBirths: Float32Array;
};

type Vec3 = [number, number, number];
type RGB = { r: number; g: number; b: number };
type Seg = { a: Vec3; b: Vec3; birth: number; depth: number; thick: number; col: number; len: number };
type Tip = { p: Vec3; birth: number; col: number; family: number; leaf: boolean };

/** muted palette: blue, cyan, violet, teal, indigo, rose */
export const IVY_PALETTE = ["#3d8bff", "#22d3ee", "#8b5cf6", "#2dd4bf", "#6366f1", "#f472b6"];

// hex → 0..1 floats without colour-space conversion (matches the r128 prototype)
const hexToRgb = (h: string): RGB => ({
  r: parseInt(h.slice(1, 3), 16) / 255,
  g: parseInt(h.slice(3, 5), 16) / 255,
  b: parseInt(h.slice(5, 7), 16) / 255,
});

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const gauss = () => {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const STEP = [0.16, 0.13, 0.1, 0.08, 0.06];
const SPAWN = [0.13, 0.08, 0.06, 0.05, 0];
const LEN: [number, number][] = [
  [0, 0],
  [4, 9],
  [1.6, 3.8],
  [0.6, 1.6],
  [0.3, 0.8],
];
const THICK = [0.26, 0.15, 0.09, 0.05, 0.03];
/** how fast a branch grows relative to scroll depth */
const K = [1.0, 0.55, 0.5, 0.45, 0.4];
/** max segments a child branch of each depth may add (side branches only; trunks are never capped) */
const CAP = [Infinity, 70, 26, 10, 6];
const LINK_COLOR = hexToRgb("#9cc4ff");

// hero field: sparse dust over the first screen
/** vertical strips used to pair field points with ivy particles */
const COLS = 48;

export function buildIvy({ visH, visW, pageScreens, small }: IvyParams): IvyData {
  const COUNT = small ? 18000 : 34000;
  const MAX_SEGS = small ? 9000 : 16000;
  const PALETTE = IVY_PALETTE.map(hexToRgb);

  // ---------- grow the ivy ----------
  const screens = Math.max(3, pageScreens);
  const TOP = visH / 2 + 0.6;
  // world distance from the top of the page to the bottom of the document (footer included)
  const DEPTH_TOTAL = screens * visH + 0.6;
  const X_LIMIT = Math.max(4, visW / 2 + 0.8);

  const segs: Seg[] = [];
  const tips: Tip[] = [];
  const branchBirths: number[] = [];
  let maxSegsLocal = MAX_SEGS;

  const spreadAt = (y: number) => {
    const f = Math.max(0, Math.min(1, (TOP - y) / (visH * 2.2)));
    return f * f * (3 - 2 * f);
  };

  function branch(
    x: number,
    y: number,
    z: number,
    ang: number,
    depth: number,
    len: number,
    birth0: number,
    col: number,
    family: number,
    lane: ((y: number) => number) | null,
    limit: number,
  ) {
    // trunks grow until they reach the bottom of the page (their path wanders, so length alone is not enough);
    // the segment budget (per root / CAP) only limits side branches
    const trunk = depth === 0;
    const steps = trunk ? 100000 : Math.max(3, Math.round(len / STEP[depth]));
    let dist = 0;
    let birth = birth0;
    branchBirths.push(birth0);
    for (let s = 0; s < steps && (trunk || segs.length < Math.min(limit, maxSegsLocal)); s++) {
      if (trunk && TOP - y >= DEPTH_TOTAL) break;
      ang += gauss() * 0.2 * (1 + depth * 0.3);
      if (depth === 0 && lane) {
        // roots meander around their own lane so the whole page width stays covered
        const desired = Math.atan2(-1, (lane(y) - x) * 0.6);
        ang += (desired - ang) * 0.08;
      } else {
        ang += (-Math.PI / 2 - ang) * 0.012; // gentle pull downwards
      }
      const st = STEP[depth] * rnd(0.8, 1.2);
      let nx = x + Math.cos(ang) * st;
      const ny = y + Math.sin(ang) * st;
      const nz = Math.max(-1.6, Math.min(1.6, z + gauss() * 0.05));
      if (Math.abs(nx) > X_LIMIT) {
        ang = Math.PI - ang;
        nx = x + Math.cos(ang) * st;
      }
      const t = s / steps;
      const fy = spreadAt(y);
      birth = Math.max(birth0 + dist * K[depth] * 0.25, TOP - y);
      segs.push({
        a: [x, y, z],
        b: [nx, ny, nz],
        birth,
        depth,
        thick: THICK[depth] * (1 - 0.7 * t) * (0.18 + 0.82 * fy),
        col,
        len: 0,
      });
      dist += st;
      x = nx;
      y = ny;
      z = nz;
      if (depth < 4 && Math.random() < SPAWN[depth] * (0.12 + 0.88 * fy)) {
        const side = Math.random() < 0.5 ? 1 : -1;
        const cAng = ang + side * rnd(0.55, 1.25);
        const cLen = rnd(LEN[depth + 1][0], LEN[depth + 1][1]) * (0.3 + 0.7 * fy);
        const cCol =
          depth === 0
            ? (col + 1 + ((Math.random() * (PALETTE.length - 1)) | 0)) % PALETTE.length
            : Math.random() < 0.2
              ? (col + 1) % PALETTE.length
              : col;
        branch(
          x,
          y,
          z,
          cAng,
          depth + 1,
          cLen,
          birth,
          cCol,
          depth === 0 ? Math.random() : family,
          null,
          Math.min(limit, segs.length + CAP[depth + 1]),
        );
      }
      // ivy leaves along thinner branches
      if (depth >= 2 && Math.random() < 0.05) tips.push({ p: [x, y, z], birth: birth + 0.3, col, family, leaf: true });
    }
    if (depth >= 1) tips.push({ p: [x, y, z], birth: birth + 0.2, col, family, leaf: true });
  }

  const roots = small
    ? [
        { f: -0.55, col: 0 },
        { f: 0.55, col: 2 },
        { f: 0.05, col: 1 },
      ]
    : [
        { f: -0.78, col: 0 },
        { f: -0.3, col: 3 },
        { f: 0.3, col: 1 },
        { f: 0.78, col: 2 },
      ];
  const perRoot = Math.floor(MAX_SEGS / roots.length);
  roots.forEach((r, i) => {
    maxSegsLocal = segs.length + perRoot;
    const base = r.f * X_LIMIT;
    const amp = X_LIMIT * 0.16;
    const ph = rnd(0, 6.28);
    const fr = rnd(0.12, 0.2);
    const lane = (y: number) => {
      const f = spreadAt(y);
      return (base + amp * Math.sin(y * fr + ph)) * f + (i - (roots.length - 1) / 2) * 0.12;
    };
    branch(lane(TOP), TOP, rnd(-0.5, 0.5), -Math.PI / 2, 0, DEPTH_TOTAL, 0, r.col, i / roots.length, lane, Infinity);
  });

  // ---------- particles along the branches ----------
  const weights = segs.map((sg) => {
    sg.len = Math.hypot(sg.b[0] - sg.a[0], sg.b[1] - sg.a[1], sg.b[2] - sg.a[2]);
    return sg.thick * sg.len;
  });
  const leafShare = 0.16;
  const stemBudget = COUNT * (1 - leafShare);
  const W = weights.reduce((s, w) => s + w, 0);
  const pos: number[] = [];
  const pBirth: number[] = [];
  const pCol: number[] = [];
  const pDepth: number[] = [];
  const pSeed: number[] = [];
  const pushP = (x: number, y: number, z: number, b: number, c: RGB, d: number, bright: number) => {
    pos.push(x, y, z);
    pBirth.push(b);
    pDepth.push(d);
    pSeed.push(Math.random());
    const jitter = 0.85 + Math.random() * 0.3;
    pCol.push(c.r * bright * jitter, c.g * bright * jitter, c.b * bright * jitter);
  };
  segs.forEach((sg, i) => {
    const exact = (stemBudget * weights[i]) / W;
    const n = Math.floor(exact) + (Math.random() < exact % 1 ? 1 : 0);
    const c = PALETTE[sg.col];
    for (let k = 0; k < n; k++) {
      const r = Math.random();
      const spread = sg.thick * 0.7;
      pushP(
        sg.a[0] + (sg.b[0] - sg.a[0]) * r + gauss() * spread,
        sg.a[1] + (sg.b[1] - sg.a[1]) * r + gauss() * spread,
        sg.a[2] + (sg.b[2] - sg.a[2]) * r + gauss() * spread,
        sg.birth + r * 0.05,
        c,
        sg.depth,
        1.0 + (4 - sg.depth) * 0.08,
      );
    }
  });
  // leaves: small elongated clusters, slightly brighter
  const leafBudget = COUNT * leafShare;
  const perLeaf = Math.max(8, Math.floor(leafBudget / Math.max(1, tips.length)));
  tips.forEach((tp) => {
    const c = PALETTE[tp.col];
    const ang = rnd(0, Math.PI * 2);
    const L = rnd(0.12, 0.26);
    const Wd = L * 0.4;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    for (let k = 0; k < perLeaf; k++) {
      const u = gauss() * 0.5 * L;
      const v = gauss() * 0.5 * Wd;
      pushP(
        tp.p[0] + ca * u - sa * v + ca * L * 0.5,
        tp.p[1] + sa * u + ca * v + sa * L * 0.5,
        tp.p[2] + gauss() * 0.03,
        tp.birth + Math.random() * 0.2,
        c,
        4,
        0.75,
      );
    }
  });

  // ---------- hero field → top of the ivy ----------
  // top ivy particles: the first 1.6 screens of the page
  const topY = TOP - visH * 1.6;
  const tops: number[] = [];
  for (let i = 0; i < pBirth.length; i++) if (pos[i * 3 + 1] > topY) tops.push(i);
  const claimed = new Float32Array(pBirth.length);
  const top = new Float32Array(pBirth.length);

  // sparse dust: fixed count, not raised to the number of top particles
  const FIELD = small ? 4000 : 7200;
  // camera distance for this view (visH = 2 · tan(22.5°) · camZ)
  const camZ = visH / (2 * Math.tan((22.5 * Math.PI) / 180));
  const fPos = new Float32Array(FIELD * 3);
  const fStagger = new Float32Array(FIELD);
  // hero: scattered dust filling the whole first screen in depth (a bit denser towards the bottom and the sides)
  for (let i = 0; i < FIELD; i++) {
    const fz = rnd(-5, 2.5);
    const scale = (camZ - fz) / camZ; // spread wider further back so the screen stays covered
    let ux = Math.random() * 2 - 1;
    ux = Math.sign(ux) * Math.pow(Math.abs(ux), 0.8);
    const uy = Math.pow(Math.random(), 0.85) * 2 - 1; // y in [-1, 1], bias downwards
    fPos[i * 3] = ux * (visW / 2 + 0.6) * scale;
    fPos[i * 3 + 1] = -uy * (visH / 2 + 0.4) * scale;
    fPos[i * 3 + 2] = fz;
    fStagger[i] = Math.random();
  }

  const fTarget = new Float32Array(FIELD * 3);
  const fColor = new Float32Array(FIELD * 3);
  const fDepth = new Float32Array(FIELD);
  const fSeed = new Float32Array(FIELD);
  const fMult = new Float32Array(FIELD).fill(1);
  const fTo = new Int32Array(FIELD).fill(-1);

  if (tops.length) {
    // each point goes to a particle in its own vertical strip (48 columns over fW), keeping low → high order,
    // so the dust rebuilds itself into the roots right where it is
    const fW = visW * 1.8;
    const colW = (fW + 2) / COLS;
    const colOf = (x: number) => Math.max(0, Math.min(COLS - 1, Math.floor((x + fW / 2 + 1) / colW)));
    const tStrips: number[][] = Array.from({ length: COLS }, () => []);
    const fStrips: number[][] = Array.from({ length: COLS }, () => []);
    for (const i of tops) tStrips[colOf(pos[i * 3])].push(i);
    for (let i = 0; i < FIELD; i++) fStrips[colOf(fPos[i * 3])].push(i);
    const nearestTargets = (c: number) => {
      for (let d = 0; d < COLS; d++) {
        if (c - d >= 0 && tStrips[c - d].length) return tStrips[c - d];
        if (c + d < COLS && tStrips[c + d].length) return tStrips[c + d];
      }
      return tops;
    };

    const shared = new Int32Array(pBirth.length);
    for (let c = 0; c < COLS; c++) {
      const fl = fStrips[c];
      if (!fl.length) continue;
      const tg = (tStrips[c].length ? tStrips[c] : nearestTargets(c)).slice();
      fl.sort((p, q) => fPos[p * 3 + 1] - fPos[q * 3 + 1]); // field: low → high
      tg.sort((p, q) => pos[p * 3 + 1] - pos[q * 3 + 1]); // roots: low → high
      const nt = tg.length;
      const nf = fl.length;
      for (let j = 0; j < nf; j++) {
        const t = tg[Math.min(nt - 1, Math.floor((j * nt) / nf))];
        fTo[fl[j]] = t;
        shared[t]++;
        claimed[t] = 1;
      }
    }
    // top particles no dust point reached fade in with the ivy lines (aTop)
    for (const i of tops) if (!claimed[i]) top[i] = 1;
    for (let i = 0; i < FIELD; i++) {
      const t = fTo[i];
      if (t < 0) continue;
      fTarget.set([pos[t * 3], pos[t * 3 + 1], pos[t * 3 + 2]], i * 3);
      fColor.set([pCol[t * 3], pCol[t * 3 + 1], pCol[t * 3 + 2]], i * 3);
      fDepth[i] = pDepth[t];
      fSeed[i] = pSeed[t];
      fMult[i] = 1 / shared[t];
    }
  }
  // safety: a point without a target (no top particles at all) stays where it is, in field blue
  for (let i = 0; i < FIELD; i++) {
    if (fTo[i] >= 0) continue;
    fTarget.set([fPos[i * 3], fPos[i * 3 + 1], fPos[i * 3 + 2]], i * 3);
    fColor.set([0.239, 0.545, 1], i * 3);
    fSeed[i] = fStagger[i];
  }

  // ---------- thin skeleton lines (drawn as they grow) ----------
  const lPos: number[] = [];
  const lBirth: number[] = [];
  const lCol: number[] = [];
  const lDepth: number[] = [];
  const lEnd: number[] = [];
  segs.forEach((sg) => {
    const c = PALETTE[sg.col];
    // brighter than the reference (0.4 - depth * 0.06)
    const br = 0.4 - sg.depth * 0.06; // lines stay quiet like the prototype; the particles carry the look
    lPos.push(sg.a[0], sg.a[1], sg.a[2], sg.b[0], sg.b[1], sg.b[2]);
    lBirth.push(sg.birth, sg.birth);
    lDepth.push(sg.depth, sg.depth);
    lEnd.push(0, 1);
    lCol.push(c.r * br, c.g * br, c.b * br, c.r * br, c.g * br, c.b * br);
  });

  // ---------- cross links between nearby tips of different branches ----------
  const links: [Tip, Tip][] = [];
  const usedTip = new Set<number>();
  const maxLinks = small ? 120 : 240;
  for (let i = 0; i < tips.length && links.length < maxLinks; i++) {
    if (usedTip.has(i)) continue;
    for (let j = i + 1; j < tips.length; j++) {
      if (Math.abs(tips[i].family - tips[j].family) < 0.02) continue;
      const dx = tips[i].p[0] - tips[j].p[0];
      const dy = tips[i].p[1] - tips[j].p[1];
      if (Math.abs(dy) > 0.9 || usedTip.has(j)) continue;
      const d = Math.hypot(dx, dy, tips[i].p[2] - tips[j].p[2]);
      if (d > 0.2 && d < 0.6) {
        links.push([tips[i], tips[j]]);
        usedTip.add(i);
        usedTip.add(j);
        break;
      }
    }
  }
  const linkBirths: number[] = [];
  const c = LINK_COLOR;
  links.forEach(([a, b]) => {
    const birth = Math.max(a.birth, b.birth) + 0.9;
    linkBirths.push(birth);
    lPos.push(a.p[0], a.p[1], a.p[2], b.p[0], b.p[1], b.p[2]);
    lBirth.push(birth, birth);
    lDepth.push(4, 4);
    lEnd.push(0, 1);
    // brighter than the reference (0.4)
    lCol.push(c.r * 0.4, c.g * 0.4, c.b * 0.4, c.r * 0.4, c.g * 0.4, c.b * 0.4);
  });
  linkBirths.sort((a, b) => a - b);
  branchBirths.sort((a, b) => a - b);

  return {
    particles: {
      position: new Float32Array(pos),
      birth: new Float32Array(pBirth),
      color: new Float32Array(pCol),
      depth: new Float32Array(pDepth),
      seed: new Float32Array(pSeed),
      claimed,
      top,
      count: pBirth.length,
    },
    field: {
      position: fPos,
      target: fTarget,
      color: fColor,
      depth: fDepth,
      seed: fSeed,
      stagger: fStagger,
      mult: fMult,
      count: FIELD,
    },
    lines: {
      position: new Float32Array(lPos),
      birth: new Float32Array(lBirth),
      color: new Float32Array(lCol),
      depth: new Float32Array(lDepth),
      end: new Float32Array(lEnd),
    },
    branchBirths: new Float32Array(branchBirths),
    linkBirths: new Float32Array(linkBirths),
  };
}

/** Number of sorted values below v (binary search). */
export function countBelow(arr: Float32Array, v: number) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (arr[m] < v) lo = m + 1;
    else hi = m;
  }
  return lo;
}
