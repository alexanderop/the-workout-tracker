import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRegisterSW } from "virtual:pwa-register/vue";

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
  const online = ref(navigator.onLine);
  const installEvent = ref<InstallEvent | null>(null);
  const displayMode = window.matchMedia("(display-mode: standalone)");
  const isStandalone = () =>
    displayMode.matches ||
    ("standalone" in navigator && navigator.standalone === true);
  const installed = ref(isStandalone());
  const installOpen = ref(false);
  const installing = ref(false);
  const canInstall = computed(
    () => installEvent.value !== null && !installed.value,
  );
  const platform = detectInstallPlatform();
  const updateDisplayMode = () => {
    installed.value = isStandalone();
    if (installed.value) installEvent.value = null;
  };
  const installMessage = ref("");
  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();
  const updateNetwork = () => {
    online.value = navigator.onLine;
  };
  const captureInstall = (event: Event) => {
    if (isInstallEvent(event) && !installed.value) {
      installEvent.value = event;
    }
  };
  const markInstalled = () => {
    installed.value = true;
    installEvent.value = null;
  };
  onMounted(() => {
    displayMode.addEventListener("change", updateDisplayMode);
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    window.addEventListener("beforeinstallprompt", captureInstall);
    window.addEventListener("appinstalled", markInstalled);
  });
  onUnmounted(() => {
    displayMode.removeEventListener("change", updateDisplayMode);
    window.removeEventListener("online", updateNetwork);
    window.removeEventListener("offline", updateNetwork);
    window.removeEventListener("beforeinstallprompt", captureInstall);
    window.removeEventListener("appinstalled", markInstalled);
  });
  async function install() {
    installMessage.value = "";
    installOpen.value = true;
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
