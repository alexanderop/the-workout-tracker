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

import pushUp from "./assets/exercises/push-up.webp";
import dumbbellFly from "./assets/exercises/dumbbell-fly.webp";
import lowCableFly from "./assets/exercises/low-cable-fly.webp";
import inclinePushUp from "./assets/exercises/incline-push-up.webp";
import chinUp from "./assets/exercises/chin-up.webp";
import closeGripPulldown from "./assets/exercises/close-grip-pulldown.webp";
import straightArmPulldown from "./assets/exercises/straight-arm-pulldown.webp";
import invertedRow from "./assets/exercises/inverted-row.webp";
import dumbbellPullover from "./assets/exercises/dumbbell-pullover.webp";
import reverseLunge from "./assets/exercises/reverse-lunge.webp";
import walkingLunge from "./assets/exercises/walking-lunge.webp";
import gluteBridge from "./assets/exercises/glute-bridge.webp";
import hipAdduction from "./assets/exercises/hip-adduction.webp";
import singleLegRomanianDeadlift from "./assets/exercises/single-leg-romanian-deadlift.webp";
import cableLateralRaise from "./assets/exercises/cable-lateral-raise.webp";
import frontRaise from "./assets/exercises/front-raise.webp";
import reverseFly from "./assets/exercises/reverse-fly.webp";
import reversePecDeck from "./assets/exercises/reverse-pec-deck.webp";
import dumbbellShrug from "./assets/exercises/dumbbell-shrug.webp";
import inclineDumbbellCurl from "./assets/exercises/incline-dumbbell-curl.webp";
import concentrationCurl from "./assets/exercises/concentration-curl.webp";
import overheadTricepsExtension from "./assets/exercises/overhead-triceps-extension.webp";
import tricepsKickback from "./assets/exercises/triceps-kickback.webp";
import crunch from "./assets/exercises/crunch.webp";
import cableCrunch from "./assets/exercises/cable-crunch.webp";
import egymAbdominalCrunch from "./assets/exercises/egym-abdominal-crunch.webp";
import egymRotaryTorso from "./assets/exercises/egym-rotary-torso.webp";
import egymSquat from "./assets/exercises/egym-squat.webp";
import egymSeatedRow from "./assets/exercises/egym-seated-row.webp";
import egymLatPulldown from "./assets/exercises/egym-lat-pulldown.webp";
import egymShoulderPress from "./assets/exercises/egym-shoulder-press.webp";
import egymChestPress from "./assets/exercises/egym-chest-press.webp";
import hangingKneeRaise from "./assets/exercises/hanging-knee-raise.webp";
import hangingLegRaise from "./assets/exercises/hanging-leg-raise.webp";
import reverseCrunch from "./assets/exercises/reverse-crunch.webp";
import russianTwist from "./assets/exercises/russian-twist.webp";
import pallofPress from "./assets/exercises/pallof-press.webp";
import deadBug from "./assets/exercises/dead-bug.webp";

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
  ["push-up", { name: "Push-up", equipment: "Bodyweight", src: pushUp }],
  ["dumbbell-fly", { name: "Dumbbell fly", equipment: "Dumbbell", src: dumbbellFly }],
  ["low-cable-fly", { name: "Low cable fly", equipment: "Cable", src: lowCableFly }],
  ["incline-push-up", { name: "Incline push-up", equipment: "Bodyweight", src: inclinePushUp }],
  ["chin-up", { name: "Chin-up", equipment: "Bodyweight", src: chinUp }],
  ["close-grip-pulldown", { name: "Close-grip pulldown", equipment: "Cable", src: closeGripPulldown }],
  ["straight-arm-pulldown", { name: "Straight-arm pulldown", equipment: "Cable", src: straightArmPulldown }],
  ["inverted-row", { name: "Inverted row", equipment: "Bodyweight", src: invertedRow }],
  ["dumbbell-pullover", { name: "Dumbbell pullover", equipment: "Dumbbell", src: dumbbellPullover }],
  ["reverse-lunge", { name: "Reverse lunge", equipment: "Dumbbell", src: reverseLunge }],
  ["walking-lunge", { name: "Walking lunge", equipment: "Dumbbell", src: walkingLunge }],
  ["glute-bridge", { name: "Glute bridge", equipment: "Bodyweight", src: gluteBridge }],
  ["hip-adduction", { name: "Hip adduction", equipment: "Machine", src: hipAdduction }],
  ["single-leg-romanian-deadlift", { name: "Single-leg Romanian deadlift", equipment: "Dumbbell", src: singleLegRomanianDeadlift }],
  ["cable-lateral-raise", { name: "Cable lateral raise", equipment: "Cable", src: cableLateralRaise }],
  ["front-raise", { name: "Front raise", equipment: "Dumbbell", src: frontRaise }],
  ["reverse-fly", { name: "Reverse fly", equipment: "Dumbbell", src: reverseFly }],
  ["reverse-pec-deck", { name: "Reverse pec deck", equipment: "Machine", src: reversePecDeck }],
  ["dumbbell-shrug", { name: "Dumbbell shrug", equipment: "Dumbbell", src: dumbbellShrug }],
  ["incline-dumbbell-curl", { name: "Incline dumbbell curl", equipment: "Dumbbell", src: inclineDumbbellCurl }],
  ["concentration-curl", { name: "Concentration curl", equipment: "Dumbbell", src: concentrationCurl }],
  ["overhead-triceps-extension", { name: "Overhead triceps extension", equipment: "Dumbbell", src: overheadTricepsExtension }],
  ["triceps-kickback", { name: "Triceps kickback", equipment: "Dumbbell", src: tricepsKickback }],
  ["crunch", { name: "Crunch", equipment: "Bodyweight", src: crunch }],
  ["cable-crunch", { name: "Cable crunch", equipment: "Cable", src: cableCrunch }],
  ["egym-abdominal-crunch", { name: "EGYM Abdominal crunch", equipment: "EGYM", src: egymAbdominalCrunch }],
  ["egym-rotary-torso", { name: "EGYM Rotary torso", equipment: "EGYM", src: egymRotaryTorso }],
  ["egym-squat", { name: "EGYM Squat", equipment: "EGYM", src: egymSquat }],
  ["egym-seated-row", { name: "EGYM Seated row", equipment: "EGYM", src: egymSeatedRow }],
  ["egym-lat-pulldown", { name: "EGYM Lat pulldown", equipment: "EGYM", src: egymLatPulldown }],
  ["egym-shoulder-press", { name: "EGYM Shoulder press", equipment: "EGYM", src: egymShoulderPress }],
  ["egym-chest-press", { name: "EGYM Chest press", equipment: "EGYM", src: egymChestPress }],
  ["hanging-knee-raise", { name: "Hanging knee raise", equipment: "Bodyweight", src: hangingKneeRaise }],
  ["hanging-leg-raise", { name: "Hanging leg raise", equipment: "Bodyweight", src: hangingLegRaise }],
  ["reverse-crunch", { name: "Reverse crunch", equipment: "Bodyweight", src: reverseCrunch }],
  ["russian-twist", { name: "Russian twist", equipment: "Dumbbell", src: russianTwist }],
  ["pallof-press", { name: "Pallof press", equipment: "Cable", src: pallofPress }],
  ["dead-bug", { name: "Dead bug", equipment: "Bodyweight", src: deadBug }],
]);

export function exerciseArtwork(exercise: Exercise | undefined): string | undefined {
  if (!exercise || exercise.custom) return undefined;
  const match = artwork.get(exercise.id);
  if (match?.name !== exercise.name || match.equipment !== exercise.equipment) return undefined;
  return match.src;
}
