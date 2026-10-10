import type { Locale } from "./index";

/**
 * Locale-aware numbers and dates. Dates are timestamps in milliseconds and
 * render in the viewer's time zone, like the calendar days they belong to.
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
  };
}
