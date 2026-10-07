import { describe, expect, it } from "vitest";
import {
  emptyCatalogFilters,
  filterCatalog,
} from "../../src/features/workouts/ui/catalogFilters";
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
      filterCatalog(
        exercises,
        " PRESS ",
        { equipment: "Barbell", category: "Chest", onlyCustom: true },
        "ascending",
      ).map((exercise) => exercise.id),
    ).toEqual(["custom"]);
  });
  it("orders names in either direction without mutating the supplied catalog", () => {
    expect(
      filterCatalog(exercises, "", emptyCatalogFilters, "ascending").map(
        (exercise) => exercise.id,
      ),
    ).toEqual(["arms", "built-in", "dumbbell", "custom"]);
    expect(
      filterCatalog(exercises, "", emptyCatalogFilters, "descending").map(
        (exercise) => exercise.id,
      ),
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
      filterCatalog(
        [custom],
        "towel",
        { ...emptyCatalogFilters, category: "Mobility" },
        "ascending",
      ),
    ).toEqual([custom]);
    expect(
      filterCatalog(
        exercises,
        "",
        { ...emptyCatalogFilters, equipment: "Towel" },
        "ascending",
      ),
    ).toEqual([]);
  });
});
