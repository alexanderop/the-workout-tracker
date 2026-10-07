import { watchEffect } from "vue";

export function useUnsavedChangesWarning(dirty: () => boolean): void {
  watchEffect((onCleanup) => {
    if (!dirty()) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    onCleanup(() => window.removeEventListener("beforeunload", warn));
  });
}
