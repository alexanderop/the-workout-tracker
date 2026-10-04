import type { Exercise } from "../domain";
import benchPress from "./assets/exercises/bench-press.png";
import squat from "./assets/exercises/squat.png";
import deadlift from "./assets/exercises/deadlift.png";
import shoulderPress from "./assets/exercises/shoulder-press.png";
import latPulldown from "./assets/exercises/lat-pulldown.png";
import seatedRow from "./assets/exercises/seated-row.png";

// Explicit equipment matches; do not infer artwork for custom exercises.
const artwork: ReadonlyMap<string, { name: string; equipment: string; src: string }> = new Map([
  ["bench-press", { name: "Bench press", equipment: "Barbell", src: benchPress }],
  ["squat", { name: "Back squat", equipment: "Barbell", src: squat }],
  ["front-squat", { name: "Front squat", equipment: "Barbell", src: squat }],
  ["deadlift", { name: "Deadlift", equipment: "Barbell", src: deadlift }],
  ["romanian-deadlift", { name: "Romanian deadlift", equipment: "Barbell", src: deadlift }],
  ["sumo-deadlift", { name: "Sumo deadlift", equipment: "Barbell", src: deadlift }],
  ["dumbbell-shoulder-press", { name: "Dumbbell shoulder press", equipment: "Dumbbell", src: shoulderPress }],
  ["arnold-press", { name: "Arnold press", equipment: "Dumbbell", src: shoulderPress }],
  ["lat-pulldown", { name: "Lat pulldown", equipment: "Cable", src: latPulldown }],
  ["seated-cable-row", { name: "Seated cable row", equipment: "Cable", src: seatedRow }],
  ["close-grip-bench-press", { name: "Close-grip bench press", equipment: "Barbell", src: benchPress }],
]);

export function exerciseArtwork(exercise: Exercise | undefined): string | undefined {
  if (!exercise || exercise.custom) return undefined;
  const match = artwork.get(exercise.id);
  if (match?.name !== exercise.name || match.equipment !== exercise.equipment) return undefined;
  return match.src;
}
