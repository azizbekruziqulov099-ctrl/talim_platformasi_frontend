/** Pure geometry shared by the editor model. Stored invalid input is never clamped. */
export const CANVAS = Object.freeze({ width: 1280, height: 720 });
export const PLACEMENT_FIELDS = Object.freeze(['title', 'body', 'body2', 'body3', 'formula', 'example', 'image', 'image2']);
const finite = value => typeof value === 'number' && Number.isFinite(value);
export function placementBounds(field, slide = {}) {
  const caption = slide[`${field}_caption`];
  return {
    top: field === 'example' && slide.example ? 28 : 0,
    bottom: ['image', 'image2'].includes(field) && slide[field] && typeof caption === 'string' && caption.trim() ? 682 : 720,
  };
}
export function validPlacement(rect, field, slide) {
  if (!rect || typeof rect !== 'object' || Array.isArray(rect)) return false;
  if (!['x', 'y', 'w', 'h'].every(key => finite(rect[key]))) return false;
  const { top, bottom } = placementBounds(field, slide);
  return rect.x >= 0 && rect.y >= top && rect.w >= 1 && rect.h >= 1
    && rect.x + rect.w <= CANVAS.width && rect.y + rect.h <= bottom;
}
/** For editor gestures only; document normalization preserves values for validation. */
export function clampPlacement(rect = {}, field, slide) {
  const { top, bottom } = placementBounds(field, slide);
  const safe = (value, fallback) => finite(value) ? value : fallback;
  const w = Math.max(1, Math.min(CANVAS.width, safe(rect.w, 320)));
  const h = Math.max(1, Math.min(bottom - top, safe(rect.h, 120)));
  return { x: Math.max(0, Math.min(CANVAS.width - w, safe(rect.x, 96))),
    y: Math.max(top, Math.min(bottom - h, safe(rect.y, 254))), w, h };
}
