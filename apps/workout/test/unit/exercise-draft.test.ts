import { describe, expect, it } from "vitest";
import {
  chooseCategory,
  emptyExerciseDraft,
  exerciseFromDraft,
  toggleSecondary,
} from "../../src/features/workouts/ui/exerciseDraft";
import { exerciseMuscleHighlights } from "../../src/features/workouts/ui/catalogIllustrations";

describe("given a new exercise draft", () => {
  it("should save only the name, muscle group and equipment by default", () => {
    expect(
      exerciseFromDraft({ ...emptyExerciseDraft, name: "  Sled push " }),
    ).toEqual({ name: "Sled push", category: "Other", equipment: "Other" });
  });

  it("should save chosen secondary groups and type", () => {
    const draft = toggleSecondary(
      {
        ...emptyExerciseDraft,
        name: "Row",
        category: "Back",
        kind: "compound",
      },
      "Arms",
    );
    expect(exerciseFromDraft(draft)).toEqual({
      name: "Row",
      category: "Back",
      equipment: "Other",
      secondaryCategories: ["Arms"],
      kind: "compound",
    });
  });

  it("should keep secondary groups in catalog order and toggle them off", () => {
    let draft = toggleSecondary(emptyExerciseDraft, "Core");
    draft = toggleSecondary(draft, "Chest");
    expect(draft.secondaryCategories).toEqual(["Chest", "Core"]);
    expect(toggleSecondary(draft, "Core").secondaryCategories).toEqual([
      "Chest",
    ]);
  });

  it("should not add the main group as a secondary one", () => {
    const draft = { ...emptyExerciseDraft, category: "Legs" };
    expect(toggleSecondary(draft, "Legs")).toBe(draft);
  });

  it("should drop a secondary group that becomes the main one", () => {
    const draft = toggleSecondary(
      toggleSecondary(emptyExerciseDraft, "Legs"),
      "Core",
    );
    expect(chooseCategory(draft, "Legs")).toMatchObject({
      category: "Legs",
      secondaryCategories: ["Core"],
    });
  });
});

describe("given the chosen muscle groups", () => {
  it("should highlight the main group as primary and the others as supporting", () => {
    expect(exerciseMuscleHighlights("Chest", ["Arms"])).toEqual([
      { muscle: "chest", role: "primary" },
      { muscle: "biceps", role: "supporting" },
      { muscle: "triceps", role: "supporting" },
      { muscle: "forearms", role: "supporting" },
    ]);
  });

  it("should highlight nothing for groups without an illustration", () => {
    expect(exerciseMuscleHighlights("Other", [])).toEqual([]);
  });
});
