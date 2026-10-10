import type { Catalog } from "../index";

export const deWorkouts: Catalog["workouts"] = {
  home: {
    title: "Training",
    inProgress: "LÄUFT GERADE",
    activeSummary: "{exercises} · {sets}",
    exerciseCount: "{n} Übung | {n} Übungen",
    setsLogged: "{n} Satz erfasst | {n} Sätze erfasst",
    continueWorkout: "Training fortsetzen",
    firstHint: "Wähle eine Übung und erfasse deinen ersten Satz.",
    startFirst: "Erstes Training starten",
    defaultName: "Neues Training",
    start: "Training starten",
    latest: "Letztes Training",
    viewHistory: "Verlauf ansehen",
    latestEmpty: "Deine abgeschlossenen Trainings erscheinen hier.",
    templates: "Vorlagen",
  },
  history: {
    back: "Zurück zum Training",
    title: "Verlauf",
    searchLabel: "Trainingsverlauf durchsuchen",
    searchPlaceholder: "Vergangenes Training finden",
    empty:
      "Deine abgeschlossenen Trainings erscheinen hier und lassen sich wiederholen.",
    noMatches: "Kein Training passt zu deiner Suche.",
  },
  metrics: {
    minutes: "Min.",
    sets: "Satz | Sätze",
    kilograms: "kg",
  },
  calendar: {
    rhythm: "Trainingsrhythmus",
    open: "Trainingskalender öffnen",
    pastDays: "Letzte 7 Tage",
    sheetTitle: "Trainingskalender",
    previousMonth: "Voriger Monat",
    nextMonth: "Nächster Monat",
    completedCount:
      "{n} abgeschlossenes Training | {n} abgeschlossene Trainings",
    dayLabel: "{date}, {count}",
    rhythmDayLabel: "{weekday} {day}, {label}",
    workoutCount: "{n} Training | {n} Trainings",
    selectedDay: "{date} · {count}",
    noWorkouts: "Keine abgeschlossenen Trainings.",
    sessionSummary: "{minutes} Min. · {sets}",
    sessionSets: "{n} Satz | {n} Sätze",
  },
};
