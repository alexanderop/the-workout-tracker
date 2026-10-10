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

export const barbellArtwork: ArtworkRows = [
  ["bench-press", { name: "Bench press", equipment: "Barbell", src: benchPress }],
  ["squat", { name: "Back squat", equipment: "Barbell", src: squat }],
  ["front-squat", { name: "Front squat", equipment: "Barbell", src: squat }],
  ["deadlift", { name: "Deadlift", equipment: "Barbell", src: deadlift }],
  ["romanian-deadlift", { name: "Romanian deadlift", equipment: "Barbell", src: deadlift }],
  ["sumo-deadlift", { name: "Sumo deadlift", equipment: "Barbell", src: deadlift }],
  ["close-grip-bench-press", { name: "Close-grip bench press", equipment: "Barbell", src: benchPress }],
  ["overhead-press", { name: "Overhead press", equipment: "Barbell", src: overheadPress }],
  ["incline-bench-press", { name: "Incline bench press", equipment: "Barbell", src: inclineBenchPress }],
  ["hip-thrust", { name: "Hip thrust", equipment: "Barbell", src: hipThrust }],
  ["decline-bench-press", { name: "Decline bench press", equipment: "Barbell", src: declineBenchPress }],
  ["barbell-row", { name: "Barbell row", equipment: "Barbell", src: barbellRow }],
  ["barbell-curl", { name: "Barbell curl", equipment: "Barbell", src: barbellCurl }],
  ["skull-crusher", { name: "Skull crusher", equipment: "Barbell", src: skullCrusher }],
];
