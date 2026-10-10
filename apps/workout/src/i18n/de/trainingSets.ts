import type { Catalog } from "../index";

type Training = Catalog["training"];

export const deTrainingSets: Pick<
  Training,
  "setRow" | "discardInput" | "setEditor"
> = {
  setRow: {
    select: "Satz {n} von {exercise} auswählen",
    weight: "Gewicht",
    reps: "Wdh.",
    kg: "kg",
    weightLabel: "Satz {n} Gewicht für {exercise}",
    repsLabel: "Satz {n} Wiederholungen für {exercise}",
    saveSet: "Satz {n} von {exercise} speichern",
    loggedSet: "Satz {n} von {exercise} erfasst",
    logSet: "Satz {n} von {exercise} erfassen",
    logged: "Erfasst",
    options: "Optionen für Satz {n} von {exercise}",
    conflict:
      "Dieser Satz wurde in einem anderen Tab geändert oder hat abweichende wiederhergestellte Entwürfe. Deine Eingabe bleibt erhalten.",
    savedLogged: "Gespeichert: {weight} kg × {reps} Wdh. · erfasst.",
    savedNotLogged: "Gespeichert: {weight} kg × {reps} Wdh. · nicht erfasst.",
    keepInput: "Meine Eingabe behalten",
    empty: "leer",
    reviewDraft: "{weight} kg × {reps} Wdh. prüfen",
    useSaved: "Entwürfe verwerfen und gespeicherte Werte nutzen",
    retainedLogged:
      "Eingabe auf diesem Gerät aufbewahrt. Speichere sie, um sie auf diesen erfassten Satz anzuwenden.",
    retainedUnlogged:
      "Eingabe auf diesem Gerät aufbewahrt. Sie ist nicht erfasst. Erfasse den Satz, wenn du ihn beendest.",
  },
  discardInput: {
    title: "Eingabeänderungen verwerfen?",
    description:
      "Das löscht die Eingabeentwürfe für diesen Satz und stellt die gespeicherten Werte wieder her.",
    keepEditing: "Weiter bearbeiten",
    action: "Eingabe verwerfen",
  },
  setEditor: {
    title: "{exercise} · Satz {n}",
    fallbackTitle: "Satz bearbeiten",
    description:
      "Bearbeite Werte, ohne zu erfassen, oder erfasse diesen Satz ausdrücklich. Null Wiederholungen zählen als gescheiterter Versuch.",
    chooseSet: "Zu bearbeitenden Satz wählen",
    setButton: "Satz {n}",
    saveValues: "Werte speichern, ohne zu erfassen",
    undoLog: "Erfassung zurücknehmen",
    clearLogged: "Erfassten Satz leeren",
    discardChanges: "Eingabeänderungen verwerfen",
    done: "Fertig",
    clearTitle: "Erfassten Satz leeren?",
    clearDescription:
      "Das entfernt das erfasste Ergebnis und setzt den Satz auf offen zurück.",
    cancel: "Abbrechen",
    clearAction: "Satz leeren",
  },
};
