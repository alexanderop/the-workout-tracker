import { onMounted, onUnmounted, ref } from "vue";

export function useWorkoutClock() {
  const now = ref(Date.now());
  let tick: ReturnType<typeof setInterval> | undefined;
  function refresh() {
    now.value = Date.now();
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
