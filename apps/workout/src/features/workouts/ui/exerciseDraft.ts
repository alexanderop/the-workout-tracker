import type { Exercise, ExerciseKind } from "../domain";

/** Choices offered when creating an exercise. Stored values stay English. */
export const muscleGroups = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Other",
] as const;
export const equipmentTypes = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Band",
  "Kettlebell",
  "Other",
] as const;

/** Unsaved input of the create exercise sheet. */
export type ExerciseDraft = Readonly<{
  name: string;
  category: string;
  secondaryCategories: readonly string[];
  kind: ExerciseKind | undefined;
  equipment: string;
}>;
export const emptyExerciseDraft: ExerciseDraft = {
  name: "",
  category: "Other",
  secondaryCategories: [],
  kind: undefined,
  equipment: "Other",
};

/** The main muscle group cannot also be a secondary one. */
export function chooseCategory(
  draft: ExerciseDraft,
  category: string,
): ExerciseDraft {
  return {
    ...draft,
    category,
    secondaryCategories: draft.secondaryCategories.filter(
      (group) => group !== category,
    ),
  };
}

/** Adds or removes a secondary group, keeping the offered order. */
export function toggleSecondary(
  draft: ExerciseDraft,
  group: string,
): ExerciseDraft {
  if (group === draft.category) return draft;
  const selected = draft.secondaryCategories.includes(group)
    ? draft.secondaryCategories.filter((value) => value !== group)
    : [...draft.secondaryCategories, group];
  return {
    ...draft,
    secondaryCategories: muscleGroups.filter((value) =>
      selected.includes(value),
    ),
  };
}

/** The values to save; optional details are left out when not chosen. */
export function exerciseFromDraft(
  draft: ExerciseDraft,
): Omit<Exercise, "id" | "custom"> {
  return {
    name: draft.name.trim(),
    category: draft.category,
    equipment: draft.equipment,
    ...(draft.secondaryCategories.length
      ? { secondaryCategories: draft.secondaryCategories }
      : {}),
    ...(draft.kind ? { kind: draft.kind } : {}),
  };
}
