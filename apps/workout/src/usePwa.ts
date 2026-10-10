import {
  useEventListener,
  useMediaQuery,
  useOnline,
} from "@form/composables";
import { ref, computed, onScopeDispose, watch } from "vue";
import { useRegisterSW } from "virtual:pwa-register/vue";
import { watchServiceWorkerUpdates } from "./serviceWorkerUpdates";

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
  const installMessage = ref("");
  let unmounted = false;
  let stopUpdateChecks: (() => void) | undefined;
  // True once this tab's user pressed Update app. Only then may a new
  // controller reload this tab; in any other tab it only offers a reload.
  let updateAccepted = false;
  const reloadReady = ref(false);
  const registered = useRegisterSW({
    // The registration code reloads the page on a controller change in every
    // tab that has seen the waiting worker unless it is given this hook.
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
  const { offlineReady } = registered;
  const needRefresh = computed(
    () => registered.needRefresh.value && !reloadReady.value,
  );
  function updateServiceWorker() {
    updateAccepted = true;
    return registered.updateServiceWorker();
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
    stopUpdateChecks?.();
  });
  function install() {
    installMessage.value = "";
    installOpen.value = true;
    return Promise.resolve();
  }
  async function requestInstall() {
    const event = installEvent.value;
    if (!event || installing.value) return;
    installing.value = true;
    installMessage.value = "";
    try {
      await event.prompt();
      const choice = await event.userChoice;
      installMessage.value =
        choice.outcome === "accepted"
          ? "Installation requested. Follow your browser to finish."
          : "Installation cancelled. You can keep using the app here.";
    } catch {
      installMessage.value =
        "The installer could not open. Use the browser instructions below.";
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
