import { sessionTotals, type CompletedSession } from "../domain";
export const fmt = (value: number) =>
  new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
export const shortDate = (at: number) =>
  new Date(at).toLocaleDateString("en", { month: "short", day: "numeric" });
export const longDate = (at: number) =>
  new Date(at).toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
export const duration = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(Math.max(0, seconds) % 60)
    .toString()
    .padStart(2, "0")}`;
export const restLabel = (remaining: number) =>
  remaining > 0 ? `${duration(remaining)} rest` : "Rest complete";
export const nextSetLabel = (
  next: { exercise: { name: string; sets: readonly unknown[] }; index: number } | undefined,
) =>
  next
    ? `Next: ${next.exercise.name} · Set ${next.index + 1} of ${next.exercise.sets.length}`
    : "All sets logged";
export const sessionMinutes = (session: CompletedSession) =>
  Math.max(1, Math.round((session.finishedAt - session.startedAt) / 60000));

export function download(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function trainingTotals(history: readonly CompletedSession[]) {
  return history.reduce(
    (sum, session) => {
      const totals = sessionTotals(session);
      return {
        workouts: sum.workouts + 1,
        sets: sum.sets + totals.completedSets,
        volume: sum.volume + totals.volumeKg,
      };
    },
    { workouts: 0, sets: 0, volume: 0 },
  );
}
