// Multi-panel layouts for the cover. A layout is a list of panels; each panel
// is a rectangle in unit space (x, y, w, h as fractions of the cover) plus an
// optional diagonal clip: when `slant` is set, the panel's right edge leans by
// that fraction of the cover width, top and bottom in opposite directions, so
// the poster reads like a comic-book page instead of a plain grid.
export const LAYOUTS = [
  {
    id: 'hero',
    name: 'Hero',
    panels: 1,
    rects: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  {
    id: 'split',
    name: 'Split Duo',
    panels: 2,
    rects: [
      { x: 0, y: 0, w: 0.56, h: 1, slant: 0.05 },
      { x: 0.56, y: 0, w: 0.44, h: 1, slant: 0.05 },
    ],
  },
  {
    id: 'trio',
    name: 'Triple Strip',
    panels: 3,
    rects: [
      { x: 0, y: 0, w: 0.35, h: 1, slant: 0.03 },
      { x: 0.35, y: 0, w: 0.33, h: 1, slant: 0.03 },
      { x: 0.68, y: 0, w: 0.32, h: 1, slant: 0.03 },
    ],
  },
  {
    id: 'mosaic5',
    name: 'Mosaic 5',
    panels: 5,
    rects: [
      { x: 0, y: 0, w: 0.6, h: 1, slant: 0.02 },
      { x: 0.6, y: 0, w: 0.2, h: 0.5 },
      { x: 0.8, y: 0, w: 0.2, h: 0.5 },
      { x: 0.6, y: 0.5, w: 0.2, h: 0.5 },
      { x: 0.8, y: 0.5, w: 0.2, h: 0.5 },
    ],
  },
  {
    id: 'grid6',
    name: 'Grid 6',
    panels: 6,
    rects: [
      { x: 0, y: 0, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 0, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
    ],
  },
  {
    id: 'grid9',
    name: 'Grid 9',
    panels: 9,
    rects: [
      { x: 0, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
    ],
  },
];

/** Looks a layout up by id, falling back to the first layout. */
export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

/** The export sizes the app offers, in pixels. */
export const SIZES = [
  { id: 'square', name: 'Square 1080 x 1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide 1920 x 1080', w: 1920, h: 1080 },
];

/** Looks an export size up by id, falling back to the square. */
export function sizeById(id) {
  return SIZES.find((s) => s.id === id) ?? SIZES[0];
}
