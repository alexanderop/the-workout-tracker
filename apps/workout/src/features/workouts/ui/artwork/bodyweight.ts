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

export const bodyweightArtwork: ArtworkRows = [
  ["pull-up", { name: "Pull-up", equipment: "Bodyweight", src: pullUp }],
  ["ab-wheel-rollout", { name: "Ab wheel rollout", equipment: "Other", src: abWheelRollout }],
  ["chest-dip", { name: "Chest dip", equipment: "Bodyweight", src: chestDip }],
  ["back-extension", { name: "Back extension", equipment: "Bodyweight", src: backExtension }],
  ["push-up", { name: "Push-up", equipment: "Bodyweight", src: pushUp }],
  ["incline-push-up", { name: "Incline push-up", equipment: "Bodyweight", src: inclinePushUp }],
  ["chin-up", { name: "Chin-up", equipment: "Bodyweight", src: chinUp }],
  ["inverted-row", { name: "Inverted row", equipment: "Bodyweight", src: invertedRow }],
  ["glute-bridge", { name: "Glute bridge", equipment: "Bodyweight", src: gluteBridge }],
  ["crunch", { name: "Crunch", equipment: "Bodyweight", src: crunch }],
  ["hanging-knee-raise", { name: "Hanging knee raise", equipment: "Bodyweight", src: hangingKneeRaise }],
  ["hanging-leg-raise", { name: "Hanging leg raise", equipment: "Bodyweight", src: hangingLegRaise }],
  ["reverse-crunch", { name: "Reverse crunch", equipment: "Bodyweight", src: reverseCrunch }],
  ["dead-bug", { name: "Dead bug", equipment: "Bodyweight", src: deadBug }],
];
