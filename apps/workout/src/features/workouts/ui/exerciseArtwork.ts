import type { Exercise } from "../domain";
import { barbellArtwork } from "./artwork/barbell";
import { dumbbellArtwork } from "./artwork/dumbbell";
import { cableArtwork } from "./artwork/cable";
import { machineArtwork } from "./artwork/machine";
import { bodyweightArtwork } from "./artwork/bodyweight";

// Explicit equipment matches; do not infer artwork for custom exercises.
const artwork: ReadonlyMap<
  string,
  { name: string; equipment: string; src: string }
> = new Map(
  [barbellArtwork, dumbbellArtwork, cableArtwork, machineArtwork, bodyweightArtwork].flatMap((group) =>
    Object.entries(group).flatMap(([equipment, rows]) =>
      rows.map(([id, name, src]) => [id, { name, equipment, src }] as const),
    ),
  ),
);

export function exerciseArtwork(exercise: Exercise | undefined): string | undefined {
  if (!exercise || exercise.custom) return undefined;
  const match = artwork.get(exercise.id);
  if (match?.name !== exercise.name || match.equipment !== exercise.equipment) return undefined;
  return match.src;
}
