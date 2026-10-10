import { useDocumentVisibility, useOnline } from "@form/composables";
import { effectScope, onScopeDispose, watch } from "vue";

const CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Browsers only look for a new service worker on navigation, which an
 * installed single-page app rarely does. Check hourly and whenever the app
 * returns to the foreground. Returns a cleanup that stops checking.
 */
export function watchServiceWorkerUpdates(
  swUrl: string,
  registration: ServiceWorkerRegistration,
): () => void {
  const scope = effectScope();
  scope.run(() => {
    const online = useOnline();
    const visibility = useDocumentVisibility();
    let checking = false;
    async function check() {
      if (checking || registration.installing || !online.value) return;
      checking = true;
      try {
        // Skip update() when the server is unreachable; it would reject noisily.
        const response = await fetch(swUrl, {
          cache: "no-store",
          headers: { cache: "no-store", "cache-control": "no-cache" },
        });
        if (response.status === 200) await registration.update();
      } catch {
        // Offline or server unavailable: try again on the next check.
      } finally {
        checking = false;
      }
    }
    watch(
      visibility,
      (state) => {
        if (state === "visible") void check();
      },
      { flush: "sync" },
    );
    const timer = window.setInterval(() => void check(), CHECK_INTERVAL_MS);
    onScopeDispose(() => window.clearInterval(timer));
  });
  return () => scope.stop();
}
