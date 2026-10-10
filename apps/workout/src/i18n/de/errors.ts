import type { Catalog } from "../index";

export const deErrors: Catalog["errors"] = {
  rejections: {
    invalidValues: "Bitte prüfe die eingegebenen Werte.",
    invalidWorkoutChange: "Ungültige Änderung am Training.",
    invalidWorkoutData: "Ungültige Trainingsdaten.",
    invalidWorkoutCommand: "Ungültiger Trainingsbefehl.",
    changeFailedUnexpectedly:
      "Die Änderung ist unerwartet fehlgeschlagen. Es wurde nichts gespeichert.",
    revisionMustAdvanceByOne:
      "Trainingsrevisionen müssen jeweils um eins steigen.",
    changedDataMustAdvance:
      "Geänderte Trainingsdaten müssen ihre Revision erhöhen.",
    noLongerActive: "Dieses Training ist nicht mehr aktiv.",
    finishCurrentFirst: "Schließe zuerst dein aktuelles Training ab.",
    finishNeedsLoggedSet:
      "Erfasse mindestens einen Satz, bevor du das Training abschließt.",
    completedNotFound: "Dieses abgeschlossene Training wurde nicht gefunden.",
    setNotInCompleted:
      "Dieser Satz wurde im abgeschlossenen Training nicht gefunden.",
    onlyLoggedCorrectable: "Nur erfasste Sätze können korrigiert werden.",
    setCorrectedOnce: "Ein Satz kann nur einmal korrigiert werden.",
    workoutNotFound: "Training wurde nicht gefunden.",
    workoutIdExists: "Diese Trainings-ID existiert bereits.",
    routineNotFound: "Vorlage wurde nicht gefunden.",
    exerciseNotFound: "Übung wurde nicht gefunden.",
    workoutExerciseNotFound: "Trainingsübung wurde nicht gefunden.",
    tooManyExercises: "Ein Training kann bis zu 50 Übungen enthalten.",
    needsOneExercise:
      "Ein Training braucht mindestens eine Übung. Verwirf stattdessen das Training.",
    chooseDifferentExercise: "Wähle eine andere Übung.",
    allSetsLogged:
      "Alle Sätze sind erfasst. Füge stattdessen eine weitere Übung hinzu.",
    setCountRemovesLogged:
      "Die Satzanzahl darf keine erfassten Sätze entfernen. Setze einen Satz zuerst ausdrücklich zurück.",
    exerciseHasNoSets: "Die Übung hat keine Sätze.",
    setNotFound: "Satz wurde nicht gefunden.",
    keepOneSet: "Behalte mindestens einen Satz pro Übung.",
    plannedSetNeedsReps:
      "Geplante Sätze brauchen mindestens eine Ziel-Wiederholung.",
  },
  failures: {
    conflict:
      "Dieses Training wurde in einem anderen Tab geändert. Dein Entwurf bleibt sichtbar. Lade neu, um die zuletzt gespeicherten Werte zu verwenden.",
    storageUnavailable:
      "Dein Browser konnte nicht auf den Trainingsspeicher zugreifen. Öffne die App erneut.",
    storageClosed: "Der Trainingsspeicher ist geschlossen.",
    saveUnconfirmed:
      "Dein Browser konnte nicht bestätigen, ob die Änderung gespeichert wurde. Lade neu, bevor du es erneut versuchst.",
    recoveryRequired:
      "Die gespeicherten Daten müssen wiederhergestellt werden. Exportiere sie, bevor du Änderungen machst.",
    invalidRevision: "Ungültige Trainingsrevision.",
    draftCleanupPending:
      "Deine Trainings und Einstellungen wurden gelöscht, aber die Eingabeentwürfe konnten nicht entfernt werden. Versuche es erneut, um das Löschen abzuschließen.",
    backupTooLarge: "Das Backup ist zu groß. Das Limit liegt bei 20 MB.",
    backupUnreadable: "Diese Datei ist kein gültiges JSON.",
    invalidBackup: "Das ist kein gültiges Trainings-Backup.",
    conflictingRecord:
      "Das Backup enthält einen widersprüchlichen Eintrag ({recordId}). Es wurden keine Daten importiert.",
    activeWorkoutInProgress:
      "Schließe dein aktuelles Training ab, bevor du ein weiteres aktives Training importierst.",
    activeWorkoutFinished:
      "Das Backup widerspricht einem aktiven Training. Es wurden keine Daten importiert.",
    storedDataUnreadable:
      "Die gespeicherten Trainingsdaten konnten nicht gelesen werden. Exportiere eine Wiederherstellungskopie, bevor du den Browserspeicher änderst.",
    saveFailed:
      "Speichern fehlgeschlagen. Dein zuletzt gespeichertes Training ist sicher. Versuche es erneut.",
    savedOnDevice: "Auf diesem Gerät gespeichert",
    finishNeedsNameSaved:
      "Speichere oder verwirf deine Namensänderung, bevor du das Training abschließt.",
    detachedDraft:
      "Eingaben, die gemacht wurden, als das Training abgeschlossen wurde, wurden nicht gespeichert: {sets}. Bearbeite das abgeschlossene Training, um sie zu behalten.",
    detachedDraftSet: "{exercise} Satz {index}: {weight} kg × {reps}",
  },
};
