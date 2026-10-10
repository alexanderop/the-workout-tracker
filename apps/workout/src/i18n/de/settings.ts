import type { Catalog } from "../index";

export const deSettings: Catalog["settings"] = {
  title: "Einstellungen",
  back: "Einstellungen",
  sections: {
    training: "Trainingseinstellungen",
    appearance: "Darstellung",
    language: "Sprache",
    install: "App installieren",
    export: "Backup exportieren",
    import: "Backup importieren",
    delete: "Alle Daten löschen",
  },
  groups: { device: "Dieses Gerät", data: "Deine Daten" },
  hub: {
    restOn: "Pause {seconds} Sek.",
    restOff: "Pause aus",
    offlineReady: "Offline bereit",
    offlinePending: "Vorbereitung",
    privacy:
      "Deine Trainings bleiben auf diesem Gerät. Kein Konto, keine Cloud-Synchronisierung.",
  },
  appearance: { summary: "{theme} · {accent}" },
  training: {
    autoRest: {
      label: "Automatischer Pausentimer",
      hint: "Starte den Countdown nach einem erfassten Satz.",
    },
    restDuration: {
      label: "Pause zwischen den Sätzen",
      hint: "Wähle das Tempo, das zu deinem Training passt.",
      ariaLabel: "Pausendauer",
      option: "{seconds} Sek.",
    },
    weightUnit: { label: "Gewichtseinheit", value: "Kilogramm · kg" },
  },
  backup: {
    intro:
      "Deine Trainings liegen in diesem Browser. Exportiere ein Backup, um sie zu sichern oder auf ein anderes Gerät zu übertragen.",
    importIntro:
      "Stelle Trainings aus einem Backup wieder her, das du zuvor exportiert hast. Die Datei wird auf diesem Gerät gelesen und nie hochgeladen.",
    export: "Backup exportieren",
    import: "Backup importieren",
    fileLabel: "Backup-Datei wählen",
    previewHint:
      "Ein leeres Journal mit Standardeinstellungen und -übungen wird durch dein Backup wiederhergestellt. Andernfalls ergänzt der Import fehlende Einträge und lehnt Konflikte ab. Deine aktuellen Einstellungen bleiben unverändert.",
    cancelImport: "Import abbrechen",
    importThis: "Dieses Backup importieren",
    importing: "Importiere…",
    downloaded: "Backup heruntergeladen.",
    exportFailed:
      "Dein Backup konnte nicht exportiert werden. Versuche es erneut.",
    tooLarge: "Wähle ein Backup, das kleiner als 20 MB ist.",
    unreadableFile: "Diese Datei konnte nicht gelesen werden.",
    imported:
      "Backup importiert. Deine vorhandenen Trainings bleiben erhalten.",
    changed:
      "Deine Daten haben sich geändert. Wähle das Backup erneut, um den aktuellen Import zu prüfen.",
    importFailed:
      "Der Import konnte nicht abgeschlossen werden. Lade neu und prüfe deine gespeicherten Trainings, bevor du es erneut versuchst.",
  },
  deleteData: {
    intro:
      "Lösche deine Trainings, Vorlagen, eigenen Übungen und Einstellungen dauerhaft aus diesem Browser. Exportiere vorher ein Backup, wenn du eine Kopie behalten willst.",
    button: "Alle Daten löschen",
    deleting: "Lösche…",
    cancel: "Abbrechen",
    done: "Alle deine Daten wurden aus diesem Browser gelöscht.",
    conflict:
      "Deine Daten wurden in einem anderen Tab geändert. Schließe diesen Dialog und prüfe das Löschen erneut.",
    failed:
      "Das Löschen konnte nicht abgeschlossen werden. Versuche es erneut.",
    sheetTitle: "Alle deine Daten löschen?",
    sheetDescription:
      "Dadurch werden dein Trainingsverlauf, das aktive Training, Eingabeentwürfe, Vorlagen und eigene Übungen dauerhaft aus diesem Browser gelöscht und deine Einstellungen zurückgesetzt. Das kann nicht rückgängig gemacht werden. Heruntergeladene Backups bleiben auf deinem Gerät.",
  },
  signoff: {
    brand: "The Workout Tracker",
    tagline: "Ein ruhigerer Ort, um stärker zu werden.",
  },
};
