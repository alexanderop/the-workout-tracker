import { useEventListener } from "@form/composables";
import { watchEffect } from "vue";

export function useUnsavedChangesWarning(dirty: () => boolean): void {
  watchEffect((onCleanup) => {
    if (!dirty()) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    onCleanup(useEventListener(window, "beforeunload", warn));
  });
}
