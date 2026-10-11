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
    back: "Zurück zu den Trainings",
    title: "Verlauf",
    searchLabel: "Trainingsverlauf durchsuchen",
    searchPlaceholder: "Vergangenes Training finden",
    emptyTitle: "Noch keine Trainings",
    empty:
      "Deine abgeschlossenen Trainings erscheinen hier und lassen sich wiederholen.",
    noMatches: "Kein Training passt zu deiner Suche.",
    rowMeta: "{date} · {meta}",
  },
  metrics: {
    line: "{duration} · {sets} · {volume}",
    sets: "{n} Satz | {n} Sätze",
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
  },
};
