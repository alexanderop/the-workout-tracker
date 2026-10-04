import { ref, onMounted, onUnmounted } from "vue";
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
  const installed = ref(
    window.matchMedia("(display-mode: standalone)").matches,
  );
  const installMessage = ref("");
  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();
  const updateNetwork = () => {
    online.value = navigator.onLine;
  };
  const captureInstall = (event: Event) => {
    if (isInstallEvent(event)) {
      event.preventDefault();
      installEvent.value = event;
    }
  };
  const markInstalled = () => {
    installed.value = true;
    installEvent.value = null;
  };
  onMounted(() => {
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    window.addEventListener("beforeinstallprompt", captureInstall);
    window.addEventListener("appinstalled", markInstalled);
  });
  onUnmounted(() => {
    window.removeEventListener("online", updateNetwork);
    window.removeEventListener("offline", updateNetwork);
    window.removeEventListener("beforeinstallprompt", captureInstall);
    window.removeEventListener("appinstalled", markInstalled);
  });
  async function install() {
    if (!installEvent.value) {
      installMessage.value =
        "On iPhone or iPad, open Share and choose Add to Home Screen. On desktop, use the install option in your browser menu.";
      return;
    }
    try {
      await installEvent.value.prompt();
      const choice = await installEvent.value.userChoice;
      if (choice.outcome === "accepted")
        installMessage.value = "Installation requested.";
      installEvent.value = null;
    } catch {
      installMessage.value =
        "Use your browser menu to install The Workout Tracker.";
    }
  }
  return {
    online,
    installed,
    offlineReady,
    needRefresh,
    installMessage,
    install,
    updateServiceWorker,
  };
}
