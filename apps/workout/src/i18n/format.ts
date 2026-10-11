import type { Locale } from "./index";

/** Whole minutes, never below one: a workout is not "0 min". */
const minutesIn = (ms: number) => Math.max(1, Math.round(ms / 60000));

/**
 * Locale-aware numbers, dates and durations. Dates are timestamps in
 * milliseconds and render in the viewer's time zone, like the calendar days
 * they belong to.
 */
export function createFormat(locale: Locale) {
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const wholeNumber = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  });
  const shortDate = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  });
  const longDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const fullDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const monthYear = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const weekdayNarrow = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const minuteUnit = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "minute",
    unitDisplay: "short",
  });
  const hourUnit = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "hour",
    unitDisplay: "short",
  });
  const durationText = (ms: number) => {
    const minutes = minutesIn(ms);
    const hours = Math.floor(minutes / 60);
    if (!hours) return minuteUnit.format(minutes);
    const rest = minutes % 60;
    return rest
      ? `${hourUnit.format(hours)} ${minuteUnit.format(rest)}`
      : hourUnit.format(hours);
  };
  return {
    /** Up to two decimals: 62.5 kg, 1,250 volume. */
    number: (value: number) => number.format(value),
    /** Counts and other whole values. */
    wholeNumber: (value: number) => wholeNumber.format(value),
    shortDate: (at: number) => shortDate.format(at),
    longDate: (at: number) => longDate.format(at),
    fullDate: (at: number) => fullDate.format(at),
    monthYear: (at: number) => monthYear.format(at),
    weekdayShort: (at: number) => weekdayShort.format(at),
    weekdayNarrow: (at: number) => weekdayNarrow.format(at),
    /**
     * How long a workout took, from milliseconds: "24 min", "1 hr 5 min" in
     * English, "24 Min.", "1 Std. 5 Min." in German. The unit comes from `Intl`,
     * so every language gets its own abbreviation. This is the only way a
     * finished or elapsed workout duration reaches the screen; live timers
     * (the session clock, the rest countdown) stay mm:ss clocks.
     */
    duration: durationText,
    /**
     * The same duration split for a stat: `{ value: "24", unit: "min" }`.
     * From an hour on the whole text is the value, since there is no single unit.
     */
    durationParts: (ms: number): { value: string; unit?: string } => {
      const minutes = minutesIn(ms);
      if (minutes >= 60) return { value: durationText(ms) };
      const unit = minuteUnit
        .formatToParts(minutes)
        .find((part) => part.type === "unit");
      return {
        value: wholeNumber.format(minutes),
        ...(unit ? { unit: unit.value } : {}),
      };
    },
  };
}
