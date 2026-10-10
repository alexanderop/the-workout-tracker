import { describe, expect, it } from "vitest";
import { translator } from "../../src/i18n/testing";
import {
  nextSetLabel,
  restLabel,
} from "../../src/features/workouts/ui/trainingLabels";

const next = { exercise: { name: "Squat", sets: [1, 2, 3] }, index: 1 };

describe("training labels", () => {
  it("words the rest timer and the next set in English", () => {
    const { t } = translator("en");
    expect(restLabel(90, t)).toBe("01:30 rest");
    expect(restLabel(0, t)).toBe("Rest complete");
    expect(nextSetLabel(next, t)).toBe("Next: Squat · Set 2 of 3");
    expect(nextSetLabel(undefined, t)).toBe("All sets logged");
  });

  it("words the same labels in German", () => {
    const { t } = translator("de");
    expect(restLabel(90, t)).toBe("01:30 Pause");
    expect(restLabel(0, t)).toBe("Pause vorbei");
    expect(nextSetLabel(next, t)).toBe("Als Nächstes: Squat · Satz 2 von 3");
    expect(nextSetLabel(undefined, t)).toBe("Alle Sätze erfasst");
  });
});
