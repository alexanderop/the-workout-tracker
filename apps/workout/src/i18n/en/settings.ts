export const enSettings = {
  title: "Settings",
  back: "Settings",
  sections: {
    training: "Training preferences",
    appearance: "Appearance",
    language: "Language",
    install: "Install app",
    export: "Export backup",
    import: "Import backup",
    delete: "Delete all data",
  },
  groups: { device: "This device", data: "Your data" },
  hub: {
    restOn: "Auto rest · {seconds} sec",
    restOff: "Auto rest off",
    offlineReady: "Offline ready",
    offlinePending: "Preparing",
    privacy: "Your workouts stay on this device. No account, no cloud sync.",
  },
  appearance: { summary: "{theme} · {accent}" },
  training: {
    autoRest: {
      label: "Automatic rest timer",
      hint: "Start counting down after a logged set.",
    },
    restDuration: {
      label: "Rest between sets",
      hint: "Choose the pace that suits your session.",
      ariaLabel: "Rest duration",
      option: "{seconds} sec",
    },
    weightUnit: { label: "Weight unit", value: "Kilograms · kg" },
  },
  backup: {
    intro:
      "Workouts live in this browser. Export a backup to keep them safe or move them to another device.",
    importIntro:
      "Restore workouts from a backup you exported earlier. The file is read on this device and never uploaded.",
    export: "Export backup",
    import: "Import backup",
    fileLabel: "Choose backup file",
    previewHint:
      "An empty journal with default settings and exercises restores your backup. Otherwise, import adds missing records and rejects conflicts. Your current settings stay unchanged.",
    cancelImport: "Cancel import",
    importThis: "Import this backup",
    importing: "Importing…",
    downloaded: "Backup downloaded.",
    exportFailed: "Could not export your backup. Try again.",
    tooLarge: "Choose a backup smaller than 20 MB.",
    unreadableFile: "Could not read that file.",
    imported: "Backup imported. Your existing workouts are preserved.",
    changed:
      "Your data changed. Select the backup again to review the current import.",
    importFailed:
      "Import could not finish. Reload to check your saved workouts before trying again.",
  },
  deleteData: {
    intro:
      "Permanently delete your workouts, templates, custom exercises and preferences from this browser. Export a backup first if you want to keep a copy.",
    button: "Delete all data",
    deleting: "Deleting…",
    cancel: "Cancel",
    done: "All your data has been deleted from this browser.",
    conflict:
      "Your data changed in another tab. Close this dialog and review the deletion again.",
    failed: "Deletion could not finish. Try again.",
    sheetTitle: "Delete all your data?",
    sheetDescription:
      "This permanently deletes your workout history, active workout, input drafts, templates and custom exercises from this browser, and resets your preferences. This cannot be undone. Downloaded backups stay on your device.",
  },
  signoff: {
    brand: "The Workout Tracker",
    tagline: "A quieter space to get stronger.",
  },
} as const;
