import { computed, reactive } from "vue";
import type { DraftJournal } from "../application";
import type { Snapshot, WorkoutSet } from "../domain";
import {
  parseSetValues,
  type RawValues,
  type SetDraft,
} from "../domain/drafts";

/** Input for a set of a workout that was finished before the input was saved. */
export type DetachedDraft = RawValues & {
  readonly key: string;
  readonly sessionId: string;
  readonly setId: string;
  readonly exerciseName: string;
  readonly index: number;
  readonly records: readonly SetDraft[];
};

function finishedSet(snapshot: Snapshot, sessionId: string, setId: string) {
  for (const exercise of snapshot.completed[sessionId]?.exercises ?? [])
    for (const [index, set] of exercise.sets.entries())
      if (set.id === setId) return { exercise, index, set };
  return null;
}
function matchesSaved(values: RawValues, set: WorkoutSet) {
  const parsed = parseSetValues(values);
  return parsed?.weightKg === set.weightKg && parsed.reps === set.reps;
}
function groupBySet(records: readonly SetDraft[]) {
  const groups = new Map<string, SetDraft[]>();
  for (const record of records) {
    const key = JSON.stringify([record.sessionId, record.setId]);
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return groups;
}
/** Records of both lists, each draft once. */
export function unionDrafts(
  first: readonly SetDraft[],
  second: readonly SetDraft[],
) {
  const known = new Set(first.map((record) => record.id));
  return [...first, ...second.filter((record) => !known.has(record.id))];
}

/**
 * Keeps input that a finish overtook, for example a draft another tab wrote
 * while the finish was committing. The journal retains these drafts until the
 * user dismisses them, so they also survive a reload.
 */
export function useDetachedDrafts(journal: DraftJournal) {
  const detached = reactive(new Map<string, DetachedDraft>());
  /** Keeps input for a finished workout's set; false when there is no such set. */
  function detach(
    snapshot: Snapshot,
    sessionId: string,
    setId: string,
    values: RawValues,
    records: readonly SetDraft[],
  ): boolean {
    const located = finishedSet(snapshot, sessionId, setId);
    if (!located) return false;
    const key = JSON.stringify([sessionId, setId]);
    const existing = detached.get(key);
    detached.set(key, {
      key,
      sessionId,
      setId,
      exerciseName: located.exercise.name,
      index: located.index,
      weight: existing?.weight ?? values.weight,
      reps: existing?.reps ?? values.reps,
      records: unionDrafts(existing?.records ?? [], records),
    });
    return true;
  }
  /**
   * Detaches finished-workout drafts that differ from the saved set. Drafts
   * whose input already reached the finished workout are acknowledged.
   */
  function detachRecords(snapshot: Snapshot, records: readonly SetDraft[]) {
    for (const [key, group] of groupBySet(records)) {
      const [first] = group;
      const located =
        first && finishedSet(snapshot, first.sessionId, first.setId);
      if (!first || !located) continue;
      const differing = group.find(
        (record) => !matchesSaved(record, located.set),
      );
      if (differing || detached.has(key)) {
        detach(
          snapshot,
          first.sessionId,
          first.setId,
          differing ?? first,
          group,
        );
        continue;
      }
      try {
        journal.consume(group);
      } catch {
        // Matching input is harmless; the next prune offers it again.
      }
    }
  }
  /** Acknowledges every detached draft. False when the journal refused. */
  function dismiss(): boolean {
    try {
      journal.consume([...detached.values()].flatMap((entry) => entry.records));
    } catch {
      return false;
    }
    detached.clear();
    return true;
  }
  return {
    entries: computed(() => [...detached.values()]),
    detach,
    detachRecords,
    dismiss,
  };
}
