import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  accents,
  defaultAppearance,
  readAppearance,
  resolveTheme,
  storageKeys,
  themes,
} from "../../src/app/appearance";

function storageWith(values: Record<string, string>) {
  return { getItem: (key: string) => values[key] ?? null };
}

describe("given a stored appearance", () => {
  it("should read every known theme and accent", () => {
    for (const theme of themes)
      for (const accent of accents)
        expect(
          readAppearance(
            storageWith({
              [storageKeys.theme]: theme,
              [storageKeys.accent]: accent,
            }),
          ),
        ).toEqual({ theme, accent });
  });

  it("should follow the system in blue when nothing is stored", () => {
    expect(readAppearance(storageWith({}))).toEqual(defaultAppearance);
    expect(defaultAppearance).toEqual({ theme: "system", accent: "blue" });
  });

  it("should fall back for each unknown value on its own", () => {
    expect(
      readAppearance(
        storageWith({
          [storageKeys.theme]: "sepia",
          [storageKeys.accent]: "pink",
        }),
      ),
    ).toEqual({ theme: "system", accent: "pink" });
    expect(
      readAppearance(storageWith({ [storageKeys.accent]: "orange" })),
    ).toEqual(defaultAppearance);
  });

  it("should fall back when storage is blocked or missing", () => {
    const blocked = {
      getItem() {
        throw new Error("blocked");
      },
    };
    expect(readAppearance(blocked)).toEqual(defaultAppearance);
    expect(readAppearance(null)).toEqual(defaultAppearance);
  });
});

describe("given a theme choice", () => {
  it("should let an explicit theme win over the system", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("should follow the system for the system choice", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("given the startup scripts that avoid a flash of the wrong theme", () => {
  it.each(["../../index.html", "../../preview.html"])(
    "should read the same keys and accents in %s",
    (file) => {
      const html = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(html).toContain(`getItem("${storageKeys.theme}")`);
      expect(html).toContain(`getItem("${storageKeys.accent}")`);
      expect(html).toContain(`(${accents.join("|")})`);
    },
  );
});
