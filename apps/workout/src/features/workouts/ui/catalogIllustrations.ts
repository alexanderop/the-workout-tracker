import type {
  MuscleHighlight,
  MuscleMapView,
  MuscleRegion,
} from "@form/ui/muscle-map-types";
import barbell from "./assets/exercises/deadlift.webp";
import dumbbell from "./assets/exercises/hammer-curl.webp";
import cable from "./assets/exercises/lat-pulldown.webp";
import machine from "./assets/exercises/chest-press.webp";
import bodyweight from "./assets/exercises/push-up.webp";
import egym from "./assets/exercises/egym-chest-press.webp";

export const equipmentIllustrations: ReadonlyMap<string, string> = new Map([
  ["Barbell", barbell],
  ["Dumbbell", dumbbell],
  ["Cable", cable],
  ["Machine", machine],
  ["Bodyweight", bodyweight],
  ["EGYM", egym],
]);

type GroupIllustration = Readonly<{
  view: MuscleMapView;
  highlights: readonly MuscleHighlight[];
}>;
function group(
  view: MuscleMapView,
  muscles: readonly MuscleRegion[],
): GroupIllustration {
  return {
    view,
    highlights: muscles.map((muscle) => ({ muscle, role: "primary" })),
  };
}
export const muscleIllustrations: ReadonlyMap<string, GroupIllustration> =
  new Map([
    ["Chest", group("front", ["chest"])],
    ["Back", group("back", ["upper-back", "lower-back"])],
    ["Shoulders", group("front", ["shoulders"])],
    ["Arms", group("both", ["biceps", "triceps", "forearms"])],
    ["Core", group("front", ["abs"])],
    ["Legs", group("both", ["quads", "hamstrings", "glutes", "calves"])],
  ]);
