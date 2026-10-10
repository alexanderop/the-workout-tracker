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

export const dumbbellArtwork: Readonly<Record<string, ArtworkRows>> = {
  Dumbbell: [
    ["dumbbell-shoulder-press", "Dumbbell shoulder press", shoulderPress],
    ["arnold-press", "Arnold press", shoulderPress],
    ["row", "Dumbbell row", row],
    ["biceps-curl", "Biceps curl", bicepsCurl],
    ["lateral-raise", "Lateral raise", lateralRaise],
    ["dumbbell-bench-press", "Dumbbell bench press", dumbbellBenchPress],
    ["incline-dumbbell-press", "Incline dumbbell press", inclineDumbbellPress],
    ["chest-supported-row", "Chest-supported row", chestSupportedRow],
    ["goblet-squat", "Goblet squat", gobletSquat],
    ["bulgarian-split-squat", "Bulgarian split squat", bulgarianSplitSquat],
    ["step-up", "Step-up", stepUp],
    ["hammer-curl", "Hammer curl", hammerCurl],
    ["dumbbell-fly", "Dumbbell fly", dumbbellFly],
    ["dumbbell-pullover", "Dumbbell pullover", dumbbellPullover],
    ["reverse-lunge", "Reverse lunge", reverseLunge],
    ["walking-lunge", "Walking lunge", walkingLunge],
    [
      "single-leg-romanian-deadlift",
      "Single-leg Romanian deadlift",
      singleLegRomanianDeadlift,
    ],
    ["front-raise", "Front raise", frontRaise],
    ["reverse-fly", "Reverse fly", reverseFly],
    ["dumbbell-shrug", "Dumbbell shrug", dumbbellShrug],
    ["incline-dumbbell-curl", "Incline dumbbell curl", inclineDumbbellCurl],
    ["concentration-curl", "Concentration curl", concentrationCurl],
    [
      "overhead-triceps-extension",
      "Overhead triceps extension",
      overheadTricepsExtension,
    ],
    ["triceps-kickback", "Triceps kickback", tricepsKickback],
    ["russian-twist", "Russian twist", russianTwist],
  ],
};
