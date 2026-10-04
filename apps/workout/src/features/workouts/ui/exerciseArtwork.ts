import type { Exercise } from "../domain";
import benchPress from "./assets/exercises/bench-press.webp";
import squat from "./assets/exercises/squat.webp";
import deadlift from "./assets/exercises/deadlift.webp";
import shoulderPress from "./assets/exercises/shoulder-press.webp";
import latPulldown from "./assets/exercises/lat-pulldown.webp";
import seatedRow from "./assets/exercises/seated-row.webp";

import overheadPress from "./assets/exercises/overhead-press.webp";
import row from "./assets/exercises/row.webp";
import legPress from "./assets/exercises/leg-press.webp";
import bicepsCurl from "./assets/exercises/biceps-curl.webp";
import tricepsExtension from "./assets/exercises/triceps-extension.webp";
import lateralRaise from "./assets/exercises/lateral-raise.webp";
import inclineBenchPress from "./assets/exercises/incline-bench-press.webp";
import dumbbellBenchPress from "./assets/exercises/dumbbell-bench-press.webp";
import inclineDumbbellPress from "./assets/exercises/incline-dumbbell-press.webp";
import cableFly from "./assets/exercises/cable-fly.webp";
import chestPress from "./assets/exercises/chest-press.webp";
import pecDeck from "./assets/exercises/pec-deck.webp";
import pullUp from "./assets/exercises/pull-up.webp";
import legExtension from "./assets/exercises/leg-extension.webp";
import seatedLegCurl from "./assets/exercises/seated-leg-curl.webp";
import hackSquat from "./assets/exercises/hack-squat.webp";
import hipThrust from "./assets/exercises/hip-thrust.webp";
import standingCalfRaise from "./assets/exercises/standing-calf-raise.webp";
import preacherCurl from "./assets/exercises/preacher-curl.webp";
import abWheelRollout from "./assets/exercises/ab-wheel-rollout.webp";

import declineBenchPress from "./assets/exercises/decline-bench-press.webp";
import chestDip from "./assets/exercises/chest-dip.webp";
import assistedPullUp from "./assets/exercises/assisted-pull-up.webp";
import barbellRow from "./assets/exercises/barbell-row.webp";
import chestSupportedRow from "./assets/exercises/chest-supported-row.webp";
import tBarRow from "./assets/exercises/t-bar-row.webp";
import backExtension from "./assets/exercises/back-extension.webp";
import gobletSquat from "./assets/exercises/goblet-squat.webp";
import bulgarianSplitSquat from "./assets/exercises/bulgarian-split-squat.webp";
import stepUp from "./assets/exercises/step-up.webp";
import lyingLegCurl from "./assets/exercises/lying-leg-curl.webp";
import seatedCalfRaise from "./assets/exercises/seated-calf-raise.webp";
import hipAbduction from "./assets/exercises/hip-abduction.webp";
import facePull from "./assets/exercises/face-pull.webp";
import shoulderPressMachine from "./assets/exercises/shoulder-press-machine.webp";
import hammerCurl from "./assets/exercises/hammer-curl.webp";
import barbellCurl from "./assets/exercises/barbell-curl.webp";
import cableCurl from "./assets/exercises/cable-curl.webp";
import ropeTricepsPushdown from "./assets/exercises/rope-triceps-pushdown.webp";
import skullCrusher from "./assets/exercises/skull-crusher.webp";

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
  ["overhead-press", { name: "Overhead press", equipment: "Barbell", src: overheadPress }],
  ["row", { name: "Dumbbell row", equipment: "Dumbbell", src: row }],
  ["leg-press", { name: "Leg press", equipment: "Machine", src: legPress }],
  ["biceps-curl", { name: "Biceps curl", equipment: "Dumbbell", src: bicepsCurl }],
  ["triceps-extension", { name: "Triceps extension", equipment: "Cable", src: tricepsExtension }],
  ["lateral-raise", { name: "Lateral raise", equipment: "Dumbbell", src: lateralRaise }],
  ["incline-bench-press", { name: "Incline bench press", equipment: "Barbell", src: inclineBenchPress }],
  ["dumbbell-bench-press", { name: "Dumbbell bench press", equipment: "Dumbbell", src: dumbbellBenchPress }],
  ["incline-dumbbell-press", { name: "Incline dumbbell press", equipment: "Dumbbell", src: inclineDumbbellPress }],
  ["cable-fly", { name: "Cable fly", equipment: "Cable", src: cableFly }],
  ["chest-press", { name: "Chest press", equipment: "Machine", src: chestPress }],
  ["pec-deck", { name: "Pec deck", equipment: "Machine", src: pecDeck }],
  ["pull-up", { name: "Pull-up", equipment: "Bodyweight", src: pullUp }],
  ["leg-extension", { name: "Leg extension", equipment: "Machine", src: legExtension }],
  ["seated-leg-curl", { name: "Seated leg curl", equipment: "Machine", src: seatedLegCurl }],
  ["hack-squat", { name: "Hack squat", equipment: "Machine", src: hackSquat }],
  ["hip-thrust", { name: "Hip thrust", equipment: "Barbell", src: hipThrust }],
  ["standing-calf-raise", { name: "Standing calf raise", equipment: "Machine", src: standingCalfRaise }],
  ["preacher-curl", { name: "Preacher curl", equipment: "Machine", src: preacherCurl }],
  ["ab-wheel-rollout", { name: "Ab wheel rollout", equipment: "Other", src: abWheelRollout }],
  ["decline-bench-press", { name: "Decline bench press", equipment: "Barbell", src: declineBenchPress }],
  ["chest-dip", { name: "Chest dip", equipment: "Bodyweight", src: chestDip }],
  ["assisted-pull-up", { name: "Assisted pull-up", equipment: "Machine", src: assistedPullUp }],
  ["barbell-row", { name: "Barbell row", equipment: "Barbell", src: barbellRow }],
  ["chest-supported-row", { name: "Chest-supported row", equipment: "Dumbbell", src: chestSupportedRow }],
  ["t-bar-row", { name: "T-bar row", equipment: "Machine", src: tBarRow }],
  ["back-extension", { name: "Back extension", equipment: "Bodyweight", src: backExtension }],
  ["goblet-squat", { name: "Goblet squat", equipment: "Dumbbell", src: gobletSquat }],
  ["bulgarian-split-squat", { name: "Bulgarian split squat", equipment: "Dumbbell", src: bulgarianSplitSquat }],
  ["step-up", { name: "Step-up", equipment: "Dumbbell", src: stepUp }],
  ["lying-leg-curl", { name: "Lying leg curl", equipment: "Machine", src: lyingLegCurl }],
  ["seated-calf-raise", { name: "Seated calf raise", equipment: "Machine", src: seatedCalfRaise }],
  ["hip-abduction", { name: "Hip abduction", equipment: "Machine", src: hipAbduction }],
  ["face-pull", { name: "Face pull", equipment: "Cable", src: facePull }],
  ["shoulder-press-machine", { name: "Shoulder press machine", equipment: "Machine", src: shoulderPressMachine }],
  ["hammer-curl", { name: "Hammer curl", equipment: "Dumbbell", src: hammerCurl }],
  ["barbell-curl", { name: "Barbell curl", equipment: "Barbell", src: barbellCurl }],
  ["cable-curl", { name: "Cable curl", equipment: "Cable", src: cableCurl }],
  ["rope-triceps-pushdown", { name: "Rope triceps pushdown", equipment: "Cable", src: ropeTricepsPushdown }],
  ["skull-crusher", { name: "Skull crusher", equipment: "Barbell", src: skullCrusher }],
]);

export function exerciseArtwork(exercise: Exercise | undefined): string | undefined {
  if (!exercise || exercise.custom) return undefined;
  const match = artwork.get(exercise.id);
  if (match?.name !== exercise.name || match.equipment !== exercise.equipment) return undefined;
  return match.src;
}
