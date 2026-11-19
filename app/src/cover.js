// Draws the cover: multi-panel poster layouts, per-panel crop and position,
// a Vice sunset or neon colour grade, and bold caption lettering. Everything
// is painted on the canvas at its own size, so the same code draws the live
// preview and the exported PNG.

import { renderScene } from './scenes.js';

export const LAYOUTS = {
  poster: { panels: 3, name: 'Poster' },
  triptych: { panels: 3, name: 'Triptych' },
  grid: { panels: 4, name: 'Grid 2x2' },
  single: { panels: 1, name: 'Single' },
};

/** Panel rectangles for a layout, with a thin grout gap between panels. */
export function panelRects(layout, w, h) {
  const g = Math.max(6, Math.round(Math.min(w, h) * 0.014));
  if (layout === 'triptych') {
    const pw = (w - 2 * g) / 3;
    return [0, 1, 2].map((i) => ({ x: i * (pw + g), y: 0, w: pw, h }));
  }
  if (layout === 'grid') {
    const pw = (w - g) / 2;
    const ph = (h - g) / 2;
    return [
      { x: 0, y: 0, w: pw, h: ph },
      { x: pw + g, y: 0, w: pw, h: ph },
      { x: 0, y: ph + g, w: pw, h: ph },
      { x: pw + g, y: ph + g, w: pw, h: ph },
    ];
  }
  if (layout === 'single') return [{ x: 0, y: 0, w, h }];
  const heroH = Math.round((h - g) * 0.62);
  const pw = (w - g) / 2;
  const bh = h - heroH - g;
  return [
    { x: 0, y: 0, w, h: heroH },
    { x: 0, y: heroH + g, w: pw, h: bh },
    { x: pw + g, y: heroH + g, w: pw, h: bh },
  ];
}

/** The drawable behind a panel photo: a scene canvas or an uploaded image. */
function photoSource(photo) {
  if (!photo) return null;
  if (photo.kind === 'scene') return renderScene(photo.scene, 1200, 900);
  if (photo.kind === 'image' && photo.img) return photo.img;
  return null;
}

function sourceSize(src) {
  if (!src) return { w: 1, h: 1 };
  return { w: src.naturalWidth || src.width, h: src.naturalHeight || src.height };
}

/** Draws one photo into a panel rect, cover-fit, with zoom and pan. */
function drawPanel(ctx, photo, rect, zoom, panX, panY, grade) {
  const src = photoSource(photo);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!src) {
    ctx.fillStyle = '#2b1d42';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  } else {
    if (grade === 'noir') ctx.filter = 'grayscale(1) contrast(1.12) brightness(1.03)';
    const { w: iw, h: ih } = sourceSize(src);
    const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = rect.x + (rect.w - dw) / 2 + panX * rect.w * 0.4;
    const dy = rect.y + (rect.h - dh) / 2 + panY * rect.h * 0.4;
    ctx.drawImage(src, dx, dy, dw, dh);
    ctx.filter = 'none';
  }
  ctx.restore();
}

/** The colour grade wash over the whole cover. */
function gradeWash(ctx, w, h, grade) {
  let wash;
  if (grade === 'neon') {
    wash = ctx.createLinearGradient(0, 0, w, h);
    wash.addColorStop(0, 'rgba(77, 227, 255, 0.16)');
    wash.addColorStop(0.55, 'rgba(255, 94, 138, 0.10)');
    wash.addColorStop(1, 'rgba(255, 94, 138, 0.42)');
  } else if (grade === 'golden') {
    wash = ctx.createLinearGradient(0, 0, 0, h);
    wash.addColorStop(0, 'rgba(255, 200, 90, 0.10)');
    wash.addColorStop(1, 'rgba(200, 110, 20, 0.32)');
  } else if (grade === 'noir') {
    wash = ctx.createLinearGradient(0, h * 0.6, 0, h);
    wash.addColorStop(0, 'rgba(255, 94, 138, 0)');
    wash.addColorStop(1, 'rgba(255, 94, 138, 0.12)');
  } else {
    wash = ctx.createLinearGradient(0, h * 0.3, 0, h);
    wash.addColorStop(0, 'rgba(255, 120, 60, 0)');
    wash.addColorStop(1, 'rgba(190, 40, 110, 0.38)');
  }
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
}

/** Darkens the corners so the poster feels finished. */
function vignette(ctx, w, h) {
  const r = Math.hypot(w, h) / 2;
  const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.45, w / 2, h / 2, r);
  g.addColorStop(0, 'rgba(10, 5, 20, 0)');
  g.addColorStop(1, 'rgba(10, 5, 20, 0.38)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** A little deterministic film grain over the cover. */
function grain(ctx, w, h) {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const dots = Math.min(4200, Math.floor((w * h) / 900));
  for (let i = 0; i < dots; i++) {
    const v = rnd();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
  }
}

/** A small sun mark drawn in the corner opposite the title. */
function sunMark(ctx, x, y, r) {
  ctx.save();
  ctx.strokeStyle = '#ffd166';
  ctx.fillStyle = '#ffd166';
  ctx.lineWidth = Math.max(2, r * 0.12);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75);
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.restore();
}

function fitFont(ctx, text, family, start, maxWidth) {
  let size = start;
  ctx.font = `${size}px "${family}"`;
  while (ctx.measureText(text).width > maxWidth && size > 14) {
    size -= 2;
    ctx.font = `${size}px "${family}"`;
  }
  return size;
}

/** The title and tagline, with a scrim behind them for legibility. */
function captionBlock(ctx, w, h, state) {
  const { caption, tagline, titleFont, titleColor, titlePlace } = state;
  const family = titleFont === 'anton' ? 'Anton' : titleFont === 'pacifico' ? 'Pacifico' : 'Bebas Neue';
  const title = titleFont === 'pacifico' ? caption.trim() : caption.trim().toUpperCase();
  const atBottom = titlePlace !== 'top';
  const scrimH = h * 0.34;
  const scrim = atBottom
    ? ctx.createLinearGradient(0, h - scrimH, 0, h)
    : ctx.createLinearGradient(0, 0, 0, scrimH);
  scrim.addColorStop(atBottom ? 0 : 1, 'rgba(12, 6, 24, 0)');
  scrim.addColorStop(atBottom ? 1 : 0, 'rgba(12, 6, 24, 0.62)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, atBottom ? h - scrimH : 0, w, scrimH);

  const pad = h * 0.045;
  const maxW = w * 0.92;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const titleSize = fitFont(ctx, title || ' ', family, Math.round(h * 0.13), maxW);
  const tagSize = Math.round(titleSize * 0.4);
  const titleY = atBottom ? h - pad : pad + titleSize;
  const tagY = atBottom ? titleY - titleSize * 1.08 : titleY + tagSize * 1.15;
  const ruleY = atBottom ? tagY - tagSize * 1.1 : tagY + tagSize * 1.1;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = titleSize * 0.16;
  ctx.shadowOffsetY = titleSize * 0.03;
  ctx.lineWidth = Math.max(2, titleSize * 0.045);
  ctx.strokeStyle = 'rgba(16, 8, 28, 0.85)';
  ctx.fillStyle = titleColor;
  if (title) {
    ctx.strokeText(title, w / 2, titleY);
    ctx.fillText(title, w / 2, titleY);
  }
  ctx.restore();

  if (tagline.trim()) {
    ctx.font = `${tagSize}px "Pacifico"`;
    ctx.fillStyle = '#ffe9f2';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = tagSize * 0.2;
    ctx.fillText(tagline.trim(), w / 2, tagY);
    ctx.shadowBlur = 0;
  }

  ctx.strokeStyle = '#ff5e8a';
  ctx.lineWidth = Math.max(2, h * 0.004);
  ctx.beginPath();
  ctx.moveTo(w / 2 - w * 0.12, ruleY);
  ctx.lineTo(w / 2 + w * 0.12, ruleY);
  ctx.stroke();

  const markR = Math.max(10, h * 0.016);
  const markX = atBottom ? w - w * 0.055 : w * 0.055;
  const markY = atBottom ? h * 0.055 : h - h * 0.055;
  sunMark(ctx, markX, markY, markR);
}

/** Draws the whole cover onto the canvas at the canvas's own size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.fillStyle = '#14101d';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(state.layout, w, h);
  rects.forEach((rect, i) => {
    const panel = state.panels[i] ?? {};
    drawPanel(ctx, panel.photo, rect, panel.zoom ?? 1, panel.panX ?? 0, panel.panY ?? 0, state.grade);
  });
  gradeWash(ctx, w, h, state.grade);
  vignette(ctx, w, h);
  captionBlock(ctx, w, h, state);
  grain(ctx, w, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.004);
  ctx.strokeRect(
    Math.min(w, h) * 0.018,
    Math.min(w, h) * 0.018,
    w - Math.min(w, h) * 0.036,
    h - Math.min(w, h) * 0.036,
  );
}
