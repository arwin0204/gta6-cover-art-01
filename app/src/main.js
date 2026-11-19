// Wires the page: pick a photo or a sample scene, arrange the panels, crop
// and position each one, edit the caption, pick a grade, and export the
// cover as a PNG. A `?shot=` query sets up a fixed scene for a screenshot
// instead (./shots.js).

import { drawCover, panelRects } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const taglineInput = document.getElementById('tagline');
const statusEl = document.getElementById('status');
const panelHint = document.getElementById('panelHint');

function defaultState() {
  return {
    layout: 'poster',
    grade: 'sunset',
    caption: 'SUNSET HEIST',
    tagline: 'Vice nights, neon lights',
    titleFont: 'bebas',
    titleColor: '#ffffff',
    titlePlace: 'bottom',
    size: '1080x1080',
    panels: [
      { photo: { kind: 'scene', scene: 'boulevard' }, zoom: 1, panX: 0, panY: 0 },
      { photo: { kind: 'scene', scene: 'pier' }, zoom: 1, panX: 0, panY: 0 },
      { photo: { kind: 'scene', scene: 'palms' }, zoom: 1, panX: 0, panY: 0 },
      { photo: { kind: 'scene', scene: 'boulevard' }, zoom: 1, panX: 0, panY: 0 },
    ],
    selected: 0,
  };
}

let state = defaultState();

function panelCount() {
  return state.layout === 'grid' ? 4 : state.layout === 'single' ? 1 : 3;
}

function selectedPanel() {
  return state.panels[state.selected];
}

function syncPanelControls() {
  const panel = selectedPanel();
  document.getElementById('zoom').value = panel.zoom;
  document.getElementById('panX').value = panel.panX;
  document.getElementById('panY').value = panel.panY;
  panelHint.textContent = `Panel ${state.selected + 1} of ${panelCount()} selected.`;
}

function redraw() {
  const [w, h] = state.size.split('x').map(Number);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(canvas, state);
  syncPanelControls();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('100px "Bebas Neue"'),
      document.fonts.load('100px "Anton"'),
      document.fonts.load('100px "Pacifico"'),
    ]);
  } catch {
    // The cover still draws with the fallback sans-serif.
  }
}

function markActive(containerId, attr, value) {
  for (const el of document.querySelectorAll(`#${containerId} [data-${attr}]`)) {
    el.classList.toggle('active', el.dataset[attr] === value);
  }
}

function setLayout(layout) {
  state.layout = layout;
  if (state.selected >= panelCount()) state.selected = 0;
  markActive('layoutRow', 'layout', layout);
  redraw();
}

function setGrade(grade) {
  state.grade = grade;
  markActive('gradeRow', 'grade', grade);
  redraw();
}

function setSize(size) {
  state.size = size;
  markActive('sizeRow', 'size', size);
  redraw();
}

function setTitleColor(color) {
  state.titleColor = color;
  markActive('colorRow', 'color', color);
  redraw();
}

function setPlace(place) {
  state.titlePlace = place;
  document.querySelectorAll('.place').forEach((el) => {
    el.classList.toggle('active', el.dataset.place === place);
  });
  redraw();
}

function exportPNG() {
  const [w, h] = state.size.split('x').map(Number);
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) {
      statusEl.textContent = 'Export failed.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${state.size}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved cover-${state.size}.png`;
  }, 'image/png');
}

/** Testing hook: renders the current cover at w x h and returns a PNG data URL. */
window.__exportPNG = (w, h) => {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state);
  return off.toDataURL('image/png');
};

document.querySelectorAll('#sceneRow .scene').forEach((el) => {
  el.addEventListener('click', () => {
    selectedPanel().photo = { kind: 'scene', scene: el.dataset.scene };
    redraw();
  });
});

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    selectedPanel().photo = { kind: 'image', img: await loadImage(URL.createObjectURL(file)) };
    statusEl.textContent = `Loaded ${file.name}.`;
    redraw();
  } catch {
    statusEl.textContent = 'Could not read that photo.';
  }
});

document.getElementById('fillAll').addEventListener('click', () => {
  const photo = selectedPanel().photo;
  for (const panel of state.panels) panel.photo = photo;
  redraw();
});

document.querySelectorAll('#layoutRow .layout').forEach((el) => {
  el.addEventListener('click', () => setLayout(el.dataset.layout));
});
document.querySelectorAll('#gradeRow .grade').forEach((el) => {
  el.addEventListener('click', () => setGrade(el.dataset.grade));
});
document.querySelectorAll('#sizeRow .size').forEach((el) => {
  el.addEventListener('click', () => setSize(el.dataset.size));
});
document.querySelectorAll('#colorRow .swatch').forEach((el) => {
  el.addEventListener('click', () => setTitleColor(el.dataset.color));
});
document.querySelectorAll('.place').forEach((el) => {
  el.addEventListener('click', () => setPlace(el.dataset.place));
});

document.getElementById('zoom').addEventListener('input', (e) => {
  selectedPanel().zoom = Number(e.target.value);
  redraw();
});
document.getElementById('panX').addEventListener('input', (e) => {
  selectedPanel().panX = Number(e.target.value);
  redraw();
});
document.getElementById('panY').addEventListener('input', (e) => {
  selectedPanel().panY = Number(e.target.value);
  redraw();
});
captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  redraw();
});
taglineInput.addEventListener('input', () => {
  state.tagline = taglineInput.value;
  redraw();
});
document.getElementById('titleFont').addEventListener('change', (e) => {
  state.titleFont = e.target.value;
  redraw();
});
document.getElementById('export').addEventListener('click', exportPNG);

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  const rects = panelRects(state.layout, canvas.width, canvas.height);
  const idx = rects.findIndex((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  if (idx >= 0) {
    state.selected = idx;
    syncPanelControls();
  }
});

const preview = document.querySelector('.preview');
preview.addEventListener('dragover', (e) => e.preventDefault());
preview.addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  try {
    selectedPanel().photo = { kind: 'image', img: await loadImage(URL.createObjectURL(file)) };
    statusEl.textContent = `Loaded ${file.name}.`;
    redraw();
  } catch {
    statusEl.textContent = 'Could not read that photo.';
  }
});

markActive('layoutRow', 'layout', state.layout);
markActive('gradeRow', 'grade', state.grade);
markActive('sizeRow', 'size', state.size);
markActive('colorRow', 'color', state.titleColor);
setPlace(state.titlePlace);

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  await ensureFonts();
  await runShot(shot, query, async (shotState) => {
    state = { ...defaultState(), ...shotState };
    captionInput.value = state.caption;
    taglineInput.value = state.tagline;
    document.getElementById('titleFont').value = state.titleFont;
    markActive('layoutRow', 'layout', state.layout);
    markActive('gradeRow', 'grade', state.grade);
    markActive('sizeRow', 'size', state.size);
    markActive('colorRow', 'color', state.titleColor);
    setPlace(state.titlePlace);
    redraw();
  });
} else {
  redraw();
  ensureFonts().then(redraw);
}
