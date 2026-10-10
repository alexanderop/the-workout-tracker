import type { ArtworkRows } from "./types";
import benchPress from "../assets/exercises/bench-press.webp";
import squat from "../assets/exercises/squat.webp";
import deadlift from "../assets/exercises/deadlift.webp";
import overheadPress from "../assets/exercises/overhead-press.webp";
import inclineBenchPress from "../assets/exercises/incline-bench-press.webp";
import hipThrust from "../assets/exercises/hip-thrust.webp";
import declineBenchPress from "../assets/exercises/decline-bench-press.webp";
import barbellRow from "../assets/exercises/barbell-row.webp";
import barbellCurl from "../assets/exercises/barbell-curl.webp";
import skullCrusher from "../assets/exercises/skull-crusher.webp";

export const barbellArtwork: Readonly<Record<string, ArtworkRows>> = {
  Barbell: [
    ["bench-press", "Bench press", benchPress],
    ["squat", "Back squat", squat],
    ["front-squat", "Front squat", squat],
    ["deadlift", "Deadlift", deadlift],
    ["romanian-deadlift", "Romanian deadlift", deadlift],
    ["sumo-deadlift", "Sumo deadlift", deadlift],
    ["close-grip-bench-press", "Close-grip bench press", benchPress],
    ["overhead-press", "Overhead press", overheadPress],
    ["incline-bench-press", "Incline bench press", inclineBenchPress],
    ["hip-thrust", "Hip thrust", hipThrust],
    ["decline-bench-press", "Decline bench press", declineBenchPress],
    ["barbell-row", "Barbell row", barbellRow],
    ["barbell-curl", "Barbell curl", barbellCurl],
    ["skull-crusher", "Skull crusher", skullCrusher],
  ],
};
