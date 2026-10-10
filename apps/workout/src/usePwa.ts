import { useEventListener, useMediaQuery, useOnline } from "@form/composables";
import { ref, computed, onScopeDispose, watch } from "vue";
import { registerSW } from "virtual:pwa-register";
import { watchServiceWorkerUpdates } from "./serviceWorkerUpdates";
import { useTranslation } from "./i18n";

const REGISTER_DELAY_MS = 1000;

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
function isInstallEvent(event: Event): event is InstallEvent {
  return (
    "prompt" in event &&
    typeof event.prompt === "function" &&
    "userChoice" in event
  );
}
export function usePwa() {
  const { t } = useTranslation();
  const online = useOnline();
  const installEvent = ref<InstallEvent | null>(null);
  const displayMode = useMediaQuery("(display-mode: standalone)");
  const isStandalone = () =>
    displayMode.value ||
    ("standalone" in navigator && navigator.standalone === true);
  const installed = ref(isStandalone());
  const installOpen = ref(false);
  const installing = ref(false);
  const canInstall = computed(
    () => installEvent.value !== null && !installed.value,
  );
  const platform = detectInstallPlatform();
  watch(
    displayMode,
    () => {
      installed.value = isStandalone();
      if (installed.value) installEvent.value = null;
    },
    { flush: "sync" },
  );
  const installOutcome = ref<"accepted" | "cancelled" | "failed" | null>(null);
  const installMessage = computed(() =>
    installOutcome.value ? t(`shell.install.${installOutcome.value}`) : "",
  );
  let unmounted = false;
  let stopUpdateChecks: (() => void) | undefined;
  // True once this tab's user pressed Update app. Only then may a new
  // controller reload this tab; in any other tab it only offers a reload.
  let updateAccepted = false;
  const reloadReady = ref(false);
  const offlineReady = ref(false);
  const registeredNeedRefresh = ref(false);
  let updateWorker: ReturnType<typeof registerSW> | undefined;
  // Registering installs the worker, which downloads the whole precache. That
  // competes with the page's own startup for bandwidth, so it starts once the
  // first screen has had time to appear.
  function register() {
    if (unmounted) return;
    updateWorker = registerSW({
      immediate: true,
      onNeedRefresh() {
        registeredNeedRefresh.value = true;
      },
      onOfflineReady() {
        offlineReady.value = true;
      },
      // The registration code reloads the page on a controller change in
      // every tab that has seen the waiting worker unless it is given this
      // hook.
      onNeedReload() {
        if (!updateAccepted) {
          reloadReady.value = true;
          return;
        }
        window.location.reload();
      },
      onRegisteredSW(swUrl, registration) {
        if (!registration || unmounted) return;
        stopUpdateChecks = watchServiceWorkerUpdates(swUrl, registration);
      },
    });
  }
  const registerTimer = window.setTimeout(register, REGISTER_DELAY_MS);
  const needRefresh = computed(
    () => registeredNeedRefresh.value && !reloadReady.value,
  );
  function updateServiceWorker() {
    updateAccepted = true;
    return updateWorker?.() ?? Promise.resolve();
  }
  const captureInstall = (event: Event) => {
    if (isInstallEvent(event) && !installed.value) {
      installEvent.value = event;
    }
  };
  const markInstalled = () => {
    installed.value = true;
    installEvent.value = null;
  };
  useEventListener(window, "beforeinstallprompt", captureInstall);
  useEventListener(window, "appinstalled", markInstalled);
  onScopeDispose(() => {
    unmounted = true;
    window.clearTimeout(registerTimer);
    stopUpdateChecks?.();
  });
  function install() {
    installOutcome.value = null;
    installOpen.value = true;
    return Promise.resolve();
  }
  async function requestInstall() {
    const event = installEvent.value;
    if (!event || installing.value) return;
    installing.value = true;
    installOutcome.value = null;
    try {
      await event.prompt();
      const choice = await event.userChoice;
      installOutcome.value =
        choice.outcome === "accepted" ? "accepted" : "cancelled";
    } catch {
      installOutcome.value = "failed";
    } finally {
      installEvent.value = null;
      installing.value = false;
    }
  }
  return {
    installOpen,
    installing,
    canInstall,
    platform,
    requestInstall,
    online,
    installed,
    offlineReady,
    needRefresh,
    reloadReady,
    installMessage,
    install,
    updateServiceWorker,
  };
}

function detectInstallPlatform(): "ios" | "android" | "browser" {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return "ios";
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    return "ios";
  if (/Android/.test(navigator.userAgent)) return "android";
  return "browser";
}
