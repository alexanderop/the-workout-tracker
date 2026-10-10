export const enTrainingNotices = {
  notices: {
    draftConflict:
      "This set changed in another tab or has different recovered drafts. Review it before logging.",
    invalidValues:
      "Enter 0–1000 kg and 0–1000 whole repetitions. Planned sets need at least one rep.",
    deleted:
      "This workout's data was deleted in another tab. Reload before editing.",
    unsaved:
      "Draft not saved on this device. Keep this page open and try again.",
    uncleaned:
      "Draft saved, but older input could not be cleared on this device.",
    recoveryNotCleared:
      "Draft recovery could not be cleared. Keep this page open and try again.",
    removedSetStranded:
      "Saved, but input drafts of a removed set could not be cleared on this device. They are retried automatically.",
    recoveryUnavailable:
      "Draft recovery is unavailable. New edits may not survive closing this page.",
    checkFailed: "Could not check saved drafts. Try again before saving.",
    otherTab:
      "Another tab has input drafts for this set. Review them before saving.",
    valuesSaved: "Set values saved. Logging is unchanged.",
    setLogged: "{exercise} · set {n} logged.",
    setNotLogged: "Set marked as not logged.",
    reviewBeforeAdding:
      "Review this set's weight and repetitions before adding another set.",
    saveBeforeUndo: "Save or discard this set’s input before undoing its log.",
    undone: "Set marked as not logged. You can log it again.",
    reviewBeforeCircle:
      "Review this set's input before using the circle shortcut.",
    recorded: "{exercise} · set {n} recorded. Tap again for fewer reps.",
    saveBeforeClear: "Save or discard this set's draft before clearing it.",
    returned: "{exercise} returned to unfinished work.",
    saveBeforeConfigure:
      "Save or discard this exercise's drafts before changing its configuration.",
    noteSaved: "Exercise note saved.",
    exerciseUpdated: "Exercise updated. Logged sets are unchanged.",
    saveBeforeFinish: "Save or discard your input drafts before finishing.",
    draftsNotCleared:
      "Workout saved, but old input drafts could not be cleared on this device.",
  },
  name: {
    required: "Give this workout a name.",
    notSaved: "Name not saved. Your input is still here.",
  },
} as const;
