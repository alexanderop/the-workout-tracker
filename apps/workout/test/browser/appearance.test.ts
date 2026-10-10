import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "@form/ui/tokens.css";
import {
  createAppearance,
  storageKeys,
  type AppearanceController,
} from "../../src/app/appearance";

/** A system color scheme the test can flip. */
class FakeSystemScheme extends EventTarget {
  matches: boolean;
  constructor(matches: boolean) {
    super();
    this.matches = matches;
  }
  flip(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event("change"));
  }
}

const root = document.documentElement;
let controller: AppearanceController | undefined;
let meta: HTMLMetaElement;

function start(systemDark: boolean) {
  const system = new FakeSystemScheme(systemDark);
  controller = createAppearance({
    document,
    storage: localStorage,
    systemDark: system,
  });
  return { system, controller };
}

beforeEach(() => {
  localStorage.clear();
  root.style.background = "var(--background)";
  meta = document.createElement("meta");
  meta.name = "theme-color";
  document.head.append(meta);
});
afterEach(() => {
  controller?.stop();
  controller = undefined;
  meta.remove();
  localStorage.clear();
  root.style.background = "";
  delete root.dataset.theme;
  delete root.dataset.accent;
});

describe("real browser appearance", () => {
  it("should apply the saved choice before anything is shown", () => {
    localStorage.setItem(storageKeys.theme, "dark");
    localStorage.setItem(storageKeys.accent, "teal");
    start(false);
    expect(root.dataset.theme).toBe("dark");
    expect(root.dataset.accent).toBe("teal");
  });

  it("should follow the system until the user picks a theme", () => {
    const { system, controller } = start(false);
    expect(root.dataset.theme).toBe("light");
    system.flip(true);
    expect(root.dataset.theme).toBe("dark");
    controller.setTheme("light");
    system.flip(true);
    expect(root.dataset.theme).toBe("light");
  });

  it("should persist the choice and reuse it on the next visit", () => {
    const { controller } = start(false);
    controller.setTheme("dark");
    controller.setAccent("pink");
    expect(localStorage.getItem(storageKeys.theme)).toBe("dark");
    expect(localStorage.getItem(storageKeys.accent)).toBe("pink");
    controller.stop();
    const next = start(false).controller;
    expect(next.theme.value).toBe("dark");
    expect(next.accent.value).toBe("pink");
  });

  it("should switch the document color scheme and the browser chrome", () => {
    const { controller } = start(false);
    controller.setTheme("dark");
    expect(getComputedStyle(root).colorScheme).toBe("dark");
    expect(meta.content).toBe(getComputedStyle(root).backgroundColor);
    controller.setTheme("light");
    expect(getComputedStyle(root).colorScheme).toBe("light");
  });

  it("should stop following the system after it is stopped", () => {
    const { system, controller } = start(false);
    controller.stop();
    system.flip(true);
    expect(root.dataset.theme).toBe("light");
  });
});
