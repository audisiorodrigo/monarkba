export interface ScrollCameraPose {
  posX: number;
  posY: number;
  posZ: number;
  lookX: number;
  lookY: number;
  lookZ: number;
  rollZ: number;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

/**
 * Normalizes page scroll position to [0, 1].
 */
export function computeScrollProgress(
  scrollY: number,
  scrollHeight: number,
  viewportHeight: number
): number {
  const maxScroll = Math.max(1, scrollHeight - viewportHeight);
  return clamp01(scrollY / maxScroll);
}

/**
 * Computes how intensely the pink LED 3D rig activates:
 * - Rests subtly at top of page (0.22 baseline ambient)
 * - Ramps rapidly into full luminous LED choreography as the user scrolls down
 * - Receives kinetic surge boost from instantaneous scroll velocity
 */
export function computeLedActivation(
  scrollProgress: number,
  scrollVelocity: number
): number {
  const scrollRamp = smoothstep(0.015, 0.24, clamp01(scrollProgress));
  const velocityBoost = clamp01(Math.abs(scrollVelocity) * 0.45);
  return clamp01(0.22 + scrollRamp * 0.65 + velocityBoost * 0.35);
}

/**
 * Maps scroll progress [0..1] + pointer [-1..1] into a smooth Lusion-style
 * 3D camera flight through the pink LED light architecture.
 */
export function computeScrollCameraPose(
  scrollProgress: number,
  pointerX: number,
  pointerY: number
): ScrollCameraPose {
  const p = clamp01(scrollProgress);
  const px = Number.isFinite(pointerX) ? Math.max(-1, Math.min(1, pointerX)) : 0;
  const py = Number.isFinite(pointerY) ? Math.max(-1, Math.min(1, pointerY)) : 0;

  // Sweep smoothly through depth + gentle orbital arc as user scrolls down
  const posX = Math.sin(p * Math.PI * 1.35) * 1.45 + px * 0.55;
  const posY = 0.65 - p * 0.85 + Math.sin(p * Math.PI * 2.0) * 0.35 - py * 0.35;
  const posZ = 6.2 - p * 3.4;

  const lookX = Math.sin(p * Math.PI * 1.1) * 0.45 + px * 0.22;
  const lookY = -p * 0.35 - py * 0.14;
  const lookZ = -2.2 - p * 2.4;

  const rollZ = Math.sin(p * Math.PI * 1.5) * 0.065 - px * 0.035;

  return { posX, posY, posZ, lookX, lookY, lookZ, rollZ };
}

export function dampValue(
  current: number,
  target: number,
  lambda: number,
  deltaSeconds: number
): number {
  const safeDt = Math.max(0, Math.min(deltaSeconds, 0.1));
  const t = 1 - Math.exp(-lambda * safeDt);
  return current + (target - current) * t;
}
