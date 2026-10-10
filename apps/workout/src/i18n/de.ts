import type { Catalog } from "./index";
import { deCommon } from "./de/common";
import { deShell } from "./de/shell";
import { deWorkouts } from "./de/workouts";
import { deExercises } from "./de/exercises";
import { deProgress } from "./de/progress";
import { deTraining } from "./de/training";
import { deDialogs } from "./de/dialogs";
import { deSettings } from "./de/settings";
import { deErrors } from "./de/errors";

export const de: Catalog = {
  common: deCommon,
  shell: deShell,
  workouts: deWorkouts,
  exercises: deExercises,
  progress: deProgress,
  training: deTraining,
  dialogs: deDialogs,
  settings: deSettings,
  errors: deErrors,
};
