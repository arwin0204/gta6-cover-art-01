// Original sample scenes, drawn procedurally on canvas: a Vice-style dusk
// boulevard, a neon pier and a palm beach. No photo files, no Rockstar
// artwork — every pixel is painted here by code, so the app works offline
// and the scenes are free for anyone to use.

/** Deterministic pseudo-random generator, so a scene always looks the same. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Vertical sky gradient from the given colour stops. */
function sky(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** A glowing sun disc low in the sky. */
function sunDisc(ctx, x, y, r, core, glow) {
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 3.2);
  g.addColorStop(0, glow);
  g.addColorStop(1, 'rgba(255, 120, 90, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A few faint stars in the upper sky. */
function stars(ctx, w, h, rand, count) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h * 0.32;
    const r = 0.6 + rand() * 1.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A row of dark building silhouettes along a baseline, some windows lit. */
function skyline(ctx, w, base, rand, minH, maxH) {
  let x = -10;
  while (x < w + 10) {
    const bw = 40 + rand() * 110;
    const bh = minH + rand() * (maxH - minH);
    ctx.fillStyle = '#160f26';
    ctx.fillRect(x, base - bh, bw, bh);
    if (rand() > 0.45) {
      ctx.fillStyle = '#1d1430';
      ctx.fillRect(x + bw * 0.25, base - bh - 14 - rand() * 22, bw * 0.5, 16 + rand() * 22);
    }
    ctx.fillStyle = 'rgba(255, 196, 110, 0.85)';
    const wins = Math.floor(rand() * 7);
    for (let i = 0; i < wins; i++) {
      ctx.fillRect(x + 6 + rand() * (bw - 14), base - bh + 8 + rand() * (bh - 18), 5, 7);
    }
    x += bw + 4 + rand() * 18;
  }
}

/** A palm tree silhouette: leaning trunk and drooping fronds. */
function palm(ctx, x, y, s, lean, rand) {
  ctx.strokeStyle = '#120a20';
  ctx.fillStyle = '#120a20';
  ctx.lineCap = 'round';
  const topX = x + lean * s;
  const topY = y - s;
  ctx.lineWidth = Math.max(3, s * 0.045);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * s * 0.3, y - s * 0.55, topX, topY);
  ctx.stroke();
  const fronds = 8;
  for (let i = 0; i < fronds; i++) {
    const a = (-Math.PI * 0.08) - (i / (fronds - 1)) * Math.PI * 0.84;
    const len = s * (0.32 + rand() * 0.14);
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.5 + len * 0.42;
    const mx = topX + Math.cos(a) * len * 0.55;
    const my = topY + Math.sin(a) * len * 0.25 - len * 0.05;
    ctx.lineWidth = Math.max(2, s * 0.025);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(topX, topY, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

/** Boulevard at dusk: sun, skyline, a road running to the horizon, palms. */
function paintBoulevard(ctx, w, h) {
  const rand = mulberry32(20261119);
  sky(ctx, w, h, [[0, '#2a1052'], [0.45, '#7a2a6d'], [0.72, '#e85d4a'], [1, '#ffb35c']]);
  stars(ctx, w, h, rand, 40);
  sunDisc(ctx, w * 0.58, h * 0.47, h * 0.095, '#ffe9a8', 'rgba(255, 150, 80, 0.55)');
  skyline(ctx, w, h * 0.62, rand, h * 0.1, h * 0.3);
  const road = ctx.createLinearGradient(0, h * 0.62, 0, h);
  road.addColorStop(0, '#3a2350');
  road.addColorStop(1, '#120a20');
  ctx.fillStyle = road;
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.62);
  ctx.lineTo(w * 0.58, h * 0.62);
  ctx.lineTo(w * 0.94, h);
  ctx.lineTo(w * 0.06, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.9)';
  ctx.lineWidth = Math.max(2, h * 0.006);
  ctx.setLineDash([h * 0.05, h * 0.04]);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.63);
  ctx.lineTo(w * 0.5, h);
  ctx.stroke();
  ctx.setLineDash([]);
  const neon = ['#ff5e8a', '#4de3ff', '#ffd166'];
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = neon[i % 3];
    ctx.globalAlpha = 0.9;
    ctx.fillRect(w * (0.1 + i * 0.19), h * 0.585, w * 0.045, h * 0.02);
    ctx.globalAlpha = 1;
  }
  palm(ctx, w * 0.1, h * 0.66, h * 0.34, 0.12, rand);
  palm(ctx, w * 0.9, h * 0.64, h * 0.3, -0.14, rand);
  palm(ctx, w * 0.3, h * 0.6, h * 0.2, 0.08, rand);
}

/** Neon pier at night: moon, sea, a pier with lights and a ferris wheel. */
function paintPier(ctx, w, h) {
  const rand = mulberry32(777);
  sky(ctx, w, h, [[0, '#0a0a2e'], [0.5, '#232a5e'], [0.75, '#7a2a6d'], [1, '#c94b7a']]);
  stars(ctx, w, h, rand, 70);
  sunDisc(ctx, w * 0.22, h * 0.2, h * 0.06, '#f4f1de', 'rgba(220, 220, 255, 0.35)');
  const sea = ctx.createLinearGradient(0, h * 0.55, 0, h);
  sea.addColorStop(0, '#3d2a6e');
  sea.addColorStop(1, '#120a2e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  ctx.fillStyle = 'rgba(255, 190, 120, 0.35)';
  for (let i = 0; i < 26; i++) {
    const y = h * (0.57 + rand() * 0.4);
    const len = w * (0.02 + rand() * 0.09);
    ctx.fillRect(w * 0.5 - len / 2 + (rand() - 0.5) * w * 0.12, y, len, 2.5);
  }
  skyline(ctx, w, h * 0.56, rand, h * 0.06, h * 0.16);
  ctx.strokeStyle = '#0d0722';
  ctx.lineWidth = h * 0.02;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.78);
  ctx.lineTo(w, h * 0.78);
  ctx.stroke();
  ctx.fillStyle = '#0d0722';
  for (let i = 0; i < 14; i++) {
    const x = (i / 13) * w;
    ctx.fillRect(x - 3, h * 0.78, 6, h * 0.14);
  }
  const neon = ['#ff5e8a', '#4de3ff', '#ffd166', '#7dffb0'];
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = neon[i % 4];
    ctx.beginPath();
    ctx.arc((i / 13) * w, h * 0.765, 4 + rand() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const cx = w * 0.78;
  const cy = h * 0.42;
  const r = h * 0.17;
  ctx.strokeStyle = '#0d0722';
  ctx.lineWidth = h * 0.012;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, h * 0.78);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.strokeStyle = '#0d0722';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
    ctx.fillStyle = neon[i % 4];
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  palm(ctx, w * 0.08, h * 0.8, h * 0.26, 0.1, rand);
}

/** Palm beach at dusk: low sun over the sea, sand, framing palms. */
function paintPalms(ctx, w, h) {
  const rand = mulberry32(4242);
  sky(ctx, w, h, [[0, '#3b1d5e'], [0.4, '#c94b7a'], [0.68, '#ff9a5c'], [1, '#ffd166']]);
  stars(ctx, w, h, rand, 24);
  sunDisc(ctx, w * 0.5, h * 0.58, h * 0.11, '#fff3c4', 'rgba(255, 170, 90, 0.6)');
  const sea = ctx.createLinearGradient(0, h * 0.58, 0, h * 0.78);
  sea.addColorStop(0, '#e8725e');
  sea.addColorStop(1, '#5e2a6e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.58, w, h * 0.2);
  ctx.fillStyle = 'rgba(255, 243, 196, 0.5)';
  for (let i = 0; i < 30; i++) {
    const y = h * (0.6 + rand() * 0.16);
    const len = w * (0.03 + rand() * 0.12);
    ctx.fillRect(w * 0.5 - len / 2 + (rand() - 0.5) * w * 0.2, y, len, 2.5);
  }
  const sand = ctx.createLinearGradient(0, h * 0.78, 0, h);
  sand.addColorStop(0, '#8a5a72');
  sand.addColorStop(1, '#3a1d40');
  ctx.fillStyle = sand;
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  palm(ctx, w * 0.06, h * 0.86, h * 0.42, 0.22, rand);
  palm(ctx, w * 0.94, h * 0.84, h * 0.38, -0.2, rand);
  palm(ctx, w * 0.24, h * 0.82, h * 0.24, 0.1, rand);
}

const PAINTERS = { boulevard: paintBoulevard, pier: paintPier, palms: paintPalms };

export const SCENES = [
  { id: 'boulevard', name: 'Boulevard Dusk' },
  { id: 'pier', name: 'Neon Pier' },
  { id: 'palms', name: 'Palm Beach' },
];

const cache = new Map();

/** Renders (and caches) a scene to a canvas of the given size. */
export function renderScene(id, w = 1200, h = 900) {
  const key = `${id}:${w}x${h}`;
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  (PAINTERS[id] ?? PAINTERS.boulevard)(ctx, w, h);
  cache.set(key, canvas);
  return canvas;
}
