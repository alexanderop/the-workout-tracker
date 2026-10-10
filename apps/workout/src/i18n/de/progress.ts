import type { Catalog } from "../index";

export const deProgress: Catalog["progress"] = {
  title: "Fortschritt",
  range: "Gesamt",
  metrics: {
    completedWorkouts: "Abgeschlossene Trainings",
    sessions: "Training | Trainings",
    totalVolume: "Gesamtvolumen",
    kilograms: "kg",
    completedSets: "Abgeschlossene Sätze",
    sets: "Satz | Sätze",
  },
  empty: {
    title: "Noch kein Fortschritt",
    body: "Schließe ein Training ab, um deinen Fortschritt zu verfolgen.",
    start: "Training starten",
  },
  noSuccessfulSets: {
    title: "Noch keine erfolgreichen Sätze",
    body: "Erfasse einen Satz mit mindestens einer Wiederholung, um deinen Gewichtsverlauf und deine Bestleistungen zu sehen.",
  },
  chart: {
    title: "Gewicht im Zeitverlauf",
    subtitle: "Schwerster erfolgreicher Satz pro Training · kg",
    exerciseLabel: "Übungsfortschritt",
    startingPoint: "Dein Startpunkt · {date}",
    logAgain:
      "Erfasse diese Übung in einem weiteren Training, um deinen Verlauf zu sehen.",
    description:
      "Höchste Gewichte über {n} erfasstes Training. Werte unten aufgelistet. | Höchste Gewichte über {n} erfasste Trainings. Werte unten aufgelistet.",
  },
  bests: {
    title: "Bestleistungen",
    subtitle: "Schwerste erfolgreiche Sätze",
    repsAtWeight: "{n} Wdh. mit diesem Gewicht | {n} Wdh. mit diesem Gewicht",
  },
};
