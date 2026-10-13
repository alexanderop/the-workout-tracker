import type { Translate } from "../../../i18n";
import type { SessionExercise } from "../domain";
import type { Confirmation } from "./dialogTypes";

/** Removing an exercise deletes its logged sets and input drafts. */
export function removeExerciseConfirmation(
  t: Translate,
  sessionId: string,
  exercise: SessionExercise,
): Confirmation {
  return {
    intent: "destructive",
    title: t("training.removeExercise.title"),
    description: t("training.removeExercise.description", {
      exercise: exercise.name,
      logged: exercise.sets.filter((set) => set.completed).length,
    }),
    actionLabel: t("training.removeExercise.action"),
    command: { type: "remove-exercise", sessionId, exerciseId: exercise.id },
  };
}

export function discardWorkoutConfirmation(
  t: Translate,
  sessionId: string,
): Confirmation {
  return {
    intent: "destructive",
    title: t("training.discardWorkout.title"),
    description: t("training.discardWorkout.description"),
    actionLabel: t("training.discardWorkout.action"),
    command: { type: "discard", sessionId },
  };
}
