// Wires the editor: pick photos, arrange the panels, letter the caption and
// export the cover in the three post sizes. Photos never leave the machine:
// they are read with FileReader / object URLs and drawn straight to canvas.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, renderCover } from './cover.js';
import { GRADES } from './grades.js';
import { LAYOUTS, SIZES, layoutById, sizeById } from './layouts.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');

/** The editor state: everything drawCover needs, plus the UI selection. */
export const state = {
  layout: 'mosaic5',
  grade: 'vice',
  title: 'Sunset Heist',
  subtitle: 'Neon Coast',
  titleStyle: 'halftone',
  titlePos: 'bottom',
  titleSize: 1,
  sun: true,
  grain: true,
  border: true,
  size: 'square',
  photos: [],
  panels: [],
  selected: 0,
};

/** Default crops, varied per panel so one photo fills the cover differently. */
export function defaultCrop(i) {
  return {
    photo: 0,
    zoom: 1.12,
    ox: (((i % 3) - 1) * 0.14) % 0.3,
    oy: ((Math.floor(i / 3) % 2) - 0.5) * 0.16,
  };
}

/** Grows or shrinks the panel list to the current layout's panel count. */
export function ensurePanels() {
  const n = layoutById(state.layout).panels;
  while (state.panels.length < n) state.panels.push(defaultCrop(state.panels.length));
  state.panels.length = n;
  if (state.selected >= n) state.selected = 0;
}

function setStatus(text) {
  statusEl.textContent = text;
}

/** Redraws the preview canvas at the selected export size. */
export function redraw() {
  ensurePanels();
  const size = sizeById(state.size);
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(canvas, state);
  renderPanelButtons();
  renderThumbs();
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Adds loaded images to the photo tray and redraws. */
export async function addPhotos(files) {
  let added = 0;
  for (const file of files) {
    try {
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      state.photos.push({ img, name: file.name || `Photo ${state.photos.length + 1}` });
      added++;
    } catch {
      // A file that is not an image is skipped, the rest still load.
    }
  }
  if (added) {
    setStatus(`${added} photo${added > 1 ? 's' : ''} loaded — click a panel, then a photo to place it.`);
    redraw();
  }
  return added;
}

/** Loads the two bundled sample photos (model-made, free to use). */
export async function loadSamples() {
  for (const [url, name] of [['samples/pier.jpg', 'Pier'], ['samples/boulevard.jpg', 'Boulevard']]) {
    if (state.photos.some((p) => p.name === name)) continue;
    const img = await loadImage(url);
    state.photos.push({ img, name });
  }
  setStatus('Sample photos loaded — replace them with your own any time.');
  redraw();
}

/** The photo tray: one thumbnail per photo, click to put it in the panel. */
export function renderThumbs() {
  const tray = document.getElementById('thumbs');
  tray.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    button.title = photo.name;
    const img = document.createElement('img');
    img.src = photo.img.src;
    img.alt = photo.name;
    button.appendChild(img);
    const label = document.createElement('span');
    label.textContent = photo.name.length > 14 ? `${photo.name.slice(0, 13)}…` : photo.name;
    button.appendChild(label);
    button.addEventListener('click', () => {
      state.panels[state.selected].photo = i;
      setStatus(`Panel ${state.selected + 1} now shows ${photo.name}.`);
      redraw();
    });
    tray.appendChild(button);
  });
  if (!state.photos.length) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'No photos yet — upload some, or try the samples.';
    tray.appendChild(hint);
  }
}

/** Panel picker buttons 1..N for the current layout. */
export function renderPanelButtons() {
  const row = document.getElementById('panelRow');
  row.innerHTML = '';
  const n = layoutById(state.layout).panels;
  for (let i = 0; i < n; i++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `panel-btn${i === state.selected ? ' active' : ''}`;
    button.textContent = `Panel ${i + 1}`;
    button.addEventListener('click', () => {
      state.selected = i;
      syncCropControls();
      redraw();
    });
    row.appendChild(button);
  }
  syncCropControls();
}

/** Copies the selected panel's crop into the sliders. */
export function syncCropControls() {
  const crop = state.panels[state.selected];
  if (!crop) return;
  document.getElementById('zoom').value = crop.zoom;
  document.getElementById('panX').value = Math.round(crop.ox * 100);
  document.getElementById('panY').value = Math.round(crop.oy * 100);
  document.getElementById('zoomVal').textContent = `${Math.round(crop.zoom * 100)}%`;
  document.getElementById('panXVal').textContent = `${Math.round(crop.ox * 100)}`;
  document.getElementById('panYVal').textContent = `${Math.round(crop.oy * 100)}`;
}

/** Builds the layout picker: six buttons with a tiny grid sketch each. */
export function buildLayoutPicker() {
  const grid = document.getElementById('layoutGrid');
  for (const layout of LAYOUTS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'layout-btn';
    button.dataset.layout = layout.id;
    button.title = `${layout.name} — ${layout.panels} panel${layout.panels > 1 ? 's' : ''}`;
    const sketch = document.createElement('span');
    sketch.className = `sketch sketch-${layout.id}`;
    button.appendChild(sketch);
    const label = document.createElement('span');
    label.textContent = layout.name;
    button.appendChild(label);
    button.addEventListener('click', () => {
      state.layout = layout.id;
      state.selected = 0;
      document.getElementById('layoutName').textContent = layout.name;
      document.querySelectorAll('.layout-btn').forEach((b) => b.classList.toggle('active', b === button));
      setStatus(`${layout.name}: ${layout.panels} panel${layout.panels > 1 ? 's' : ''}. Click a panel to crop it.`);
      redraw();
    });
    if (layout.id === state.layout) button.classList.add('active');
    grid.appendChild(button);
  }
}

/** Builds the grade picker: six colour swatches. */
export function buildGradePicker() {
  const grid = document.getElementById('gradeGrid');
  for (const grade of GRADES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'grade-btn';
    button.dataset.grade = grade.id;
    button.title = grade.name;
    button.style.background = `linear-gradient(135deg, ${grade.glow}, #1c0f2a 130%)`;
    const label = document.createElement('span');
    label.textContent = grade.name;
    button.appendChild(label);
    button.addEventListener('click', () => {
      state.grade = grade.id;
      document.querySelectorAll('.grade-btn').forEach((b) => b.classList.toggle('active', b === button));
      setStatus(`Grade: ${grade.name}.`);
      redraw();
    });
    if (grade.id === state.grade) button.classList.add('active');
    grid.appendChild(button);
  }
}

/** Builds the export-size picker; switching size re-frames the preview. */
export function buildSizePicker() {
  const row = document.getElementById('sizeRow');
  for (const size of SIZES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'size-btn';
    button.textContent = `${size.w} x ${size.h}`;
    button.addEventListener('click', () => {
      state.size = size.id;
      document.querySelectorAll('.size-btn').forEach((b) => b.classList.toggle('active', b === button));
      setStatus(`Preview: ${size.w} x ${size.h}.`);
      redraw();
    });
    if (size.id === state.size) button.classList.add('active');
    row.appendChild(button);
  }
}

/** Downloads one canvas as a PNG file. */
export function downloadCanvas(exportCanvas, filename) {
  return new Promise((resolve) => {
    exportCanvas.toBlob((blob) => {
      if (!blob) return resolve(false);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(true);
    }, 'image/png');
  });
}

/** Exports the current cover at one size. */
export async function exportSize(sizeId) {
  const size = sizeById(sizeId);
  const out = renderCover(state, size.w, size.h);
  const ok = await downloadCanvas(out, `vice-cover-${size.w}x${size.h}.png`);
  if (ok) setStatus(`Saved vice-cover-${size.w}x${size.h}.png`);
  return ok;
}

/** Exports all three post sizes, one after another. */
export async function exportAllSizes() {
  setStatus('Exporting all three sizes…');
  for (const size of SIZES) {
    // eslint-disable-next-line no-await-in-loop
    await exportSize(size.id);
  }
  setStatus('Saved all three sizes: 1080 x 1080, 1080 x 1350, 1920 x 1080.');
}

/** Which panel, if any, sits under a point on the preview canvas. */
export function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const fx = (clientX - rect.left) / rect.width;
  const fy = (clientY - rect.top) / rect.height;
  const layout = layoutById(state.layout);
  for (let i = layout.rects.length - 1; i >= 0; i--) {
    const r = layout.rects[i];
    if (fx >= r.x && fx <= r.x + r.w && fy >= r.y && fy <= r.y + r.h) return i;
  }
  return -1;
}

/** Click selects a panel; drag pans it; the wheel zooms it. */
export function bindCanvasGestures() {
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const i = panelAt(e.clientX, e.clientY);
    if (i < 0) return;
    state.selected = i;
    syncCropControls();
    redraw();
    drag = { x: e.clientX, y: e.clientY, ox: state.panels[i].ox, oy: state.panels[i].oy, panel: i };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const layout = layoutById(state.layout);
    const r = layout.rects[drag.panel];
    state.panels[drag.panel].ox = drag.ox + ((e.clientX - drag.x) / rect.width) / r.w;
    state.panels[drag.panel].oy = drag.oy + ((e.clientY - drag.y) / rect.height) / r.h;
    redraw();
  });
  canvas.addEventListener('pointerup', () => {
    if (drag) {
      const crop = state.panels[drag.panel];
      crop.ox = Math.max(-0.6, Math.min(0.6, crop.ox));
      crop.oy = Math.max(-0.6, Math.min(0.6, crop.oy));
      drag = null;
      syncCropControls();
      redraw();
    }
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const crop = state.panels[state.selected];
    if (!crop) return;
    crop.zoom = Math.max(1, Math.min(3, crop.zoom * (e.deltaY > 0 ? 0.94 : 1.06)));
    syncCropControls();
    redraw();
  }, { passive: false });
}

/** Binds every control in the sidebar to the state. */
export function bindControls() {
  document.getElementById('photo').addEventListener('change', async (e) => {
    await addPhotos(e.target.files);
    e.target.value = '';
  });
  document.getElementById('samples').addEventListener('click', loadSamples);
  document.getElementById('title').addEventListener('input', (e) => {
    state.title = e.target.value;
    redraw();
  });
  document.getElementById('subtitle').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    redraw();
  });
  document.getElementById('titleStyle').addEventListener('change', (e) => {
    state.titleStyle = e.target.value;
    redraw();
  });
  document.getElementById('titlePos').addEventListener('change', (e) => {
    state.titlePos = e.target.value;
    redraw();
  });
  document.getElementById('titleSize').addEventListener('input', (e) => {
    state.titleSize = Number(e.target.value);
    document.getElementById('titleSizeVal').textContent = `${Math.round(state.titleSize * 100)}%`;
    redraw();
  });
  document.getElementById('zoom').addEventListener('input', (e) => {
    state.panels[state.selected].zoom = Number(e.target.value);
    syncCropControls();
    redraw();
  });
  document.getElementById('panX').addEventListener('input', (e) => {
    state.panels[state.selected].ox = Number(e.target.value) / 100;
    syncCropControls();
    redraw();
  });
  document.getElementById('panY').addEventListener('input', (e) => {
    state.panels[state.selected].oy = Number(e.target.value) / 100;
    syncCropControls();
    redraw();
  });
  document.getElementById('fillAll').addEventListener('click', () => {
    const photo = state.panels[state.selected]?.photo ?? 0;
    for (const panel of state.panels) panel.photo = photo;
    setStatus(`All panels now use photo ${photo + 1}.`);
    redraw();
  });
  document.getElementById('shuffle').addEventListener('click', () => {
    state.panels.forEach((panel, i) => {
      const next = defaultCrop(i);
      panel.zoom = next.zoom;
      panel.ox = next.ox + (Math.random() - 0.5) * 0.2;
      panel.oy = next.oy + (Math.random() - 0.5) * 0.2;
    });
    setStatus('Crops shuffled — every panel frames the photo differently.');
    redraw();
  });
  for (const [id, key] of [['sun', 'sun'], ['grain', 'grain'], ['border', 'border']]) {
    document.getElementById(id).addEventListener('change', (e) => {
      state[key] = e.target.checked;
      redraw();
    });
  }
  document.getElementById('export').addEventListener('click', () => exportSize(state.size));
  document.getElementById('exportAll').addEventListener('click', exportAllSizes);
  bindCanvasGestures();
}

buildLayoutPicker();
buildGradePicker();
buildSizePicker();
bindControls();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  // Screenshot scenes: the shot module loads the samples and the fixed state.
  runShot(shot, new URLSearchParams(location.search), state, redraw);
} else {
  // Start with the samples in, so the first paint already looks like a cover.
  loadSamples().catch(() => redraw());
  redraw();
}
