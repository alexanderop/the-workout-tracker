import { useRouter } from "vue-router";
import type { SettingsSection } from "./sections";

/**
 * Link attributes for the hub (no section) or one of its pages. A plain anchor
 * with the router's href keeps middle-click and "open in new tab" native and
 * leaves the router component out of the lazily loaded Settings chunk.
 */
export function useSectionLink() {
  const router = useRouter();
  return (section?: SettingsSection) => {
    const to = { name: "settings", params: { section } } as const;
    return {
      href: router.resolve(to).href,
      onClick(event: MouseEvent) {
        if (
          event.defaultPrevented ||
          event.button ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        // The router reports a failed navigation through its error handler.
        router.push(to).catch(() => undefined);
      },
    };
  };
}
