// `rejections` mirrors the domain's `rejections` table key for key (English
// fallback text there); test/unit/error-messages.test.ts keeps them in step.
export const enErrors = {
  rejections: {
    invalidValues: "Please check the entered values.",
    invalidWorkoutChange: "Invalid workout change.",
    invalidWorkoutData: "Invalid workout data.",
    invalidWorkoutCommand: "Invalid workout command.",
    changeFailedUnexpectedly:
      "This change failed unexpectedly. Nothing was saved.",
    revisionMustAdvanceByOne: "Workout revisions must advance by one.",
    changedDataMustAdvance: "Changed workout data must advance its revision.",
    noLongerActive: "This workout is no longer active.",
    finishCurrentFirst: "Finish your current workout first.",
    finishNeedsLoggedSet: "Complete at least one set before finishing.",
    completedNotFound: "This completed workout was not found.",
    setNotInCompleted: "This set was not found in the completed workout.",
    onlyLoggedCorrectable: "Only logged sets can be corrected.",
    setCorrectedOnce: "A set can only be corrected once.",
    workoutNotFound: "Workout was not found.",
    workoutIdExists: "Workout ID already exists.",
    routineNotFound: "Routine was not found.",
    exerciseNotFound: "Exercise was not found.",
    workoutExerciseNotFound: "Workout exercise was not found.",
    tooManyExercises: "A workout can contain up to 50 exercises.",
    needsOneExercise:
      "A workout needs at least one exercise. Discard the workout instead.",
    chooseDifferentExercise: "Choose a different exercise.",
    allSetsLogged: "All sets are logged. Add another exercise instead.",
    setCountRemovesLogged:
      "The set count cannot remove logged work. Clear a set explicitly first.",
    exerciseHasNoSets: "Exercise has no sets.",
    setNotFound: "Set was not found.",
    keepOneSet: "Keep at least one set per exercise.",
    plannedSetNeedsReps: "Planned sets need at least one target repetition.",
  },
  failures: {
    conflict:
      "This workout changed in another tab. Your draft is still visible. Reload to use the latest saved values.",
    storageUnavailable:
      "Your browser could not access workout storage. Try reopening this app.",
    storageClosed: "Workout storage is closed.",
    saveUnconfirmed:
      "Your browser could not confirm whether this change was saved. Reload before trying again.",
    recoveryRequired:
      "Stored data needs recovery. Export it before making changes.",
    invalidRevision: "Invalid workout revision.",
    draftCleanupPending:
      "Your workouts and preferences were deleted, but input drafts could not be cleared. Retry to finish deleting your data.",
    backupTooLarge: "Backup is too large. The limit is 20 MB.",
    backupUnreadable: "This file is not valid JSON.",
    invalidBackup: "This is not a valid workout backup.",
    conflictingRecord:
      "Backup contains a conflicting record ({recordId}). No data was imported.",
    activeWorkoutInProgress:
      "Finish your current workout before importing another active workout.",
    activeWorkoutFinished:
      "Backup conflicts with an active workout. No data was imported.",
    storedDataUnreadable:
      "Stored workout data could not be read. Export a recovery copy before changing browser storage.",
    saveFailed:
      "Could not save. Your previous saved workout is safe. Try again.",
    savedOnDevice: "Saved on this device",
    finishNeedsNameSaved: "Save or cancel your name change before finishing.",
    detachedDraft:
      "Input entered while this workout was finished was not saved: {sets}. Edit the finished workout to keep it.",
    detachedDraftSet: "{exercise} set {index}: {weight} kg × {reps}",
  },
} as const;
