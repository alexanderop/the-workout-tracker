import { describe, expect, it } from "vitest";
import {
  eligibleSessionCount,
  indexCompletedSessions,
  localDay,
  monthDays,
  monthStart,
  rollingDays,
  shiftDay,
  weekdayStarts,
} from "../../src/features/workouts/ui/workoutCalendar";
import { createFormat } from "../../src/i18n/format";
import { translator } from "../../src/i18n/testing";
import { createWorkoutFactory } from "../support/factories";

const at = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day).getTime();
const atHour = (day: number, hour: number) => new Date(day).setHours(hour);
const parts = (timestamp: number) => {
  const date = new Date(timestamp);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
};

const initials = (locale: "en" | "de") =>
  weekdayStarts().map((day) => createFormat(locale).weekdayNarrow(day));

describe("workout calendar", () => {
  it("ends a seven-day window on the local day across New Year", () => {
    const days = rollingDays(localDay(atHour(at(2027, 1, 5), 23)));
    expect(days).toHaveLength(7);
    expect(parts(days[0] ?? 0)).toEqual([2026, 12, 30]);
    expect(parts(days[6] ?? 0)).toEqual([2027, 1, 5]);
    expect(parts(localDay(at(2027, 1, 6)))).toEqual([2027, 1, 6]);
  });
  it("uses civil dates through both daylight-saving transitions", () => {
    expect(parts(shiftDay(at(2026, 3, 29), 1))).toEqual([2026, 3, 30]);
    expect(parts(shiftDay(at(2026, 10, 25), 1))).toEqual([2026, 10, 26]);
    expect(parts(shiftDay(at(2026, 3, 30), -1))).toEqual([2026, 3, 29]);
    expect(parts(shiftDay(at(2026, 10, 26), -1))).toEqual([2026, 10, 25]);
  });
  it("renders leap February with Monday-leading blanks and changes month from day one", () => {
    const leap = monthDays(at(2028, 2, 20));
    expect(leap[0]).toBeNull();
    expect(parts(leap[1] ?? 0)).toEqual([2028, 2, 1]);
    expect(parts(leap.at(-1) ?? 0)).toEqual([2028, 2, 29]);
    expect(parts(monthStart(at(2028, 1, 31), 1))).toEqual([2028, 2, 1]);
    expect(parts(monthStart(at(2026, 12, 31), 1))).toEqual([2027, 1, 1]);
  });
  it("groups every completed session by its local finish date and excludes future timestamps", () => {
    const factory = createWorkoutFactory("calendar");
    const sessions = [
      factory.completedSession({
        name: "Yesterday",
        finishedAt: atHour(at(2026, 10, 4), 23),
      }),
      factory.completedSession({
        name: "Morning",
        finishedAt: atHour(at(2026, 10, 5), 8),
      }),
      factory.completedSession({
        name: "Lunch",
        finishedAt: atHour(at(2026, 10, 5), 12),
      }),
      factory.completedSession({
        name: "Future today",
        finishedAt: atHour(at(2026, 10, 5), 18),
      }),
      factory.completedSession({
        name: "Tomorrow",
        finishedAt: atHour(at(2026, 10, 6), 8),
      }),
    ];
    const count = eligibleSessionCount(sessions, atHour(at(2026, 10, 5), 12));
    expect(count).toBe(3);
    const index = indexCompletedSessions(sessions.slice(0, count));
    expect(index.get(at(2026, 10, 5))?.map((session) => session.name)).toEqual([
      "Morning",
      "Lunch",
    ]);
    expect(index.get(at(2026, 10, 4))?.map((session) => session.name)).toEqual([
      "Yesterday",
    ]);
    expect(index.has(at(2026, 10, 6))).toBe(false);
    expect(eligibleSessionCount(sessions, atHour(at(2026, 10, 5), 18))).toBe(4);
  });
  it("heads the month grid with Monday-first weekday initials in each language", () => {
    expect(initials("en")).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    expect(initials("de")).toEqual(["M", "D", "M", "D", "F", "S", "S"]);
  });
  it("names each day button so that it starts with its visible weekday and number", () => {
    const day = at(2026, 10, 5);
    for (const locale of ["en", "de"] as const) {
      const { t } = translator(locale);
      const format = createFormat(locale);
      const weekday = format.weekdayShort(day);
      const name = t("workouts.calendar.rhythmDayLabel", {
        weekday,
        day: new Date(day).getDate(),
        label: t("workouts.calendar.dayLabel", {
          date: format.fullDate(day),
          count: t("workouts.calendar.completedCount", 2),
        }),
      });
      expect(name.startsWith(`${weekday} 5, `)).toBe(true);
    }
    const english = translator("en").t;
    expect(
      english("workouts.calendar.rhythmDayLabel", {
        weekday: "Mon",
        day: 5,
        label: english("workouts.calendar.dayLabel", {
          date: "Monday, October 5, 2026",
          count: english("workouts.calendar.completedCount", 1),
        }),
      }),
    ).toBe("Mon 5, Monday, October 5, 2026, 1 completed workout");
  });
});
