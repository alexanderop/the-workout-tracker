/** Distance in pixels before a press on the sheet header becomes a drag. */
export const sheetDragSlop = 8;

/**
 * Decides whether a downward drag on a mobile sheet dismisses it: a long
 * enough pull, or a short flick. Upward or sideways movement never dismisses.
 */
export function shouldDismissSheet(
  distance: number,
  velocity: number,
  height: number,
): boolean {
  if (distance <= sheetDragSlop) return false;
  return distance > Math.min(140, height * 0.3) || velocity > 0.6;
}

/** Resistance applied when the sheet is pulled above its resting position. */
export function sheetDragOffset(distance: number): number {
  return distance >= 0 ? distance : -Math.sqrt(-distance) * 2;
}
