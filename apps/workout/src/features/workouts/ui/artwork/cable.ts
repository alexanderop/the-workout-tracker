import type { ArtworkRows } from "./types";
import latPulldown from "../assets/exercises/lat-pulldown.webp";
import seatedRow from "../assets/exercises/seated-row.webp";
import tricepsExtension from "../assets/exercises/triceps-extension.webp";
import cableFly from "../assets/exercises/cable-fly.webp";
import facePull from "../assets/exercises/face-pull.webp";
import cableCurl from "../assets/exercises/cable-curl.webp";
import ropeTricepsPushdown from "../assets/exercises/rope-triceps-pushdown.webp";
import lowCableFly from "../assets/exercises/low-cable-fly.webp";
import closeGripPulldown from "../assets/exercises/close-grip-pulldown.webp";
import straightArmPulldown from "../assets/exercises/straight-arm-pulldown.webp";
import cableLateralRaise from "../assets/exercises/cable-lateral-raise.webp";
import cableCrunch from "../assets/exercises/cable-crunch.webp";
import pallofPress from "../assets/exercises/pallof-press.webp";

export const cableArtwork: ArtworkRows = [
  ["lat-pulldown", { name: "Lat pulldown", equipment: "Cable", src: latPulldown }],
  ["seated-cable-row", { name: "Seated cable row", equipment: "Cable", src: seatedRow }],
  ["triceps-extension", { name: "Triceps extension", equipment: "Cable", src: tricepsExtension }],
  ["cable-fly", { name: "Cable fly", equipment: "Cable", src: cableFly }],
  ["face-pull", { name: "Face pull", equipment: "Cable", src: facePull }],
  ["cable-curl", { name: "Cable curl", equipment: "Cable", src: cableCurl }],
  ["rope-triceps-pushdown", { name: "Rope triceps pushdown", equipment: "Cable", src: ropeTricepsPushdown }],
  ["low-cable-fly", { name: "Low cable fly", equipment: "Cable", src: lowCableFly }],
  ["close-grip-pulldown", { name: "Close-grip pulldown", equipment: "Cable", src: closeGripPulldown }],
  ["straight-arm-pulldown", { name: "Straight-arm pulldown", equipment: "Cable", src: straightArmPulldown }],
  ["cable-lateral-raise", { name: "Cable lateral raise", equipment: "Cable", src: cableLateralRaise }],
  ["cable-crunch", { name: "Cable crunch", equipment: "Cable", src: cableCrunch }],
  ["pallof-press", { name: "Pallof press", equipment: "Cable", src: pallofPress }],
];
