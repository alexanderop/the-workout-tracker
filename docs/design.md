# Design system

Form uses the approved five-color palette. All interface colors map to these tokens in `src/style.css`.

| Token      | Color   | Role                                             |
| ---------- | ------- | ------------------------------------------------ |
| background | #141414 | Canvas and modal surfaces                        |
| surface    | #232322 | Controls, borders, selected navigation           |
| text       | #EEEEEC | Primary content                                  |
| muted      | #A3A39E | Supporting labels and icons                      |
| purple     | #A78BFA | Primary actions, logged sets, progress and focus |

There are no separate success or error colors. Status uses text, icons and shape with purple when emphasis is needed. The modal overlay reuses the background at partial opacity.

Inter Variable is bundled locally for offline use. Lucide icons use a consistent light stroke. Content has a restrained type hierarchy, compact desktop navigation and generous space around workout controls. Mobile uses a persistent three-item bottom menu, large number inputs and a compact rest timer. Dialogs use Reka focus trapping and explicitly return focus to their opener.

The original reference remains in the neighboring `workout-design-system` project. This app carries its quiet Linear-inspired hierarchy into real routines, sessions, history and progress; empty states show actual data rather than fabricated statistics.

## Workout-first screens

The main page groups history and templates under Workouts. A fresh journal has one prominent start action. The exercise picker supports search, filters, and multiple selection. The active workout shows named exercise controls above a focused set table. Selected and completed states use the existing purple token, text, and icons. The bottom training control refers to the same exercise as the visible table.
