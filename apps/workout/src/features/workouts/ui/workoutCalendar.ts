import type { CompletedSession } from "../domain";

export function localDay(at: number): number {
  const date = new Date(at);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function shiftDay(day: number, offset: number): number {
  const date = new Date(day);
  date.setDate(date.getDate() + offset);
  return localDay(date.getTime());
}

export function monthStart(day: number, offset = 0): number {
  const date = new Date(day);
  return new Date(date.getFullYear(), date.getMonth() + offset, 1).getTime();
}

export function rollingDays(today: number): readonly number[] {
  return Array.from({ length: 7 }, (_, index) => shiftDay(today, index - 6));
}

/** One timestamp per weekday, Monday first, for the calendar's column heads. */
export function weekdayStarts(): readonly number[] {
  const monday = new Date(2024, 0, 1).getTime();
  return Array.from({ length: 7 }, (_, index) => shiftDay(monday, index));
}

export function monthDays(month: number): readonly (number | null)[] {
  const first = monthStart(month);
  const leading = (new Date(first).getDay() + 6) % 7;
  const length = new Date(monthStart(first, 1) - 1).getDate();
  return Array.from({ length: leading + length }, (_, index) =>
    index < leading ? null : shiftDay(first, index - leading),
  );
}

export function eligibleSessionCount(
  sorted: readonly CompletedSession[],
  now: number,
): number {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const session = sorted[middle];
    if (session && session.finishedAt <= now) {
      low = middle + 1;
      continue;
    }
    high = middle;
  }
  return low;
}

export function indexCompletedSessions(
  sessions: readonly CompletedSession[],
): ReadonlyMap<number, readonly CompletedSession[]> {
  const days = new Map<number, CompletedSession[]>();
  for (const session of sessions) {
    const key = localDay(session.finishedAt);
    const entries = days.get(key) ?? [];
    entries.push(session);
    days.set(key, entries);
  }
  return days;
}
