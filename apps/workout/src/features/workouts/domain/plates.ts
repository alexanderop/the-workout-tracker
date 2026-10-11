import { defaultBarbell, type Barbell, type Snapshot } from "./schemas";

/** The bar and plates a lifter loads, falling back to a standard 20 kg setup. */
export function barbellSettings(settings: Snapshot["settings"]): Barbell {
  return settings.barbell ?? defaultBarbell;
}

type PlateLoad = Readonly<{
  /** Plates for one side of the bar, heaviest first. */
  perSide: readonly number[];
  /** Total weight the owned plates cannot make up; 0 when loadable exactly. */
  remainderKg: number;
}>;

// Plate sizes such as 1.25 kg are not exact binary fractions, so the
// arithmetic runs in whole grams.
const grams = (kg: number) => Math.round(kg * 1000);

/**
 * Plates for each side of a barbell that make up `totalKg`, assuming as many
 * of each owned size as needed. Heaviest-first is exact for standard plate
 * sets; a remainder reports what the owned plates cannot add. Returns null
 * when the total is lighter than the empty bar.
 */
export function loadBarbell(
  totalKg: number,
  barbell: Barbell,
): PlateLoad | null {
  if (!Number.isFinite(totalKg) || totalKg < barbell.barKg) return null;
  const plates = [...new Set(barbell.platesKg.map(grams))]
    .filter((plate) => plate > 0)
    .sort((a, b) => b - a);
  const extra = grams(totalKg) - grams(barbell.barKg);
  let open = Math.floor(extra / 2);
  const perSide: number[] = [];
  for (const plate of plates) {
    while (open >= plate) {
      perSide.push(plate / 1000);
      open -= plate;
    }
  }
  const loadedSide = Math.floor(extra / 2) - open;
  return { perSide, remainderKg: (extra - 2 * loadedSide) / 1000 };
}
