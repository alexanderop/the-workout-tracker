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

export const cableArtwork: Readonly<Record<string, ArtworkRows>> = {
  Cable: [
    ["lat-pulldown", "Lat pulldown", latPulldown],
    ["seated-cable-row", "Seated cable row", seatedRow],
    ["triceps-extension", "Triceps extension", tricepsExtension],
    ["cable-fly", "Cable fly", cableFly],
    ["face-pull", "Face pull", facePull],
    ["cable-curl", "Cable curl", cableCurl],
    ["rope-triceps-pushdown", "Rope triceps pushdown", ropeTricepsPushdown],
    ["low-cable-fly", "Low cable fly", lowCableFly],
    ["close-grip-pulldown", "Close-grip pulldown", closeGripPulldown],
    ["straight-arm-pulldown", "Straight-arm pulldown", straightArmPulldown],
    ["cable-lateral-raise", "Cable lateral raise", cableLateralRaise],
    ["cable-crunch", "Cable crunch", cableCrunch],
    ["pallof-press", "Pallof press", pallofPress],
  ],
};
