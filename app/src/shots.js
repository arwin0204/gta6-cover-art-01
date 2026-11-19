// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo loaded; ?shot=cover shows the cover alone, full screen. Query
// params pick the scene: photo, photo2, photo3, photo4 (sample scene ids),
// caption, tagline, layout, grade, size (WxH), font, color, place.
// window.__shotReady is set once the scene is painted.

const DEFAULT_PHOTOS = ['boulevard', 'pier', 'palms', 'boulevard'];

function panelPhotos(query) {
  const photos = [];
  for (let i = 0; i < 4; i++) {
    const scene = query.get(`photo${i === 0 ? '' : i + 1}`) ?? DEFAULT_PHOTOS[i];
    photos.push({ photo: { kind: 'scene', scene }, zoom: 1, panX: 0, panY: 0 });
  }
  return photos;
}

export async function runShot(shot, query, apply) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const state = {
    layout: query.get('layout') ?? 'poster',
    grade: query.get('grade') ?? 'sunset',
    caption: query.get('caption') ?? 'Sunset Heist',
    tagline: query.get('tagline') ?? 'Vice nights, neon lights',
    titleFont: query.get('font') ?? 'bebas',
    titleColor: query.get('color') ?? '#ffffff',
    titlePlace: query.get('place') ?? 'bottom',
    size: query.get('size') ?? '1080x1080',
    panels: panelPhotos(query),
    selected: 0,
  };
  await apply(state);
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
