import type { Ref } from "vue";

export type Installation = {
  readonly installOpen: Ref<boolean>;
  readonly installing: Readonly<Ref<boolean>>;
  readonly canInstall: Readonly<Ref<boolean>>;
  readonly platform: "ios" | "android" | "browser";
  readonly requestInstall: () => Promise<void>;
  readonly online: Readonly<Ref<boolean>>;
  readonly installed: Readonly<Ref<boolean>>;
  readonly offlineReady: Readonly<Ref<boolean>>;
  /** A new version is waiting for this tab's user to accept it. */
  readonly needRefresh: Readonly<Ref<boolean>>;
  /** A new version already runs elsewhere; this tab reloads only on request. */
  readonly reloadReady: Readonly<Ref<boolean>>;
  readonly installMessage: Readonly<Ref<string>>;
  readonly install: () => Promise<void>;
  readonly updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
};

/** Factories run in the shell setup scope so their listeners share its lifetime. */
export type WorkoutEnvironment = {
  readonly now: () => number;
  readonly useInstallation: () => Installation;
};
