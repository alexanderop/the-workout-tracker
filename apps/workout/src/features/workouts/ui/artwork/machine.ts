import type { ArtworkRows } from "./types";
import legPress from "../assets/exercises/leg-press.webp";
import chestPress from "../assets/exercises/chest-press.webp";
import pecDeck from "../assets/exercises/pec-deck.webp";
import legExtension from "../assets/exercises/leg-extension.webp";
import seatedLegCurl from "../assets/exercises/seated-leg-curl.webp";
import hackSquat from "../assets/exercises/hack-squat.webp";
import standingCalfRaise from "../assets/exercises/standing-calf-raise.webp";
import preacherCurl from "../assets/exercises/preacher-curl.webp";
import assistedPullUp from "../assets/exercises/assisted-pull-up.webp";
import tBarRow from "../assets/exercises/t-bar-row.webp";
import lyingLegCurl from "../assets/exercises/lying-leg-curl.webp";
import seatedCalfRaise from "../assets/exercises/seated-calf-raise.webp";
import hipAbduction from "../assets/exercises/hip-abduction.webp";
import shoulderPressMachine from "../assets/exercises/shoulder-press-machine.webp";
import hipAdduction from "../assets/exercises/hip-adduction.webp";
import reversePecDeck from "../assets/exercises/reverse-pec-deck.webp";
import egymAbdominalCrunch from "../assets/exercises/egym-abdominal-crunch.webp";
import egymRotaryTorso from "../assets/exercises/egym-rotary-torso.webp";
import egymSquat from "../assets/exercises/egym-squat.webp";
import egymSeatedRow from "../assets/exercises/egym-seated-row.webp";
import egymLatPulldown from "../assets/exercises/egym-lat-pulldown.webp";
import egymShoulderPress from "../assets/exercises/egym-shoulder-press.webp";
import egymChestPress from "../assets/exercises/egym-chest-press.webp";

export const machineArtwork: ArtworkRows = [
  ["leg-press", { name: "Leg press", equipment: "Machine", src: legPress }],
  ["chest-press", { name: "Chest press", equipment: "Machine", src: chestPress }],
  ["pec-deck", { name: "Pec deck", equipment: "Machine", src: pecDeck }],
  ["leg-extension", { name: "Leg extension", equipment: "Machine", src: legExtension }],
  ["seated-leg-curl", { name: "Seated leg curl", equipment: "Machine", src: seatedLegCurl }],
  ["hack-squat", { name: "Hack squat", equipment: "Machine", src: hackSquat }],
  ["standing-calf-raise", { name: "Standing calf raise", equipment: "Machine", src: standingCalfRaise }],
  ["preacher-curl", { name: "Preacher curl", equipment: "Machine", src: preacherCurl }],
  ["assisted-pull-up", { name: "Assisted pull-up", equipment: "Machine", src: assistedPullUp }],
  ["t-bar-row", { name: "T-bar row", equipment: "Machine", src: tBarRow }],
  ["lying-leg-curl", { name: "Lying leg curl", equipment: "Machine", src: lyingLegCurl }],
  ["seated-calf-raise", { name: "Seated calf raise", equipment: "Machine", src: seatedCalfRaise }],
  ["hip-abduction", { name: "Hip abduction", equipment: "Machine", src: hipAbduction }],
  ["shoulder-press-machine", { name: "Shoulder press machine", equipment: "Machine", src: shoulderPressMachine }],
  ["hip-adduction", { name: "Hip adduction", equipment: "Machine", src: hipAdduction }],
  ["reverse-pec-deck", { name: "Reverse pec deck", equipment: "Machine", src: reversePecDeck }],
  ["egym-abdominal-crunch", { name: "EGYM Abdominal crunch", equipment: "EGYM", src: egymAbdominalCrunch }],
  ["egym-rotary-torso", { name: "EGYM Rotary torso", equipment: "EGYM", src: egymRotaryTorso }],
  ["egym-squat", { name: "EGYM Squat", equipment: "EGYM", src: egymSquat }],
  ["egym-seated-row", { name: "EGYM Seated row", equipment: "EGYM", src: egymSeatedRow }],
  ["egym-lat-pulldown", { name: "EGYM Lat pulldown", equipment: "EGYM", src: egymLatPulldown }],
  ["egym-shoulder-press", { name: "EGYM Shoulder press", equipment: "EGYM", src: egymShoulderPress }],
  ["egym-chest-press", { name: "EGYM Chest press", equipment: "EGYM", src: egymChestPress }],
];
