import { onMounted, onUnmounted, ref } from "vue";

export function useWorkoutClock(readNow: () => number) {
  const now = ref(readNow());
  let tick: ReturnType<typeof setInterval> | undefined;
  function refresh() {
    now.value = readNow();
  }
  onMounted(() => {
    refresh();
    tick = setInterval(refresh, 1000);
  });
  onUnmounted(() => {
    if (tick !== undefined) clearInterval(tick);
  });
  return { now, refresh };
}
