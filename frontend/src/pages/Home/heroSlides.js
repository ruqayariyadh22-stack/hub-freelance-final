import hero01 from './assets/Image 1.jpeg';
import hero02 from './assets/Image 2.jpeg';
import hero03 from './assets/Image 3.jpeg';

/** Image-derived accents — inspected from the three assets (cyan holographic set). */
export const HERO_SLIDES = [
  {
    id: 'hero-01',
    src: hero01,
    label: 'Collaborative workspace',
    /** Electric cyan from holographic teammates */
    glowRgb: '0, 180, 220',
    accent: '#6fd4ea',
    depth: '0.22',
    objectPosition: '52% 28%',
  },
  {
    id: 'hero-02',
    src: hero02,
    label: 'Human + digital craft',
    /** Brighter cyan core around the holographic portrait */
    glowRgb: '0, 210, 240',
    accent: '#7cefff',
    depth: '0.24',
    objectPosition: '55% 40%',
  },
  {
    id: 'hero-03',
    src: hero03,
    label: 'Global marketplace view',
    /** Softer slate-cyan from the globe interface */
    glowRgb: '140, 190, 210',
    accent: '#9ecfe0',
    depth: '0.16',
    objectPosition: '62% 42%',
  },
];

export const HERO_HOLD_MS = 4800;
export const HERO_TRANSITION_MS = 900;
