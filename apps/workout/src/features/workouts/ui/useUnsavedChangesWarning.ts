import { watchEffect } from "vue";

function warn(event: BeforeUnloadEvent) {
  event.preventDefault();
}

export function useUnsavedChangesWarning(dirty: () => boolean): void {
  watchEffect((onCleanup) => {
    if (!dirty()) return;
    window.addEventListener("beforeunload", warn);
    onCleanup(() => window.removeEventListener("beforeunload", warn));
  });
}
