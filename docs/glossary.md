# Workout glossary

Use these terms in our conversations, product copy, and documentation. This document owns the shared definitions below; [domain context](context.md) owns detailed behavior and state transitions. Existing code names are included where they differ and do not require renaming.

| Term | Meaning |
| --- | --- |
| **Exercise** | A catalog definition, such as Bench Press. |
| **Workout exercise** | An exercise added to a specific workout, with its own sets and optional note. Called `SessionExercise` in code. |
| **Template** | A reusable plan for starting workouts. Called `Routine` in code. |
| **Active workout** | The workout currently being recorded. Called `ActiveSession` in code. |
| **Completed workout** | A finished workout saved in history. Called `CompletedSession` in code. |
| **Target reps** | The number of repetitions planned for a set. |
| **Recorded reps** | The repetitions actually performed; zero records a failed attempt. |
| **Draft** | Weight or reps being edited. Recoverable input that does not count toward progress. |
| **Logged set** | A set explicitly recorded as attempted; it counts toward progress. Represented by `WorkoutSet.completed` in code. |
| **Volume** | Weight × recorded reps, summed over logged sets. |

## Three distinct actions

**Confirm number** updates the draft → **Log set** records the attempt → **Finish workout** saves the workout to history.

Confirming a number does not log a set. Logging a set does not finish the workout.

## German terms

The app ships English and German catalogs. German copy uses the informal "du" and these terms, so the same concept always has the same word.

| English | German |
| --- | --- |
| Workout | Training |
| Active workout | Aktives Training |
| Completed workout | Abgeschlossenes Training |
| Exercise | Übung |
| Workout exercise | Übung im Training |
| Template | Vorlage |
| Set | Satz (Plural: Sätze) |
| Logged set | Erfasster Satz |
| Reps, target reps, recorded reps | Wiederholungen (Wdh.), Ziel-Wiederholungen, erfasste Wiederholungen |
| Rest | Pause |
| Draft | Entwurf |
| Volume | Volumen |
| History | Verlauf |
| Progress | Fortschritt |
| Muscle group | Muskelgruppe |
| Equipment | Gerät |

Built-in exercise names stay English because they are stored in snapshots and backups; muscle groups and equipment are translated for display only. Weights stay in kilograms (`kg`).
