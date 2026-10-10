import { enCommon } from "./en/common";
import { enShell } from "./en/shell";
import { enWorkouts } from "./en/workouts";
import { enExercises } from "./en/exercises";
import { enProgress } from "./en/progress";
import { enTraining } from "./en/training";
import { enDialogs } from "./en/dialogs";
import { enSettings } from "./en/settings";
import { enErrors } from "./en/errors";

// The source catalog. Its literal text types the arguments of each key, and
// `Catalog` in ./index.ts makes every other locale match it key for key.
// One file per screen area keeps each below the file-size limit.
export const en = {
  common: enCommon,
  shell: enShell,
  workouts: enWorkouts,
  exercises: enExercises,
  progress: enProgress,
  training: enTraining,
  dialogs: enDialogs,
  settings: enSettings,
  errors: enErrors,
} as const;
