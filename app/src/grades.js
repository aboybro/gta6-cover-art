// Colour grades for the cover: each grade tints the photos (a canvas filter
// applied while a panel is drawn) and washes the whole cover with a sunset or
// neon gradient. Nothing here is a Rockstar asset: every colour is our own.
export const GRADES = [
  {
    id: 'vice',
    name: 'Vice Sunset',
    filter: 'saturate(1.35) contrast(1.08) brightness(1.03)',
    // [offset, colour] stops for the top-to-bottom wash.
    wash: [
      [0, 'rgba(255, 94, 138, 0.10)'],
      [0.45, 'rgba(255, 120, 80, 0.05)'],
      [1, 'rgba(190, 30, 110, 0.42)'],
    ],
    glow: '#ff7a3d',
    title: '#ffffff',
    accent: '#ffd166',
  },
  {
    id: 'neon',
    name: 'Neon Pink',
    filter: 'saturate(1.55) contrast(1.12) brightness(1.0) hue-rotate(-8deg)',
    wash: [
      [0, 'rgba(255, 0, 160, 0.16)'],
      [0.5, 'rgba(150, 0, 255, 0.06)'],
      [1, 'rgba(255, 0, 140, 0.45)'],
    ],
    glow: '#ff2fb3',
    title: '#ffffff',
    accent: '#7df9ff',
  },
  {
    id: 'coral',
    name: 'Coral Coast',
    filter: 'saturate(1.3) contrast(1.06) brightness(1.04) hue-rotate(6deg)',
    wash: [
      [0, 'rgba(0, 190, 200, 0.14)'],
      [0.5, 'rgba(255, 150, 90, 0.04)'],
      [1, 'rgba(0, 120, 160, 0.40)'],
    ],
    glow: '#ff9e5e',
    title: '#ffffff',
    accent: '#ff9e5e',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    filter: 'saturate(1.15) contrast(1.15) brightness(0.92) hue-rotate(18deg)',
    wash: [
      [0, 'rgba(20, 10, 60, 0.28)'],
      [0.5, 'rgba(60, 20, 120, 0.10)'],
      [1, 'rgba(10, 5, 40, 0.50)'],
    ],
    glow: '#8b5cf6',
    title: '#f5f0ff',
    accent: '#c4b5fd',
  },
  {
    id: 'gold',
    name: 'Palm Gold',
    filter: 'saturate(1.45) contrast(1.05) brightness(1.06) hue-rotate(-12deg)',
    wash: [
      [0, 'rgba(255, 190, 60, 0.18)'],
      [0.5, 'rgba(255, 140, 40, 0.05)'],
      [1, 'rgba(160, 70, 10, 0.42)'],
    ],
    glow: '#ffb703',
    title: '#fff7e0',
    accent: '#ff6d00',
  },
  {
    id: 'noir',
    name: 'Mono Noir',
    filter: 'grayscale(1) contrast(1.35) brightness(1.02)',
    wash: [
      [0, 'rgba(255, 255, 255, 0.06)'],
      [0.5, 'rgba(0, 0, 0, 0.05)'],
      [1, 'rgba(0, 0, 0, 0.48)'],
    ],
    glow: '#e5e5e5',
    title: '#ffffff',
    accent: '#ffd166',
  },
];

/** Looks a grade up by id, falling back to the first grade. */
export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}
