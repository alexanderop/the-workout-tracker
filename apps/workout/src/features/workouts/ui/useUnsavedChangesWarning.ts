import { useEventListener } from "@form/composables";
import { watchEffect } from "vue";

function warn(event: BeforeUnloadEvent) {
  event.preventDefault();
}

export function useUnsavedChangesWarning(dirty: () => boolean): void {
  watchEffect((onCleanup) => {
    if (!dirty()) return;
    onCleanup(useEventListener(window, "beforeunload", warn));
  });
}
