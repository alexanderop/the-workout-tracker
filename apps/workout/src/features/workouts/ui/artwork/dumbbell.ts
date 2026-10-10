import type { ArtworkRows } from "./types";
import shoulderPress from "../assets/exercises/shoulder-press.webp";
import row from "../assets/exercises/row.webp";
import bicepsCurl from "../assets/exercises/biceps-curl.webp";
import lateralRaise from "../assets/exercises/lateral-raise.webp";
import dumbbellBenchPress from "../assets/exercises/dumbbell-bench-press.webp";
import inclineDumbbellPress from "../assets/exercises/incline-dumbbell-press.webp";
import chestSupportedRow from "../assets/exercises/chest-supported-row.webp";
import gobletSquat from "../assets/exercises/goblet-squat.webp";
import bulgarianSplitSquat from "../assets/exercises/bulgarian-split-squat.webp";
import stepUp from "../assets/exercises/step-up.webp";
import hammerCurl from "../assets/exercises/hammer-curl.webp";
import dumbbellFly from "../assets/exercises/dumbbell-fly.webp";
import dumbbellPullover from "../assets/exercises/dumbbell-pullover.webp";
import reverseLunge from "../assets/exercises/reverse-lunge.webp";
import walkingLunge from "../assets/exercises/walking-lunge.webp";
import singleLegRomanianDeadlift from "../assets/exercises/single-leg-romanian-deadlift.webp";
import frontRaise from "../assets/exercises/front-raise.webp";
import reverseFly from "../assets/exercises/reverse-fly.webp";
import dumbbellShrug from "../assets/exercises/dumbbell-shrug.webp";
import inclineDumbbellCurl from "../assets/exercises/incline-dumbbell-curl.webp";
import concentrationCurl from "../assets/exercises/concentration-curl.webp";
import overheadTricepsExtension from "../assets/exercises/overhead-triceps-extension.webp";
import tricepsKickback from "../assets/exercises/triceps-kickback.webp";
import russianTwist from "../assets/exercises/russian-twist.webp";

export const dumbbellArtwork: ArtworkRows = [
  ["dumbbell-shoulder-press", { name: "Dumbbell shoulder press", equipment: "Dumbbell", src: shoulderPress }],
  ["arnold-press", { name: "Arnold press", equipment: "Dumbbell", src: shoulderPress }],
  ["row", { name: "Dumbbell row", equipment: "Dumbbell", src: row }],
  ["biceps-curl", { name: "Biceps curl", equipment: "Dumbbell", src: bicepsCurl }],
  ["lateral-raise", { name: "Lateral raise", equipment: "Dumbbell", src: lateralRaise }],
  ["dumbbell-bench-press", { name: "Dumbbell bench press", equipment: "Dumbbell", src: dumbbellBenchPress }],
  ["incline-dumbbell-press", { name: "Incline dumbbell press", equipment: "Dumbbell", src: inclineDumbbellPress }],
  ["chest-supported-row", { name: "Chest-supported row", equipment: "Dumbbell", src: chestSupportedRow }],
  ["goblet-squat", { name: "Goblet squat", equipment: "Dumbbell", src: gobletSquat }],
  ["bulgarian-split-squat", { name: "Bulgarian split squat", equipment: "Dumbbell", src: bulgarianSplitSquat }],
  ["step-up", { name: "Step-up", equipment: "Dumbbell", src: stepUp }],
  ["hammer-curl", { name: "Hammer curl", equipment: "Dumbbell", src: hammerCurl }],
  ["dumbbell-fly", { name: "Dumbbell fly", equipment: "Dumbbell", src: dumbbellFly }],
  ["dumbbell-pullover", { name: "Dumbbell pullover", equipment: "Dumbbell", src: dumbbellPullover }],
  ["reverse-lunge", { name: "Reverse lunge", equipment: "Dumbbell", src: reverseLunge }],
  ["walking-lunge", { name: "Walking lunge", equipment: "Dumbbell", src: walkingLunge }],
  ["single-leg-romanian-deadlift", { name: "Single-leg Romanian deadlift", equipment: "Dumbbell", src: singleLegRomanianDeadlift }],
  ["front-raise", { name: "Front raise", equipment: "Dumbbell", src: frontRaise }],
  ["reverse-fly", { name: "Reverse fly", equipment: "Dumbbell", src: reverseFly }],
  ["dumbbell-shrug", { name: "Dumbbell shrug", equipment: "Dumbbell", src: dumbbellShrug }],
  ["incline-dumbbell-curl", { name: "Incline dumbbell curl", equipment: "Dumbbell", src: inclineDumbbellCurl }],
  ["concentration-curl", { name: "Concentration curl", equipment: "Dumbbell", src: concentrationCurl }],
  ["overhead-triceps-extension", { name: "Overhead triceps extension", equipment: "Dumbbell", src: overheadTricepsExtension }],
  ["triceps-kickback", { name: "Triceps kickback", equipment: "Dumbbell", src: tricepsKickback }],
  ["russian-twist", { name: "Russian twist", equipment: "Dumbbell", src: russianTwist }],
];
