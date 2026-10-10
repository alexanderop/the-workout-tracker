import { describe, expect, it } from "vitest";
import {
  emptyCatalogFilters,
  filterCatalog,
} from "../../src/features/workouts/ui/catalogFilters";
import {
  categoryLabel,
  equipmentLabel,
} from "../../src/features/workouts/ui/exerciseLabels";
import { translator } from "../../src/i18n/testing";
import { createWorkoutFactory } from "../support/factories";

const factory = createWorkoutFactory("catalog");
const exercises = [
  factory.exercise({ id: "built-in", name: "Bench press", custom: false }),
  factory.exercise({ id: "custom", name: "My bench press" }),
  factory.exercise({ id: "arms", name: "Barbell curl", category: "Arms" }),
  factory.exercise({
    id: "dumbbell",
    name: "Dumbbell press",
    equipment: "Dumbbell",
  }),
];
describe("catalog browsing", () => {
  it("intersects normalized search, equipment, muscle group and custom ownership", () => {
    expect(
      filterCatalog(exercises, {
        search: " PRESS ",
        filters: { equipment: "Barbell", category: "Chest", onlyCustom: true },
        sort: "ascending",
      }).map((exercise) => exercise.id),
    ).toEqual(["custom"]);
  });
  it("orders names in either direction without mutating the supplied catalog", () => {
    expect(
      filterCatalog(exercises, {
        search: "",
        filters: emptyCatalogFilters,
        sort: "ascending",
      }).map((exercise) => exercise.id),
    ).toEqual(["arms", "built-in", "dumbbell", "custom"]);
    expect(
      filterCatalog(exercises, {
        search: "",
        filters: emptyCatalogFilters,
        sort: "descending",
      }).map((exercise) => exercise.id),
    ).toEqual(["custom", "dumbbell", "built-in", "arms"]);
    expect(exercises.map((exercise) => exercise.id)).toEqual([
      "built-in",
      "custom",
      "arms",
      "dumbbell",
    ]);
  });
  it("matches arbitrary custom metadata and returns no unrelated matches", () => {
    const custom = factory.exercise({
      category: "Mobility",
      equipment: "Towel",
    });
    expect(
      filterCatalog([custom], {
        search: "towel",
        filters: { ...emptyCatalogFilters, category: "Mobility" },
        sort: "ascending",
      }),
    ).toEqual([custom]);
    expect(
      filterCatalog(exercises, {
        search: "",
        filters: { ...emptyCatalogFilters, equipment: "Towel" },
        sort: "ascending",
      }),
    ).toEqual([]);
  });
  it("finds exercises by a translated muscle group or equipment name", () => {
    const { t } = translator("de");
    const search = (text: string) =>
      filterCatalog(exercises, {
        search: text,
        filters: emptyCatalogFilters,
        sort: "ascending",
        labels: (exercise) =>
          `${categoryLabel(exercise.category, t)} ${equipmentLabel(exercise.equipment, t)}`,
      }).map((exercise) => exercise.id);
    expect(search("brust")).toEqual(["built-in", "dumbbell", "custom"]);
    expect(search("langhantel")).toEqual(["arms", "built-in", "custom"]);
    expect(search("chest")).toEqual(["built-in", "dumbbell", "custom"]);
    expect(
      filterCatalog(exercises, {
        search: "brust",
        filters: emptyCatalogFilters,
        sort: "ascending",
      }),
    ).toEqual([]);
  });
});
