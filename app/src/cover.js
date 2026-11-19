// Draws the cover: the photo panels, the colour grade, a retro striped sun,
// the bold caption lettering and the poster finish (grain, vignette, frame). Every drawing is original vector art made with the canvas
// API; no game artwork, logo or font is used. The title font is Anton, an
// SIL Open Font License font shipped under app/fonts/.
import { gradeById } from './grades.js';
import { layoutById } from './layouts.js';

const GUTTER = 0.008; // gap between panels, as a fraction of the cover width

/** A tiny seeded generator so the film grain is identical on every export. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The clip path of one panel, with its diagonal slant applied. */
export function panelPath(ctx, rect, w, h) {
  const x = rect.x * w;
  const y = rect.y * h;
  const pw = rect.w * w;
  const ph = rect.h * h;
  const s = (rect.slant ?? 0) * w;
  // Both edges lean the same way, so neighbouring slanted panels share one
  // diagonal seam: top edge shifted right by s, bottom edge shifted left.
  ctx.beginPath();
  ctx.moveTo(x + s, y);
  ctx.lineTo(x + pw + s, y);
  ctx.lineTo(x + pw - s, y + ph);
  ctx.lineTo(x - s, y + ph);
  ctx.closePath();
}

/** Draws one photo into one panel, cover-fit, with the panel's crop. */
export function drawPanelPhoto(ctx, photo, rect, crop, w, h, filter) {
  const x = rect.x * w;
  const y = rect.y * h;
  const pw = rect.w * w;
  const ph = rect.h * h;
  ctx.save();
  panelPath(ctx, rect, w, h);
  ctx.clip();
  // Panel background while the photo loads (or when there is no photo yet).
  ctx.fillStyle = '#241533';
  ctx.fillRect(x - 4, y - 4, pw + 8, ph + 8);
  if (photo) {
    const zoom = crop?.zoom ?? 1;
    const base = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight) * zoom;
    const dw = photo.naturalWidth * base;
    const dh = photo.naturalHeight * base;
    const dx = x + (pw - dw) / 2 + (crop?.ox ?? 0) * pw;
    const dy = y + (ph - dh) / 2 + (crop?.oy ?? 0) * ph;
    ctx.filter = filter ?? 'none';
    ctx.drawImage(photo, dx, dy, dw, dh);
    ctx.filter = 'none';
  }
  ctx.restore();
}

/** A retro striped sun: a glowing disc with horizontal slits cut out. */
export function drawSun(ctx, cx, cy, r, glow) {
  const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#fff3b0');
  grad.addColorStop(0.45, '#ffb703');
  grad.addColorStop(0.8, glow);
  grad.addColorStop(1, 'rgba(255, 80, 60, 0)');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = grad;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // Slits across the lower half, widening toward the bottom.
  ctx.fillStyle = 'rgba(36, 21, 51, 0.55)';
  let y = cy + r * 0.05;
  let gap = r * 0.035;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, gap);
    y += gap * 2.4;
    gap *= 1.5;
  }
  ctx.restore();
}

/** Builds a halftone dot pattern tile used to fill the title letters. */
export function halftonePattern(ctx, colour) {
  const tile = document.createElement('canvas');
  tile.width = 14;
  tile.height = 14;
  const t = tile.getContext('2d');
  t.fillStyle = colour;
  t.beginPath();
  t.arc(4, 4, 2.6, 0, Math.PI * 2);
  t.arc(11, 11, 2.6, 0, Math.PI * 2);
  t.fill();
  t.beginPath();
  t.arc(11, 4, 1.4, 0, Math.PI * 2);
  t.arc(4, 11, 1.4, 0, Math.PI * 2);
  t.fill();
  return ctx.createPattern(tile, 'repeat');
}

/** Fits the title font size so the words span at most 92% of the width. */
export function fitTitleFont(ctx, text, maxWidth, baseSize, scale) {
  let size = baseSize * scale;
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  while (size > 16 && ctx.measureText(text).width > maxWidth) {
    size *= 0.94;
    ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  }
  return size;
}

/** Draws the title and subtitle, in one of four lettering styles. */
export function drawTitle(ctx, state, w, h) {
  const grade = gradeById(state.grade);
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  if (!title && !subtitle) return;
  const bottom = state.titlePos !== 'top';
  const unit = Math.min(w, h);
  const maxWidth = w * 0.92;
  let size = 0;
  if (title) {
    size = fitTitleFont(ctx, title, maxWidth, unit * 0.135, state.titleSize ?? 1);
  }
  const subSize = Math.max(14, unit * 0.032);
  const blockH = (title ? size * 1.02 : 0) + (subtitle ? subSize * 1.9 : 0);
  const topY = bottom ? h - blockH - h * 0.045 : h * 0.045;
  const cx = w / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  // A soft dark plate behind the lettering so it reads over any photo.
  const plateTop = topY - size * 0.18;
  const plate = ctx.createLinearGradient(0, plateTop, 0, topY + blockH);
  plate.addColorStop(0, 'rgba(20, 8, 32, 0)');
  plate.addColorStop(0.25, 'rgba(20, 8, 32, 0.42)');
  plate.addColorStop(0.75, 'rgba(20, 8, 32, 0.42)');
  plate.addColorStop(1, 'rgba(20, 8, 32, 0)');
  ctx.fillStyle = plate;
  ctx.fillRect(0, plateTop, w, blockH + size * 0.18);
  if (title) {
    const y = topY + size;
    ctx.lineJoin = 'round';
    if (state.titleStyle === 'halftone') {
      ctx.fillStyle = halftonePattern(ctx, grade.title);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = size * 0.08;
      ctx.shadowOffsetY = size * 0.03;
      ctx.fillText(title, cx, y);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = grade.accent;
      ctx.lineWidth = Math.max(2, size * 0.02);
      ctx.strokeText(title, cx, y);
    } else if (state.titleStyle === 'outline') {
      ctx.strokeStyle = grade.title;
      ctx.lineWidth = Math.max(3, size * 0.055);
      ctx.strokeText(title, cx, y);
      ctx.fillStyle = 'rgba(20, 8, 32, 0.35)';
      ctx.fillText(title, cx, y);
    } else if (state.titleStyle === 'gradient') {
      const g = ctx.createLinearGradient(0, y - size, 0, y);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.55, grade.accent);
      g.addColorStop(1, grade.glow);
      ctx.fillStyle = g;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = size * 0.07;
      ctx.shadowOffsetY = size * 0.03;
      ctx.fillText(title, cx, y);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.fillStyle = grade.title;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = size * 0.07;
      ctx.shadowOffsetY = size * 0.03;
      ctx.fillText(title, cx, y);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
  }
  if (subtitle) {
    const y = topY + (title ? size * 1.02 : 0) + subSize * 1.5;
    ctx.font = `700 ${subSize}px system-ui, sans-serif`;
    // Letterspaced subtitle, drawn letter by letter.
    const spacing = subSize * 0.42;
    const widths = [...subtitle].map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (subtitle.length - 1);
    let x = cx - total / 2;
    ctx.fillStyle = grade.accent;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = subSize * 0.25;
    for (let i = 0; i < subtitle.length; i++) {
      ctx.fillText(subtitle[i], x + widths[i] / 2, y);
      x += widths[i] + spacing;
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

/** Deterministic film grain: seeded speckles over the whole cover. */
export function drawGrain(ctx, w, h, seed) {
  const rand = mulberry32(seed);
  const count = Math.floor((w * h) / 900);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const v = rand();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(rand() * w, rand() * h, 1.6, 1.6);
  }
  ctx.restore();
}

/** Draws the whole cover onto `canvas` from the editor state. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = gradeById(state.grade);
  const layout = layoutById(state.layout);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#1c0f2a';
  ctx.fillRect(0, 0, w, h);
  // Panels, each with its own photo and crop, separated by a thin gutter.
  const inset = GUTTER * w;
  for (let i = 0; i < layout.rects.length; i++) {
    const r = layout.rects[i];
    const shrunk = {
      x: r.x + (r.x > 0 ? inset / 2 / w : 0),
      y: r.y + (r.y > 0 ? inset / 2 / h : 0),
      w: r.w - (r.x > 0 ? inset / 2 / w : 0) - (r.x + r.w < 1 ? inset / 2 / w : 0),
      h: r.h - (r.y > 0 ? inset / 2 / h : 0) - (r.y + r.h < 1 ? inset / 2 / h : 0),
      slant: r.slant,
    };
    const crop = state.panels?.[i] ?? { photo: 0, zoom: 1, ox: 0, oy: 0 };
    const photo = state.photos?.[crop.photo]?.img ?? null;
    drawPanelPhoto(ctx, photo, shrunk, crop, w, h, grade.filter);
  }
  // The grade wash over everything.
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  for (const [stop, colour] of grade.wash) wash.addColorStop(stop, colour);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  // Retro sun, tucked behind the title.
  if (state.sun) {
    const sunR = Math.min(w, h) * 0.19;
    const sunX = w * 0.5;
    const sunY = state.titlePos === 'top' ? h * 0.68 : h * 0.3;
    drawSun(ctx, sunX, sunY, sunR, grade.glow);
  }
  // Caption lettering.
  drawTitle(ctx, state, w, h);
  // Vignette: darkened corners for the poster look.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10, 4, 20, 0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  if (state.grain) drawGrain(ctx, w, h, 20261119);
  // Poster frame.
  if (state.border) {
    const bw = Math.max(6, w * 0.012);
    ctx.strokeStyle = '#fdf7ef';
    ctx.lineWidth = bw;
    ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);
    ctx.strokeStyle = 'rgba(20, 8, 32, 0.6)';
    ctx.lineWidth = Math.max(2, w * 0.002);
    ctx.strokeRect(bw * 1.9, bw * 1.9, w - bw * 3.8, h - bw * 3.8);
  }
}

/** Renders the cover at export size on a fresh canvas and returns it. */
export function renderCover(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state);
  return canvas;
}
