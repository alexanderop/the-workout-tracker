import { inject, readonly, ref } from "vue";
import type { InjectionKey, Ref } from "vue";

export const themes = ["system", "light", "dark"] as const;
/** CSS for each accent lives in packages/ui/src/tokens.css, keyed by id. */
export const accents = ["blue", "teal", "violet", "pink", "sand"] as const;

export type Theme = (typeof themes)[number];
export type Accent = (typeof accents)[number];
export type Appearance = { readonly theme: Theme; readonly accent: Accent };

/** index.html reads the same keys in an inline script to avoid a flash. */
export const storageKeys = {
  theme: "workout-theme",
  accent: "workout-accent",
} as const;
export const defaultAppearance: Appearance = {
  theme: "system",
  accent: "blue",
};

function pick<T extends string>(
  options: readonly T[],
  value: unknown,
  fallback: T,
): T {
  return options.find((option) => option === value) ?? fallback;
}

/** Unknown, missing or unreadable values fall back to the defaults. */
export function readAppearance(
  storage: Pick<Storage, "getItem"> | null,
): Appearance {
  try {
    return {
      theme: pick(
        themes,
        storage?.getItem(storageKeys.theme),
        defaultAppearance.theme,
      ),
      accent: pick(
        accents,
        storage?.getItem(storageKeys.accent),
        defaultAppearance.accent,
      ),
    };
  } catch {
    return defaultAppearance;
  }
}

export function resolveTheme(theme: Theme, systemDark: boolean) {
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}

export type AppearanceController = {
  readonly theme: Readonly<Ref<Theme>>;
  readonly accent: Readonly<Ref<Accent>>;
  readonly setTheme: (theme: Theme) => void;
  readonly setAccent: (accent: Accent) => void;
  readonly stop: () => void;
};

/** The part of a `prefers-color-scheme: dark` media query the choice uses. */
export type SystemScheme = {
  readonly matches: boolean;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
};

export type AppearanceEnvironment = {
  readonly document: Document;
  readonly storage: Storage | null;
  readonly systemDark: SystemScheme;
};

export function browserAppearanceEnvironment(): AppearanceEnvironment {
  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
  } catch {
    // Blocked storage keeps the choice for this visit only.
  }
  return {
    document,
    storage,
    systemDark: window.matchMedia("(prefers-color-scheme: dark)"),
  };
}

/**
 * Owns the theme and accent choice: persists it, sets data-theme (resolved to
 * light or dark) and data-accent on <html>, and follows the system scheme
 * while the theme is "system". Call it before the app mounts.
 */
export function createAppearance(
  environment: AppearanceEnvironment,
): AppearanceController {
  const { document: doc, storage, systemDark } = environment;
  const initial = readAppearance(storage);
  const theme = ref<Theme>(initial.theme);
  const accent = ref<Accent>(initial.accent);
  function apply() {
    const root = doc.documentElement;
    root.dataset.theme = resolveTheme(theme.value, systemDark.matches);
    root.dataset.accent = accent.value;
    // The computed background is the resolved color, unlike the token itself.
    const background = getComputedStyle(root).backgroundColor;
    for (const meta of doc.querySelectorAll('meta[name="theme-color"]'))
      meta.setAttribute("content", background);
  }
  function save(key: string, value: string) {
    try {
      storage?.setItem(key, value);
    } catch {
      // The choice still applies for this visit.
    }
  }
  apply();
  systemDark.addEventListener("change", apply);
  return {
    theme: readonly(theme),
    accent: readonly(accent),
    setTheme(next) {
      theme.value = next;
      save(storageKeys.theme, next);
      apply();
    },
    setAccent(next) {
      accent.value = next;
      save(storageKeys.accent, next);
      apply();
    },
    stop: () => systemDark.removeEventListener("change", apply),
  };
}

export const appearanceKey: InjectionKey<AppearanceController> =
  Symbol("Appearance");

export function useAppearance(): AppearanceController {
  const appearance = inject(appearanceKey);
  if (!appearance)
    throw new Error("Appearance settings require the application shell.");
  return appearance;
}
