import type { Catalog } from "../index";

type Training = Catalog["training"];

export const deTrainingPage: Pick<
  Training,
  | "page"
  | "removeExercise"
  | "discardWorkout"
  | "rest"
  | "rename"
  | "dock"
  | "detached"
  | "recovery"
> = {
  page: {
    backLabel: "Zurück zu den Trainings",
    backShort: "Trainings",
    eyebrow: "AKTIVES TRAINING · {elapsed}",
    renameWorkout: "Training umbenennen",
    finish: "Beenden",
    exerciseCount: "{n} Übung | {n} Übungen",
    setsLogged: "{logged} / {total} Sätze erfasst",
    lifted: "{volume} kg bewegt",
    loggedSetsProgress: "Erfasste Sätze",
    exercisesNav: "Übungen im Training",
    tabAllLogged: "{exercise}, alle Sätze erfasst",
    addExercises: "Übungen hinzufügen",
    addShort: "Neu",
    emptyTitle: "Mach es zu deinem Training.",
    emptyText:
      "Füge eine Übung hinzu und wähle dann Sätze, Wiederholungen und Gewicht.",
    optionsFor: "Optionen für {exercise}",
    prescriptionTarget: "{sets} × {n} Wdh. | {sets} × {n} Wdh.",
    prescriptionVaried: "{sets} Sätze · unterschiedliche Wdh.",
    editPrescription:
      ", Sätze, Wiederholungen und Gewicht für {exercise} bearbeiten",
    columnSet: "Satz",
    columnKg: "kg",
    columnReps: "Wdh.",
    columnLog: "Fertig",
    addSet: "Satz hinzufügen",
    lastTime: "Letztes Mal",
    lastTimeSet: "Satz {n}",
    lastTimeResult: "{weight} kg × {reps} Wdh.",
    setLogged: "Satz erfasst | Alle {n} Sätze erfasst",
    allLoggedEyebrow: "ALLE SÄTZE ERFASST",
    allLoggedTitle: "Das war dein letzter Satz.",
    allLoggedText: "Sieh dir deine Sätze an oder füge eine weitere Übung hinzu.",
    finishWorkout: "Training abschließen",
    discardWorkout: "Training verwerfen",
    readyTitle: "Bereit für dein nächstes Training?",
    chooseWorkout: "Training wählen",
    exerciseGone: "Diese Übung ist nicht mehr im Training.",
  },
  removeExercise: {
    title: "Übung entfernen?",
    description:
      "{exercise} entfernen, einschließlich {logged} erfasster Sätze und aller ungespeicherten Eingaben für diese Übung? Abgeschlossene Trainings bleiben unverändert.",
    action: "Übung entfernen",
  },
  discardWorkout: {
    title: "Dieses Training verwerfen?",
    description:
      "Das löscht das aktive Training und seine erfassten Sätze. Abgeschlossene Trainings bleiben gespeichert.",
    action: "Training verwerfen",
  },
  rest: {
    remaining: "{time} Pause",
    complete: "Pause vorbei",
    nextSet: "Als Nächstes: {exercise} · Satz {set} von {total}",
    allSetsLogged: "Alle Sätze erfasst",
    ready: "Bereit, wenn du es bist",
    autoOn: "Deine eingestellte Pause startet nach dem Erfassen.",
    autoOff: "Die automatische Pause ist ausgeschaltet.",
    skipRest: "Pause überspringen",
    dismissTimer: "Timer ausblenden",
    saving: "Speichern …",
    saved: "Auf diesem Gerät gespeichert",
  },
  rename: {
    title: "Training umbenennen",
    label: "Name des Trainings",
    conflict:
      "Der gespeicherte Trainingsname hat sich geändert. Behalte deinen Namen oder nutze „{name}“.",
    keepMine: "Meinen Namen behalten",
    useSaved: "Gespeicherten Namen nutzen",
    save: "Namen speichern",
    cancel: "Namensänderung abbrechen",
    saveBeforeFinish:
      "Speichere oder verwirf deine Namensänderung, bevor du das Training beendest.",
    discardTitle: "Ungespeicherten Namen verwerfen?",
    discardDescription: "Der gespeicherte Trainingsname bleibt unverändert.",
    keepEditing: "Weiter bearbeiten",
    discardAction: "Namensänderung verwerfen",
  },
  dock: {
    label: "Trainingssteuerung",
    skip: "Überspringen",
    dismiss: "Ausblenden",
    next: "Als Nächstes: {exercise}",
    setOf: "Satz {set} von {total}",
    allLogged: "Alle Sätze erfasst",
    reviewOrFinish: "Sieh dir dein Training an oder schließe es ab",
    finish: "Beenden",
    chooseFirst: "Wähle deine erste Übung",
    addExercise: "Übung hinzufügen",
  },
  detached: {
    label: "Eingaben, die nicht im beendeten Training gespeichert wurden",
    intro:
      "Eingaben, die gemacht wurden, als dieses Training bereits beendet war, wurden nicht gespeichert.",
    entry: "{exercise}, Satz {set}: {weight} kg × {reps}",
    hint: "Bearbeite das beendete Training im Verlauf, um diese Werte zu behalten.",
    cannotClear:
      "Diese Eingabe konnte auf diesem Gerät nicht gelöscht werden. Versuche es erneut.",
    dismiss: "Ungespeicherte Eingaben ausblenden",
  },
  recovery: {
    label: "Ungespeicherte Trainingsnamen",
    stillHere: "Dein ungespeicherter Trainingsname ist noch da.",
    review: "Ungespeicherte Namen prüfen",
    title: "Ungespeicherte Trainingsnamen",
    description:
      "Diese Trainings sind nicht mehr aktiv. Deine Namensänderungen wurden in diesem Tab aufbewahrt.",
    yourName: "Dein ungespeicherter Name",
    missing:
      "Dieses Training ist nicht mehr verfügbar. Kopiere deinen Namen, bevor du ihn verwirfst.",
    conflict:
      "Der gespeicherte Name hat sich zu „{savedName}“ geändert. Entscheide, ob du ihn ersetzen willst.",
    ready: "Speichere diesen Namen im abgeschlossenen Training.",
    keepMine: "Meinen Namen behalten",
    save: "Namen speichern",
    discard: "Namen verwerfen",
  },
};
