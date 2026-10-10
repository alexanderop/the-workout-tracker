import type { ArtworkRows } from "./types";
import pullUp from "../assets/exercises/pull-up.webp";
import abWheelRollout from "../assets/exercises/ab-wheel-rollout.webp";
import chestDip from "../assets/exercises/chest-dip.webp";
import backExtension from "../assets/exercises/back-extension.webp";
import pushUp from "../assets/exercises/push-up.webp";
import inclinePushUp from "../assets/exercises/incline-push-up.webp";
import chinUp from "../assets/exercises/chin-up.webp";
import invertedRow from "../assets/exercises/inverted-row.webp";
import gluteBridge from "../assets/exercises/glute-bridge.webp";
import crunch from "../assets/exercises/crunch.webp";
import hangingKneeRaise from "../assets/exercises/hanging-knee-raise.webp";
import hangingLegRaise from "../assets/exercises/hanging-leg-raise.webp";
import reverseCrunch from "../assets/exercises/reverse-crunch.webp";
import deadBug from "../assets/exercises/dead-bug.webp";

export const bodyweightArtwork: Readonly<Record<string, ArtworkRows>> = {
  Bodyweight: [
    ["pull-up", "Pull-up", pullUp],
    ["chest-dip", "Chest dip", chestDip],
    ["back-extension", "Back extension", backExtension],
    ["push-up", "Push-up", pushUp],
    ["incline-push-up", "Incline push-up", inclinePushUp],
    ["chin-up", "Chin-up", chinUp],
    ["inverted-row", "Inverted row", invertedRow],
    ["glute-bridge", "Glute bridge", gluteBridge],
    ["crunch", "Crunch", crunch],
    ["hanging-knee-raise", "Hanging knee raise", hangingKneeRaise],
    ["hanging-leg-raise", "Hanging leg raise", hangingLegRaise],
    ["reverse-crunch", "Reverse crunch", reverseCrunch],
    ["dead-bug", "Dead bug", deadBug],
  ],
  Other: [
    ["ab-wheel-rollout", "Ab wheel rollout", abWheelRollout],
  ],
};
