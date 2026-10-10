export const enProgress = {
  title: "Progress",
  range: "All time",
  metrics: {
    completedWorkouts: "Completed workouts",
    sessions: "session | sessions",
    totalVolume: "Total volume",
    kilograms: "kg",
    completedSets: "Completed sets",
    sets: "set | sets",
  },
  empty: {
    title: "No progress yet",
    body: "Complete a workout to track your progress.",
    start: "Start training",
  },
  noSuccessfulSets: {
    title: "No successful sets yet",
    body: "Log a set with at least one repetition to see your weight trend and personal bests.",
  },
  chart: {
    title: "Weight over time",
    subtitle: "Heaviest successful set per workout · kg",
    exerciseLabel: "Exercise progress",
    startingPoint: "Your starting point · {date}",
    logAgain: "Log this exercise in another workout to see your trend.",
    description:
      "Heaviest weights across {n} recorded session. Values listed below. | Heaviest weights across {n} recorded sessions. Values listed below.",
  },
  bests: {
    title: "Personal bests",
    subtitle: "Heaviest successful sets",
    repsAtWeight: "{n} rep at this weight | {n} reps at this weight",
  },
} as const;
