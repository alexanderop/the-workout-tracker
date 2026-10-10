import { describe, expect, it } from "vitest";
import { de } from "../../src/i18n/de";
import { en } from "../../src/i18n/en";
import { matchLocale, supportedLocales } from "../../src/i18n";
import { translator } from "../../src/i18n/testing";
import { createFormat } from "../../src/i18n/format";
import { languages, resolveLocale } from "../../src/app/language";

// Flattens a catalog to [path, message] pairs.
function entries(node: unknown, path = ""): [string, string][] {
  if (typeof node === "string") return [[path, node]];
  if (typeof node !== "object" || node === null) return [];
  return Object.entries(node).flatMap(([key, value]) =>
    entries(value, path ? `${path}.${key}` : key),
  );
}
const placeholders = (message: string) =>
  [...message.matchAll(/\{(\w+)\}/g)]
    .map(([, name]) => name)
    .toSorted((a = "", b = "") => a.localeCompare(b));
const branches = (message: string) => message.split(" | ").length;

describe("given the German catalog", () => {
  const english = new Map(entries(en));
  const german = entries(de);
  // [path, German, English] for every path both catalogs share.
  const pairs = german.flatMap(([path, message]) => {
    const source = english.get(path);
    return source === undefined ? [] : [[path, message, source] as const];
  });

  it("should translate every English message", () => {
    expect(german.map(([path]) => path)).toEqual([...english.keys()]);
  });

  it("should not leave a message empty", () => {
    expect(german.filter(([, message]) => message.trim() === "")).toEqual([]);
  });

  it.each(pairs)(
    "should keep the placeholders of %s",
    (_path, message, source) => {
      expect(placeholders(message)).toEqual(placeholders(source));
    },
  );

  it.each(pairs)(
    "should keep the plural forms of %s",
    (_path, message, source) => {
      expect(branches(message)).toBe(branches(source));
    },
  );
});

describe("given the Language setting", () => {
  it("should offer System plus exactly the locales with a catalog", () => {
    expect(languages).toEqual(["system", ...supportedLocales]);
  });

  it("should follow the browser only while the choice is System", () => {
    expect(resolveLocale("system", ["de-AT", "en"])).toBe("de");
    expect(resolveLocale("system", ["fr-FR"])).toBe("en");
    expect(resolveLocale("en", ["de-DE"])).toBe("en");
    expect(resolveLocale("de", ["en-US"])).toBe("de");
  });
});

describe("given a browser language list", () => {
  it.each([
    [["de-AT", "en"], "de"],
    [["fr-FR", "de"], "de"],
    [["EN-gb"], "en"],
    [["fr", "es"], "en"],
    [[], "en"],
  ] as const)("should pick a supported locale from %j", (preferred, locale) => {
    expect(matchLocale(preferred)).toBe(locale);
  });
});

describe("given a translator", () => {
  it("should read the message of the active locale", () => {
    expect(translator("en").t("shell.language.system")).toBe("System");
    expect(translator("de").t("shell.language.title")).toBe("Sprache");
  });
});

describe("given locale formats", () => {
  const at = new Date(2026, 9, 5, 12).getTime();

  it("should format numbers with the locale's separators", () => {
    expect(createFormat("en").number(1234.5)).toBe("1,234.5");
    expect(createFormat("de").number(1234.5)).toBe("1.234,5");
  });

  it("should format dates in the locale's language", () => {
    expect(createFormat("en").longDate(at)).toBe("Monday, October 5");
    expect(createFormat("de").longDate(at)).toBe("Montag, 5. Oktober");
    expect(createFormat("de").weekdayShort(at)).toBe("Mo");
  });
});
