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
  let checking = false;
  async function check() {
    if (checking || registration.installing || !navigator.onLine) return;
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
  const checkWhenVisible = () => {
    if (document.visibilityState === "visible") void check();
  };
  const timer = window.setInterval(() => void check(), CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", checkWhenVisible);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", checkWhenVisible);
  };
}
