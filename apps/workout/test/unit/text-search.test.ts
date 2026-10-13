import { describe, expect, it } from "vitest";
import { defaultExercises } from "../../src/features/workouts/domain/catalog";
import {
  emptyCatalogFilters,
  filterCatalog,
} from "../../src/features/workouts/ui/catalogFilters";
import {
  categoryLabel,
  equipmentLabel,
} from "../../src/features/workouts/ui/exerciseLabels";
import {
  filterHistory,
  matchesSearch,
} from "../../src/features/workouts/ui/textSearch";
import { translator } from "../../src/i18n/testing";
import { createWorkoutFactory } from "../support/factories";

const searchCatalog = (search: string, locale: "en" | "de" = "en") => {
  const { t } = translator(locale);
  return filterCatalog(defaultExercises, {
    search,
    filters: emptyCatalogFilters,
    sort: "ascending",
    labels: (exercise) => [
      categoryLabel(exercise.category, t),
      equipmentLabel(exercise.equipment, t),
    ],
  }).map((exercise) => exercise.name);
};

describe("built-in catalog search", () => {
  const egym = [
    "EGYM Abdominal crunch",
    "EGYM Chest press",
    "EGYM Lat pulldown",
    "EGYM Rotary torso",
    "EGYM Seated row",
    "EGYM Shoulder press",
    "EGYM Squat",
  ];
  it.each(["egym", "EGYM", " Egym ", "e-gym", "e gym", "eGym"])(
    "finds every EGYM machine for %j",
    (query) => {
      expect(searchCatalog(query)).toEqual(egym);
    },
  );
  it.each([
    ["pullup", "Pull-up"],
    ["pull up", "Pull-up"],
    ["pushup", "Push-up"],
    ["push up", "Push-up"],
    ["chinup", "Chin-up"],
    ["chin up", "Chin-up"],
    ["tbar", "T-bar row"],
    ["stepup", "Step-up"],
    ["closegrip", "Close-grip bench press"],
    ["skullcrusher", "Skull crusher"],
    ["row cable", "Seated cable row"],
    ["press bench incline", "Incline bench press"],
    ["egym squat", "EGYM Squat"],
    ["squat egym", "EGYM Squat"],
    ["squats", "Back squat"],
    ["deadlifts", "Deadlift"],
    ["lunges", "Walking lunge"],
    ["dips", "Chest dip"],
    ["presses", "Bench press"],
    ["flies", "Cable fly"],
    ["raises", "Lateral raise"],
    ["face pulls", "Face pull"],
  ])("finds the exercise for %j", (query, name) => {
    expect(searchCatalog(query)).toContain(name);
  });
  it.each([
    ["rücken", "Seated cable row"],
    ["rucken", "Seated cable row"],
    ["RÜCKEN", "Barbell row"],
    ["brust maschine", "Pec deck"],
    ["egym rumpf", "EGYM Rotary torso"],
  ])("finds the exercise for the German label %j", (query, name) => {
    expect(searchCatalog(query, "de")).toContain(name);
  });
  it("needs every word, so extra words narrow instead of widen", () => {
    expect(searchCatalog("egym chest")).toEqual(["EGYM Chest press"]);
    expect(searchCatalog("egym biceps")).toEqual([]);
    expect(searchCatalog("zzz")).toEqual([]);
  });
  it("does not match text spanning the gap between two fields", () => {
    // "Incline bench press", "Chest", "Barbell" once read as "...Chest Barbell".
    expect(searchCatalog("tbar")).toEqual(["T-bar row"]);
    expect(searchCatalog("chestbarbell")).toEqual([]);
  });
  it("finds every built-in exercise by its own name", () => {
    for (const exercise of defaultExercises)
      expect(searchCatalog(exercise.name)).toContain(exercise.name);
  });
});

describe("text matching", () => {
  it("matches everything for an empty or blank query", () => {
    expect(matchesSearch("", ["Bench press"])).toBe(true);
    expect(matchesSearch("  ", [])).toBe(true);
  });
  it("ignores punctuation that separates words", () => {
    expect(matchesSearch("bench, press!", ["Bench press"])).toBe(true);
  });
});

describe("workout history search", () => {
  const factory = createWorkoutFactory("history");
  const egymDay = factory.completedSession({
    name: "Morning workout",
    exercises: [
      factory.sessionExercise({
        exerciseId: "egym-squat",
        name: "EGYM Squat",
        category: "Legs",
      }),
    ],
  });
  const pushDay = factory.completedSession({ name: "Push day" });
  const history = [egymDay, pushDay];
  const { t } = translator("de");

  it("finds a past workout by an exercise it contains", () => {
    expect(filterHistory(history, "egym", t)).toEqual([egymDay]);
    expect(filterHistory(history, "bench", t)).toEqual([pushDay]);
  });
  it("finds a past workout by its name or a muscle group in either language", () => {
    expect(filterHistory(history, " push ", t)).toEqual([pushDay]);
    expect(filterHistory(history, "legs", t)).toEqual([egymDay]);
    expect(filterHistory(history, "beine", t)).toEqual([egymDay]);
    expect(filterHistory(history, "", t)).toEqual(history);
    expect(filterHistory(history, "deadlift", t)).toEqual([]);
  });
});
