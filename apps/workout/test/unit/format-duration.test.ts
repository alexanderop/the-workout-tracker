import { describe, expect, it } from "vitest";
import { createFormat } from "../../src/i18n/format";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
// Intl separates number and unit with a no-break space; compare with a plain one.
const plain = (text: string) => text.replace(/\s/g, " ");

describe("given a workout duration", () => {
  describe("when it is under an hour", () => {
    it("should show whole minutes in English", () => {
      const { duration } = createFormat("en");
      expect(plain(duration(24 * MINUTE))).toBe("24 min");
      expect(plain(duration(59 * MINUTE))).toBe("59 min");
    });

    it("should use the German abbreviation", () => {
      expect(plain(createFormat("de").duration(24 * MINUTE))).toBe("24 Min.");
    });

    it("should never pluralise a short unit wrongly", () => {
      const { duration } = createFormat("en");
      expect(plain(duration(MINUTE))).toBe("1 min");
      expect(duration(MINUTE)).not.toContain("minutes");
    });
  });

  describe("when it is shorter than a minute", () => {
    it("should round up to one minute", () => {
      expect(plain(createFormat("en").duration(24_000))).toBe("1 min");
      expect(plain(createFormat("en").duration(0))).toBe("1 min");
    });
  });

  describe("when it rounds to the nearest minute", () => {
    it("should round half a minute up and less down", () => {
      const { duration } = createFormat("en");
      expect(plain(duration(89 * 1000))).toBe("1 min");
      expect(plain(duration(90 * 1000))).toBe("2 min");
    });
  });

  describe("when it is an hour or longer", () => {
    it("should combine hours and minutes", () => {
      expect(plain(createFormat("en").duration(HOUR + 5 * MINUTE))).toBe(
        "1 hr 5 min",
      );
      expect(plain(createFormat("de").duration(HOUR + 5 * MINUTE))).toBe(
        "1 Std. 5 Min.",
      );
    });

    it("should drop zero minutes", () => {
      expect(plain(createFormat("en").duration(2 * HOUR))).toBe("2 hr");
    });

    it("should carry 59.5 minutes over to the hour", () => {
      expect(plain(createFormat("en").duration(59.5 * MINUTE))).toBe("1 hr");
    });
  });
});

describe("given a duration split for a stat", () => {
  it("should return the number and the unit apart under an hour", () => {
    expect(createFormat("en").durationParts(24 * MINUTE)).toEqual({
      value: "24",
      unit: "min",
    });
    expect(createFormat("de").durationParts(24 * MINUTE)).toEqual({
      value: "24",
      unit: "Min.",
    });
  });

  it("should keep the whole text as the value from an hour on", () => {
    const parts = createFormat("en").durationParts(HOUR + 5 * MINUTE);
    expect(plain(parts.value)).toBe("1 hr 5 min");
    expect(parts.unit).toBeUndefined();
  });

  it("should agree with the plain duration", () => {
    const { duration, durationParts } = createFormat("en");
    const parts = durationParts(37 * MINUTE);
    expect(`${parts.value} ${parts.unit}`).toBe(plain(duration(37 * MINUTE)));
  });
});
