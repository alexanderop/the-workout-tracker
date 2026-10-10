import type { Catalog } from "../index";

export const deTrainingConfig: Catalog["training"]["config"] = {
  fallbackExercise: "Übung",
  configureTitle: "{exercise} einstellen",
  noteTitle: "Notiz zu {exercise}",
  replaceTitle: "{exercise} ersetzen",
  setCount: "{n} Satz | {n} Sätze",
  mixedReps: "Gemischte Wdh.",
  reps: "{reps} Wdh.",
  mixedKg: "Gemischte kg",
  kg: "{weight} kg",
  editSets: "Sätze bearbeiten",
  editNote: "Notiz bearbeiten",
  addNote: "Notiz hinzufügen",
  replaceExercise: "Übung ersetzen",
  removeExercise: "Übung entfernen",
  addExercises: "Übungen hinzufügen",
  numberOfSets: "Anzahl der Sätze",
  replaceTargets: "Gewicht und Wdh. für alle offenen Sätze festlegen",
  targetReps: "Ziel-Wdh.",
  workingWeight: "Arbeitsgewicht",
  help: "Erfasste Sätze bleiben unverändert. Wenn du nur die Anzahl änderst, bleiben unterschiedliche Ziele erhalten. Neue Sätze übernehmen Wdh. und Gewicht des letzten Satzes. Das Gewicht schließt die Stange ein.",
  saveSettings: "Übungseinstellungen speichern",
  workoutNote: "Notiz zum Training",
  noteCounter: "{length} / 2000 · Wird nur mit diesem Training gespeichert.",
  saveNote: "Notiz speichern",
  allLogged:
    "Alle Sätze sind erfasst. Füge eine weitere Übung hinzu, um weiterzutrainieren.",
  fullWorkout:
    "Dieses Training hat 50 Übungen. Entferne eine Übung, bevor du die offenen Sätze ersetzt.",
  moves:
    "{n} offener Satz wechselt zu {replacement} mit geplanten Wdh. und 0 kg. | {n} offene Sätze wechseln zu {replacement} mit geplanten Wdh. und 0 kg.",
  stays:
    "{n} erfasster Satz bleibt bei {exercise}. | {n} erfasste Sätze bleiben bei {exercise}.",
  noteNotCopied: "Die Notiz wird nicht auf die neue Übung übertragen.",
  replaceRemaining: "Offene Sätze ersetzen",
  saveFailed: "Speichern fehlgeschlagen. Deine Eingabe ist noch da.",
  reload: "Gespeicherte Werte neu laden",
  cancel: "Abbrechen",
  discardTitle: "Ungespeicherte Änderungen verwerfen?",
  discardDescription:
    "Das löscht deine ungespeicherte Notiz oder Einstellungsänderungen. Gespeicherte Trainingswerte bleiben unverändert.",
  keepEditing: "Weiter bearbeiten",
  discardAction: "Änderungen verwerfen",
  removeSetsTitle: "Offene Sätze entfernen?",
  removeSetsDescription:
    "Wenn du die Anzahl der Sätze verringerst, werden offene Sätze und ihre Zielwerte entfernt. Erfasste Sätze bleiben in deinem Training.",
  removeSets: "Sätze entfernen",
};
