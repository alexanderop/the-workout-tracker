import { describe, expect, it } from "vitest";
import {
  categoryLabel,
  equipmentLabel,
  kindLabel,
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

describe("given an exercise type", () => {
  it("should name each type in English and German", () => {
    expect(kindLabel("compound", t)).toBe("Compound");
    expect(kindLabel("isolation", german)).toBe("Isolation");
    expect(kindLabel("compound", german)).toBe("Mehrgelenkig");
  });

  it("should say when no type is chosen", () => {
    expect(kindLabel(undefined, t)).toBe("Not set");
  });
});
