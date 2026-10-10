import type { Catalog } from "../index";

export const deTrainingNotices: Pick<Catalog["training"], "notices" | "name"> =
  {
    notices: {
      draftConflict:
        "Dieser Satz wurde in einem anderen Tab geändert oder hat abweichende wiederhergestellte Entwürfe. Prüfe ihn, bevor du erfasst.",
      invalidValues:
        "Gib 0–1000 kg und 0–1000 ganze Wiederholungen ein. Geplante Sätze brauchen mindestens eine Wiederholung.",
      deleted:
        "Die Daten dieses Trainings wurden in einem anderen Tab gelöscht. Lade die Seite neu, bevor du bearbeitest.",
      unsaved:
        "Entwurf nicht auf diesem Gerät gespeichert. Lass diese Seite geöffnet und versuche es erneut.",
      uncleaned:
        "Entwurf gespeichert, aber ältere Eingaben konnten auf diesem Gerät nicht gelöscht werden.",
      recoveryNotCleared:
        "Die Entwurfswiederherstellung konnte nicht gelöscht werden. Lass diese Seite geöffnet und versuche es erneut.",
      removedSetStranded:
        "Gespeichert, aber die Eingabeentwürfe eines entfernten Satzes konnten auf diesem Gerät nicht gelöscht werden. Es wird automatisch erneut versucht.",
      recoveryUnavailable:
        "Die Entwurfswiederherstellung ist nicht verfügbar. Neue Änderungen gehen beim Schließen dieser Seite möglicherweise verloren.",
      checkFailed:
        "Gespeicherte Entwürfe konnten nicht geprüft werden. Versuche es erneut, bevor du speicherst.",
      otherTab:
        "Ein anderer Tab hat Eingabeentwürfe für diesen Satz. Prüfe sie, bevor du speicherst.",
      valuesSaved: "Satzwerte gespeichert. Die Erfassung bleibt unverändert.",
      setLogged: "{exercise} · Satz {n} erfasst.",
      setNotLogged: "Satz als nicht erfasst markiert.",
      reviewBeforeAdding:
        "Prüfe Gewicht und Wiederholungen dieses Satzes, bevor du einen weiteren Satz hinzufügst.",
      saveBeforeUndo:
        "Speichere oder verwirf die Eingabe dieses Satzes, bevor du die Erfassung zurücknimmst.",
      undone:
        "Satz als nicht erfasst markiert. Du kannst ihn erneut erfassen.",
      reviewBeforeCircle:
        "Prüfe die Eingabe dieses Satzes, bevor du die Kreis-Abkürzung nutzt.",
      recorded:
        "{exercise} · Satz {n} aufgezeichnet. Tippe erneut für weniger Wdh.",
      saveBeforeClear:
        "Speichere oder verwirf den Entwurf dieses Satzes, bevor du ihn leerst.",
      returned: "{exercise} ist wieder offen.",
      saveBeforeConfigure:
        "Speichere oder verwirf die Entwürfe dieser Übung, bevor du ihre Einstellungen änderst.",
      noteSaved: "Übungsnotiz gespeichert.",
      exerciseUpdated:
        "Übung aktualisiert. Erfasste Sätze bleiben unverändert.",
      saveBeforeFinish:
        "Speichere oder verwirf deine Eingabeentwürfe, bevor du beendest.",
      draftsNotCleared:
        "Training gespeichert, aber alte Eingabeentwürfe konnten auf diesem Gerät nicht gelöscht werden.",
    },
    name: {
      required: "Gib diesem Training einen Namen.",
      notSaved: "Name nicht gespeichert. Deine Eingabe ist noch da.",
    },
  };
