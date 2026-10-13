import type { Translate } from "../../../i18n";
import type { CompletedSession } from "../domain";
import { categoryLabel } from "./exerciseLabels";

/**
 * Forgiving text search shared by the exercise catalog and workout history.
 *
 * Every word of the query must appear in at least one field, in any order.
 * Case, diacritics, spaces and punctuation inside words are ignored, so
 * "pullup", "pull up" and "Pull-up" find each other, and "e-gym" finds EGYM.
 * A trailing plural ("squats", "presses", "flies") also finds the singular.
 */
export function matchesSearch(
  query: string,
  fields: readonly string[],
): boolean {
  const words = query.split(/\s+/).map(compact).filter(Boolean);
  if (!words.length) return true;
  const haystacks = fields.map(compact);
  return words.every((word) =>
    variants(word).some((variant) =>
      haystacks.some((field) => field.includes(variant)),
    ),
  );
}

function compact(text: string): string {
  return text
    .normalize("NFKD")
    .replaceAll(/\p{M}/gu, "")
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}]/gu, "");
}

function variants(word: string): string[] {
  const forms = [word];
  if (word.length > 4 && word.endsWith("ies"))
    forms.push(`${word.slice(0, -3)}y`);
  if (word.length > 4 && word.endsWith("es")) forms.push(word.slice(0, -2));
  if (word.length > 3 && word.endsWith("s")) forms.push(word.slice(0, -1));
  return forms;
}

/** Past workouts whose name, exercises or muscle groups match the query. */
export function filterHistory(
  sessions: readonly CompletedSession[],
  query: string,
  t: Translate,
): CompletedSession[] {
  return sessions.filter((session) =>
    matchesSearch(query, [
      session.name,
      ...session.exercises.flatMap((exercise) => [
        exercise.name,
        exercise.category,
        categoryLabel(exercise.category, t),
      ]),
    ]),
  );
}
