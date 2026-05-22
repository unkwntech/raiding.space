import { RegionGlowSets } from '../types/app';

export function parseElementId(element: Element): number | null {
  const id = element.id;
  if (!id) return null;
  const match = id.match(/(\d+)$/);
  if (!match) return null;
  const parsed = parseInt(match[1], 10);
  return isNaN(parsed) ? null : parsed;
}

export function applyHighlights(container: Element, ids: ReadonlySet<number>, className: string): void {
  for (const id of ids) {
    // Target the rect inside the symbol definition — that's where fill is applied
    const el = container.querySelector(`#rect${id}, #def${id} rect`);
    if (el) el.classList.add(className);
  }
}

export function clearHighlights(container: Element, className: string): void {
  container.querySelectorAll(`.${className}`).forEach((el) => el.classList.remove(className));
}

const GLOW_FILTER_ID = 'raiding-glow-filters';

const GLOW_FILTERS = `
<filter id="glow-green" x="-75%" y="-75%" width="250%" height="250%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
  <feColorMatrix in="blur" type="matrix"
    values="0 0 0 0 0
            0 1 0 0 0.6
            0 0 0 0 0
            0 0 0 1 0" result="green"/>
  <feMerge><feMergeNode in="green"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="glow-red" x="-75%" y="-75%" width="250%" height="250%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
  <feColorMatrix in="blur" type="matrix"
    values="1 0 0 0 0.8
            0 0 0 0 0
            0 0 0 0 0
            0 0 0 1 0" result="red"/>
  <feMerge><feMergeNode in="red"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="glow-white" x="-75%" y="-75%" width="250%" height="250%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
`;

function ensureGlowFilters(container: Element): void {
  if (container.querySelector(`#${GLOW_FILTER_ID}`)) return;
  const defs = container.querySelector('defs');
  if (!defs) return;
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.id = GLOW_FILTER_ID;
  group.innerHTML = GLOW_FILTERS;
  defs.appendChild(group);
}

const GLOW_CLASSES = ['glow-green', 'glow-red', 'glow-white'] as const;

export function applyRegionGlows(container: Element, glowSets: RegionGlowSets): void {
  ensureGlowFilters(container);

  // Clear all existing glow classes from <use> elements
  for (const cls of GLOW_CLASSES) {
    container.querySelectorAll(`.${cls}`).forEach((el) => {
      el.classList.remove(cls);
      (el as SVGElement).style.filter = '';
    });
  }

  // Priority order: green > white > red. Track claimed IDs to ensure only one glow per element.
  const claimed = new Set<number>();

  const entries: [keyof RegionGlowSets, string][] = [
    ['green', 'glow-green'],
    ['white', 'glow-white'],
    ['red', 'glow-red'],
  ];

  for (const [key, cls] of entries) {
    for (const id of glowSets[key]) {
      if (claimed.has(id)) continue;
      const el = container.querySelector(`#sys${id}`) as SVGElement | null;
      if (!el) continue;
      el.classList.add(cls);
      el.style.filter = `url(#${cls})`;
      claimed.add(id);
    }
  }
}
