import { describe, expect, it } from "vitest";
import {
  categoryLabel,
  equipmentLabel,
} from "../../src/features/workouts/ui/exerciseLabels";
import { t, translator } from "../../src/i18n/testing";

const german = translator("de").t;
const categories = [
  ["Chest", "Brust"],
  ["Back", "Rücken"],
  ["Legs", "Beine"],
  ["Shoulders", "Schultern"],
  ["Arms", "Arme"],
  ["Core", "Rumpf"],
  ["Other", "Sonstiges"],
] as const;
const equipment = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Band",
  "Kettlebell",
  "EGYM",
  "Other",
] as const;

describe("given the stored muscle groups", () => {
  it.each(categories)("should show %s as %s in German", (stored, label) => {
    expect(categoryLabel(stored, german)).toBe(label);
  });

  it.each(categories)("should keep %s in English", (stored) => {
    expect(categoryLabel(stored, t)).toBe(stored);
  });

  it("should show a custom muscle group as typed", () => {
    expect(categoryLabel("Neck", german)).toBe("Neck");
  });
});

describe("given the stored equipment", () => {
  it.each(equipment)("should keep %s in English", (stored) => {
    expect(equipmentLabel(stored, t)).toBe(stored);
  });

  it("should translate built-in equipment for German", () => {
    expect(equipmentLabel("Barbell", german)).toBe("Langhantel");
    expect(equipmentLabel("Other", german)).toBe("Sonstiges");
  });

  it("should show custom equipment as typed", () => {
    expect(equipmentLabel("Sandbag", german)).toBe("Sandbag");
  });
});
