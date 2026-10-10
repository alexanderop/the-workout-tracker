export const enTrainingSets = {
  setRow: {
    select: "Select set {n} of {exercise}",
    weight: "Weight",
    reps: "Reps",
    kg: "kg",
    weightLabel: "Set {n} weight for {exercise}",
    repsLabel: "Set {n} repetitions for {exercise}",
    saveSet: "Save set {n} of {exercise}",
    loggedSet: "Logged set {n} of {exercise}",
    logSet: "Log set {n} of {exercise}",
    logged: "Logged",
    options: "Options for set {n} of {exercise}",
    conflict:
      "This set changed in another tab or has different recovered drafts. Your input is preserved.",
    savedLogged: "Saved: {weight} kg × {reps} reps · logged.",
    savedNotLogged: "Saved: {weight} kg × {reps} reps · not logged.",
    keepInput: "Keep my input",
    empty: "empty",
    reviewDraft: "Review {weight} kg × {reps} reps",
    useSaved: "Discard drafts and use saved values",
    retainedLogged:
      "Input retained on this device. Save to apply it to this logged set.",
    retainedUnlogged:
      "Input retained on this device. It is not logged. Log when you finish this set.",
  },
  discardInput: {
    title: "Discard input changes?",
    description:
      "This deletes the input drafts for this set and restores its saved values.",
    keepEditing: "Keep editing",
    action: "Discard input",
  },
  setEditor: {
    title: "{exercise} · Set {n}",
    fallbackTitle: "Edit set",
    description:
      "Edit values without logging, or explicitly log this set. Zero reps records a failed attempt.",
    chooseSet: "Choose set to edit",
    setButton: "Set {n}",
    saveValues: "Save values without logging",
    undoLog: "Undo log",
    clearLogged: "Clear logged set",
    discardChanges: "Discard input changes",
    done: "Done",
    clearTitle: "Clear logged set?",
    clearDescription:
      "This removes the logged result and returns the set to unfinished work.",
    cancel: "Cancel",
    clearAction: "Clear set",
  },
} as const;
