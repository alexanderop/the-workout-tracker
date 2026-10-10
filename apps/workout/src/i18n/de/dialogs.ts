import type { Catalog } from "../index";

export const deDialogs: Catalog["dialogs"] = {
  fields: {
    weightKg: "Gewicht · kg",
    weight: "Gewicht",
    reps: "Wdh.",
    setNumber: "Satz {number}",
  },
  actions: {
    cancel: "Abbrechen",
    keepEditing: "Weiter bearbeiten",
    discardChanges: "Änderungen verwerfen",
    saving: "Speichern…",
  },
  stats: {
    setsLogged: "Sätze erfasst",
    kgVolume: "kg Volumen",
    minutes: "Minuten",
    elapsed: "vergangen",
  },
  confirm: {
    fallbackTitle: "Bestätigen",
  },
  removeSet: {
    title: "Satz entfernen?",
    description:
      "Der Satz und sein Entwurf werden aus deinem aktiven Training entfernt.",
    action: "Satz entfernen",
  },
  notices: {
    correctionsSaved: "Korrekturen am Training gespeichert",
    workoutSaved: "Training gespeichert. Wieder eine Einheit geschafft.",
    templateSaved: "Vorlage gespeichert",
  },
  setOptions: {
    title: "Satz {number} von {exercise}",
    fallbackTitle: "Satz-Optionen",
    description:
      "Passe die Wiederholungen an, mach das Erfassen rückgängig oder entferne diesen Satz.",
    undoLog: "Erfassen rückgängig",
    decreaseReps: "Wiederholungen verringern",
    increaseReps: "Wiederholungen erhöhen",
    reps: "{reps} Wdh.",
    removeSet: "Satz entfernen",
  },
  finish: {
    title: "Training abschließen?",
    description:
      "Nur erfasste Sätze zählen für deinen Fortschritt. Nicht erfasste Sätze bleiben im Trainingsprotokoll.",
    retained:
      "Deine Eingabe ist auf diesem Gerät gespeichert, wurde aber noch nicht auf das Training angewendet. Wende sie vor dem Abschließen an oder prüfe deine Sätze, um sie zu ändern oder zu verwerfen. Das Anwenden von Werten erfasst keine zusätzlichen Sätze.",
    retainedList: "Sätze mit gespeicherter Eingabe",
    retainedItem: "{exercise} · Satz {number}",
    apply: "Eingaben anwenden",
    review: "Meine Sätze prüfen",
    attention:
      "Einige Werte brauchen Aufmerksamkeit. Geh zum markierten Satz zurück, um sie zu prüfen.",
    keepTraining: "Weitermachen",
    save: "Speichern",
  },
  completedDetail: {
    fallbackTitle: "Training",
    setLine: "{weight} kg × {reps} Wdh.",
    logged: "Erfasst",
    notLogged: "Nicht erfasst",
    edit: "Training bearbeiten",
    repeat: "Training wiederholen",
    saveAsTemplate: "Als Vorlage speichern",
  },
  completedEditor: {
    title: "Training bearbeiten",
    description:
      "Korrigiere den Namen und die erfassten Werte des Trainings. Änderungen werden zusammen gespeichert.",
    nameLabel: "Name des Trainings",
    weightLabel: "{exercise} Satz {number} Gewicht",
    repsLabel: "{exercise} Satz {number} Wiederholungen",
    unlogged: "{weight} kg × {reps} Wdh. · Nicht erfasst, schreibgeschützt",
    missing:
      "Dieses Training ist nicht mehr gespeichert. Deine Eingabe ist noch da und kann kopiert werden, das Training lässt sich damit aber nicht neu erstellen.",
    conflict:
      "Die gespeicherten Daten haben sich während der Bearbeitung geändert. Deine Eingabe ist noch da. Lade die gespeicherten Werte neu, bevor du Korrekturen vornimmst.",
    reload: "Gespeicherte Werte neu laden",
    save: "Änderungen speichern",
    discardTitle: "Änderungen am Training verwerfen?",
    discardReloadDescription:
      "Beim Neuladen wird deine Eingabe durch die zuletzt gespeicherten Werte ersetzt.",
    discardLoseDescription: "Deine ungespeicherten Korrekturen gehen verloren.",
    discardAndReload: "Verwerfen und neu laden",
    invalid:
      "Gib einen Trainingsnamen sowie 0–1.000 kg und 0–1.000 ganze Wiederholungen für jeden erfassten Satz ein.",
    saveFailed:
      "Speichern nicht möglich. Deine Eingabe ist noch da. Versuche es erneut.",
  },
  picker: {
    titleStart: "Übungen auswählen",
    titleAdd: "Übungen hinzufügen",
    description: "Wähle die Bewegungen für dieses Training.",
    createOwn: "Eigene erstellen",
    start: "Starten ({count})",
    add: "Hinzufügen ({count})",
    createTitle: "Übung erstellen",
    createDescription:
      "Füge deiner persönlichen Bibliothek eine Bewegung hinzu.",
    nameLabel: "Name der Übung",
    namePlaceholder: "z. B. Seitheben am Kabel",
    muscleGroup: "Muskelgruppe",
    equipment: "Geräte",
    createSubmit: "Übung erstellen",
  },
  templates: {
    title: "Vorlagen",
    editTitle: "Vorlage bearbeiten",
    createTitle: "Vorlage erstellen",
    description: "Richte die Übungen ein, zu denen du zurückkehren möchtest.",
    deleted:
      "Diese Vorlage wurde in einem anderen Tab gelöscht. Deine Eingabe ist noch da, kann aber nicht in der gelöschten Vorlage gespeichert werden.",
    changed:
      "Diese Vorlage wurde in einem anderen Tab geändert. Deine Eingabe ist noch da. Wähle, welche Version du behalten möchtest.",
    useSaved: "Gespeicherte Version nutzen",
    keepMine: "Meine Änderungen behalten",
    newTemplate: "Neue Vorlage",
    emptyTitle: "Deine Abkürzung zur nächsten Einheit",
    emptyDescription:
      "Speichere ein vergangenes Training als Vorlage oder erstelle eine mit deinen Lieblingsübungen.",
    createTemplate: "Vorlage erstellen",
    editAria: "{name} bearbeiten",
    edit: "Bearbeiten",
    defaultDescription: "Ein Plan für deine nächste Einheit.",
    setCount: "{n} Satz | {n} Sätze",
    more: "+ {count} weitere",
    exerciseCount: "{n} Übung | {n} Übungen",
    start: "Starten",
    startAria: "{name} starten",
  },
  routineEditor: {
    nameLabel: "Name der Vorlage",
    namePlaceholder: "z. B. Oberkörper",
    descriptionLabel: "Beschreibung",
    optional: "(optional)",
    descriptionPlaceholder: "Dein Fokus für diese Einheit",
    hint: "Jeder Satz ist bearbeitbar. Entferne Sätze, die du nicht wiederholen möchtest, auch übersprungene.",
    removeExercise: "{exercise} entfernen",
    weightLabel: "{exercise} Satz {number} Gewicht",
    repsLabel: "{exercise} Satz {number} Wiederholungen",
    removeSetAria: "Satz {number} von {exercise} entfernen",
    skipped: "Übersprungen",
    addSet: "Satz hinzufügen",
    closeLibrary: "Übungsbibliothek schließen",
    addExercises: "Übungen hinzufügen",
    addSelected: "{n} Übung hinzufügen | {n} Übungen hinzufügen",
    save: "Vorlage speichern",
    discardTitle: "Änderungen an der Vorlage verwerfen?",
    discardDescription:
      "Deine ungespeicherten Änderungen an der Vorlage gehen verloren.",
    removeExerciseTitle: "Übung entfernen?",
    removeExerciseDescription:
      "Dadurch werden die Übung und alle ihre Sätze aus deinem Vorlagenentwurf entfernt. Speichere die Vorlage, um diese Änderung zu behalten.",
    removeSetDescription:
      "Dadurch wird dieser Satz aus deinem Vorlagenentwurf entfernt. Speichere die Vorlage, um diese Änderung zu behalten.",
    remove: "Entfernen",
    tooMany: "Verwende höchstens 50 Übungen pro Vorlage.",
    invalid:
      "Gib einen Namen und mindestens eine Übung an. Verwende 0–1.000 kg und 1–1.000 ganze Wiederholungen für jeden Satz.",
  },
};
