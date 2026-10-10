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

export const machineArtwork: Readonly<Record<string, ArtworkRows>> = {
  Machine: [
    ["leg-press", "Leg press", legPress],
    ["chest-press", "Chest press", chestPress],
    ["pec-deck", "Pec deck", pecDeck],
    ["leg-extension", "Leg extension", legExtension],
    ["seated-leg-curl", "Seated leg curl", seatedLegCurl],
    ["hack-squat", "Hack squat", hackSquat],
    ["standing-calf-raise", "Standing calf raise", standingCalfRaise],
    ["preacher-curl", "Preacher curl", preacherCurl],
    ["assisted-pull-up", "Assisted pull-up", assistedPullUp],
    ["t-bar-row", "T-bar row", tBarRow],
    ["lying-leg-curl", "Lying leg curl", lyingLegCurl],
    ["seated-calf-raise", "Seated calf raise", seatedCalfRaise],
    ["hip-abduction", "Hip abduction", hipAbduction],
    ["shoulder-press-machine", "Shoulder press machine", shoulderPressMachine],
    ["hip-adduction", "Hip adduction", hipAdduction],
    ["reverse-pec-deck", "Reverse pec deck", reversePecDeck],
  ],
  EGYM: [
    ["egym-abdominal-crunch", "EGYM Abdominal crunch", egymAbdominalCrunch],
    ["egym-rotary-torso", "EGYM Rotary torso", egymRotaryTorso],
    ["egym-squat", "EGYM Squat", egymSquat],
    ["egym-seated-row", "EGYM Seated row", egymSeatedRow],
    ["egym-lat-pulldown", "EGYM Lat pulldown", egymLatPulldown],
    ["egym-shoulder-press", "EGYM Shoulder press", egymShoulderPress],
    ["egym-chest-press", "EGYM Chest press", egymChestPress],
  ],
};
