import { commandSchema, type Command, type CompletedSession } from "../domain";

export type CompletedDraft = {
  name: string;
  sets: {
    exerciseId: string;
    setId: string;
    weightKg: string | number;
    reps: string | number;
  }[];
};
export function completedDraft(session: CompletedSession): CompletedDraft {
  return {
    name: session.name,
    sets: session.exercises.flatMap((exercise) =>
      exercise.sets
        .filter((set) => set.completed)
        .map((set) => ({
          exerciseId: exercise.id,
          setId: set.id,
          weightKg: String(set.weightKg),
          reps: String(set.reps),
        })),
    ),
  };
}
export function completedCorrection(
  session: CompletedSession,
  draft: CompletedDraft,
): Extract<Command, { type: "correct-completed" }> | null {
  if (
    draft.sets.some(
      (set) => !String(set.weightKg).trim() || !String(set.reps).trim(),
    )
  )
    return null;
  const sets = draft.sets.map((set) => ({
    ...set,
    weightKg: Number(set.weightKg),
    reps: Number(set.reps),
  }));
  const parsed = commandSchema.safeParse({
    type: "correct-completed",
    sessionId: session.id,
    ...(draft.name.trim() !== session.name ? { name: draft.name } : {}),
    sets: sets.filter((patch) => {
      const original = session.exercises
        .find((exercise) => exercise.id === patch.exerciseId)
        ?.sets.find((set) => set.id === patch.setId);
      return (
        !original ||
        original.weightKg !== patch.weightKg ||
        original.reps !== patch.reps
      );
    }),
  });
  return parsed.success && parsed.data.type === "correct-completed"
    ? parsed.data
    : null;
}
