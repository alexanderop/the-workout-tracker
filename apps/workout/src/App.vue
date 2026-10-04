<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Dumbbell,
  History,
  House,
  ListChecks,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  TrendingUp,
  Upload,
  WifiOff,
  X,
} from "@lucide/vue";
import { Sheet } from "@form/ui";
import SetRow from "./components/SetRow.vue";
import RoutineEditor from "./components/RoutineEditor.vue";
import { useWorkouts } from "./useWorkouts";
import { usePwa } from "./usePwa";
import { sessionTotals, remainingRestSeconds } from "./domain";
import type {
  Command,
  CompletedSession,
  Routine,
  SessionExercise,
} from "./domain";

const { service, state, snapshot, saving, message, error, run } = useWorkouts();
const {
  online,
  installed,
  offlineReady,
  needRefresh,
  installMessage,
  install,
  updateServiceWorker,
} = usePwa();
const navigation = [
  { id: "today", label: "Today", icon: House },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "history", label: "History", icon: History },
  { id: "progress", label: "Progress", icon: TrendingUp },
] as const;
type Page = (typeof navigation)[number]["id"] | "session";
function route(): Page {
  const value = location.hash.slice(2);
  return value === "session" || navigation.some((item) => item.id === value)
    ? (value as Page)
    : "today";
}
const page = ref<Page>(route());
const navigate = (next: Page) => {
  location.hash = `/${next}`;
  page.value = next;
  window.scrollTo({ top: 0, behavior: "instant" });
};
const routeChanged = () => {
  page.value = route();
};
const now = ref(Date.now());
let tick: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  tick = setInterval(() => {
    now.value = Date.now();
  }, 1000);
  window.addEventListener("hashchange", routeChanged);
});
onUnmounted(() => {
  if (tick) clearInterval(tick);
  window.removeEventListener("hashchange", routeChanged);
});

const routines = computed(() => Object.values(snapshot.value?.routines ?? {}));
const catalog = computed(() =>
  Object.values(snapshot.value?.exercises ?? {}).sort((a, b) =>
    a.name.localeCompare(b.name),
  ),
);
const history = computed(() =>
  Object.values(snapshot.value?.completed ?? {}).sort(
    (a, b) => b.finishedAt - a.finishedAt,
  ),
);
const active = computed(() => snapshot.value?.active ?? null);
const nextRoutine = computed(() => {
  const last = history.value[0];
  const index = last
    ? routines.value.findIndex((r) => r.name === last.name)
    : -1;
  return routines.value[(index + 1) % Math.max(1, routines.value.length)];
});
const totals = computed(() =>
  history.value.reduce(
    (sum, session) => {
      const t = sessionTotals(session);
      return {
        workouts: sum.workouts + 1,
        sets: sum.sets + t.completedSets,
        volume: sum.volume + t.volumeKg,
      };
    },
    { workouts: 0, sets: 0, volume: 0 },
  ),
);
const activeTotals = computed(() =>
  active.value
    ? sessionTotals(active.value)
    : { completedSets: 0, volumeKg: 0 },
);
const activeSetCount = computed(
  () =>
    active.value?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) ?? 0,
);
const rest = computed(() =>
  active.value ? remainingRestSeconds(active.value, now.value) : 0,
);
const fmt = (value: number) =>
  new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(value);
const shortDate = (at: number) =>
  new Date(at).toLocaleDateString("en", { month: "short", day: "numeric" });
const longDate = (at: number) =>
  new Date(at).toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
const duration = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(Math.max(0, seconds) % 60)
    .toString()
    .padStart(2, "0")}`;
const elapsed = computed(() =>
  duration(active.value ? (now.value - active.value.startedAt) / 1000 : 0),
);
const sessionMinutes = (session: CompletedSession) =>
  Math.max(1, Math.round((session.finishedAt - session.startedAt) / 60000));
const week = computed(() => {
  const start = new Date(now.value);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      label: date.toLocaleDateString("en", { weekday: "short" }),
      date: date.getDate(),
      today: date.toDateString() === new Date(now.value).toDateString(),
      count: history.value.filter(
        (s) => new Date(s.finishedAt).toDateString() === date.toDateString(),
      ).length,
    };
  });
});
const weekCount = computed(() =>
  week.value.reduce((sum, day) => sum + day.count, 0),
);
const historySearch = ref("");
const filteredHistory = computed(() =>
  history.value.filter((session) =>
    session.name.toLowerCase().includes(historySearch.value.toLowerCase()),
  ),
);
const selectedSession = ref<string | null>(null);
const detail = computed(() =>
  selectedSession.value
    ? snapshot.value?.completed[selectedSession.value]
    : undefined,
);
const settingsOpen = ref(false);
const routineOpen = ref(false);
const editingRoutine = ref<Routine | null>(null);
let routineRevision = 0;
const pickerOpen = ref(false);
const exerciseSearch = ref("");
const customName = ref("");
const customCategory = ref("Other");
const pickerResults = computed(() =>
  catalog.value.filter((ex) =>
    `${ex.name} ${ex.category}`
      .toLowerCase()
      .includes(exerciseSearch.value.toLowerCase()),
  ),
);
const finishOpen = ref(false);
const confirmation = ref<{
  title: string;
  description: string;
  command: Command;
} | null>(null);
const backupFile = ref<{ name: string; json: string; revision: number } | null>(
  null,
);
const backupBusy = ref(false);
const backupMessage = ref("");
const importInput = ref<HTMLInputElement | null>(null);

async function startWorkout(routineId: string | null) {
  if (active.value) {
    navigate("session");
    return;
  }
  const saved = await run({ type: "start", routineId });
  if (saved?.active) {
    navigate("session");
    if (saved.active.exercises.length === 0) pickerOpen.value = true;
  }
}
function editRoutine(routine: Routine | null) {
  editingRoutine.value = routine;
  routineRevision = snapshot.value?.revision ?? 0;
  routineOpen.value = true;
}
async function saveRoutine(routine: Routine) {
  if (await run({ type: "save-routine", routine }, routineRevision)) {
    routineOpen.value = false;
    message.value = "Routine saved";
  }
}
async function addExercise(exerciseId: string) {
  if (!active.value) return;
  if (
    await run({ type: "add-exercise", sessionId: active.value.id, exerciseId })
  ) {
    pickerOpen.value = false;
    exerciseSearch.value = "";
  }
}
async function createExercise() {
  if (!customName.value.trim() || saving.value) return;
  const id = crypto.randomUUID();
  const saved = await run({
    type: "save-exercise",
    exercise: {
      id,
      name: customName.value.trim(),
      category: customCategory.value,
      custom: true,
    },
  });
  if (saved) {
    customName.value = "";
    await addExercise(id);
  }
}
async function logSet(
  exercise: SessionExercise,
  setId: string,
  values: {
    weightKg: number;
    reps: number;
    completed: boolean;
    revision: number;
  },
) {
  if (!active.value) return;
  await run(
    {
      type: "set-entry",
      sessionId: active.value.id,
      exerciseId: exercise.id,
      setId,
      weightKg: values.weightKg,
      reps: values.reps,
      completed: values.completed,
    },
    values.revision,
  );
  now.value = Date.now();
}
async function finishWorkout() {
  const id = active.value?.id;
  if (!id) return;
  if (await run({ type: "finish", sessionId: id })) {
    finishOpen.value = false;
    navigate("history");
    selectedSession.value = id;
    message.value = "Workout saved. Another session in the books.";
  }
}
async function confirmAction() {
  if (!confirmation.value) return;
  const command = confirmation.value.command;
  if (await run(command)) {
    confirmation.value = null;
    if (command.type === "discard") navigate("workouts");
  }
}
function download(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function exportBackup() {
  backupBusy.value = true;
  backupMessage.value = "";
  try {
    download(
      await service.exportBackup(),
      `form-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    backupMessage.value = "Backup downloaded.";
  } catch {
    backupMessage.value = "Could not export your backup. Try again.";
  } finally {
    backupBusy.value = false;
  }
}
async function selectBackup(event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 20_000_000) {
    backupMessage.value = "Choose a backup smaller than 20 MB.";
    input.value = "";
    return;
  }
  try {
    backupFile.value = {
      name: file.name,
      json: await file.text(),
      revision: snapshot.value?.revision ?? 0,
    };
    backupMessage.value = "";
  } catch {
    backupMessage.value = "Could not read that file.";
  }
  input.value = "";
}
async function importBackup() {
  const file = backupFile.value;
  if (!file) return;
  backupBusy.value = true;
  try {
    const result = await service.importBackup(file.json, file.revision);
    if (result.kind === "saved") {
      state.value = { kind: "ready", snapshot: result.snapshot };
      backupFile.value = null;
      backupMessage.value =
        "Backup imported. Your existing workouts are preserved.";
    } else if (result.kind === "conflict")
      backupMessage.value =
        "Your data changed. Select the backup again to review the current import.";
    else backupMessage.value = result.message;
  } catch {
    backupMessage.value =
      "Import failed. Your saved workouts have not been replaced.";
  } finally {
    backupBusy.value = false;
  }
}
function changeRestDuration(event: Event) {
  if (event.target instanceof HTMLSelectElement && snapshot.value)
    void run({
      type: "settings",
      settings: {
        ...snapshot.value.settings,
        restSeconds: Number(event.target.value),
      },
    });
}
function reload() {
  window.location.reload();
}
const progressExercise = ref("");
const trainedExercises = computed(() => {
  const names = new Map<string, string>();
  for (const session of history.value)
    for (const ex of session.exercises)
      if (ex.sets.some((set) => set.completed))
        names.set(ex.exerciseId, ex.name);
  return [...names].map(([id, name]) => ({ id, name }));
});
watch(trainedExercises, (list) => {
  if (!list.some((ex) => ex.id === progressExercise.value))
    progressExercise.value = list[0]?.id ?? "";
});
const trend = computed(() =>
  history.value
    .slice()
    .reverse()
    .flatMap((session) => {
      const sets = session.exercises
        .filter((ex) => ex.exerciseId === progressExercise.value)
        .flatMap((ex) => ex.sets.filter((set) => set.completed));
      return sets.length
        ? [
            {
              at: session.finishedAt,
              weight: Math.max(...sets.map((set) => set.weightKg)),
            },
          ]
        : [];
    })
    .slice(-12),
);
const trendMax = computed(() =>
  Math.max(10, ...trend.value.map((point) => point.weight)),
);
const trendPoints = computed(() =>
  trend.value.map((point, index) => ({
    ...point,
    x:
      trend.value.length === 1
        ? 300
        : 25 + (index / (trend.value.length - 1)) * 550,
    y: 160 - (point.weight / trendMax.value) * 130,
  })),
);
const records = computed(() =>
  trainedExercises.value.map((ex) => {
    const sets = history.value.flatMap((session) =>
      session.exercises
        .filter((item) => item.exerciseId === ex.id)
        .flatMap((item) => item.sets.filter((set) => set.completed)),
    );
    const best = sets
      .slice()
      .sort((a, b) => b.weightKg - a.weightKg || b.reps - a.reps)[0];
    return { ...ex, weight: best?.weightKg ?? 0, reps: best?.reps ?? 0 };
  }),
);
const title = computed(() =>
  page.value === "session"
    ? "Active workout"
    : (navigation.find((item) => item.id === page.value)?.label ?? "Today"),
);
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="app-layout">
    <aside class="sidebar">
      <a href="#/today" class="brand" aria-label="Form home"
        ><span class="brand-mark">f</span
        ><span>form<span class="accent">.</span></span></a
      >
      <div class="workspace-label">YOUR TRAINING SPACE</div>
      <nav class="desktop-nav" aria-label="Main navigation">
        <a
          v-for="item in navigation"
          :key="item.id"
          :href="`#/${item.id}`"
          :class="{
            selected:
              page === item.id ||
              (page === 'session' && item.id === 'workouts'),
          }"
          :aria-current="page === item.id ? 'page' : undefined"
          ><component :is="item.icon" :size="18" /><span>{{ item.label }}</span
          ><span
            v-if="item.id === 'history' && history.length"
            class="nav-count"
            >{{ history.length }}</span
          ></a
        >
      </nav>
      <button v-if="active" class="active-sidebar" @click="navigate('session')">
        <span class="activity-dot"></span
        ><span
          >Workout in progress<small>{{ active.name }}</small></span
        ><ChevronRight :size="16" />
      </button>
      <div class="sidebar-bottom">
        <button class="sidebar-action" @click="settingsOpen = true">
          <Settings2 :size="17" />Settings</button
        ><button v-if="!installed" class="sidebar-action" @click="install">
          <ArrowDownToLine :size="17" />Install Form
        </button>
        <div class="local-note">
          <ShieldCheck :size="15" /><span>Yours. On this device.</span>
        </div>
      </div>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <div>
          <span class="muted">Your workspace</span><span class="slash">/</span
          ><span>{{ title }}</span>
        </div>
        <div class="topbar-right">
          <span class="connection" :class="{ accent: !online }"
            ><WifiOff v-if="!online" :size="14" /><span
              v-else
              class="connection-dot"
            ></span
            >{{
              !online
                ? "Offline · saved locally"
                : offlineReady
                  ? "Ready offline"
                  : "Local workspace"
            }}</span
          ><button
            class="avatar"
            aria-label="Open settings"
            @click="settingsOpen = true"
          >
            F
          </button>
        </div>
      </header>
      <main id="main" class="main">
        <div v-if="state.kind === 'loading'" class="empty-state loading-state">
          <div class="brand-mark">f</div>
          <h1>Opening your training journal</h1>
          <p class="muted">Loading your saved workouts.</p>
        </div>
        <div
          v-else-if="state.kind === 'unavailable' || state.kind === 'recovery'"
          class="empty-state"
        >
          <ShieldCheck :size="32" />
          <h1>Your data needs attention</h1>
          <p>{{ state.message }}</p>
          <button
            v-if="state.kind === 'recovery'"
            class="btn secondary"
            @click="download(state.rawExport, 'form-recovery.json')"
          >
            Export recovery data</button
          ><button class="btn primary" @click="reload">Try again</button>
        </div>
        <template v-else-if="snapshot">
          <div v-if="error" class="notice" role="alert">
            <CircleHelp :size="18" /><span>{{ error }}</span
            ><button class="text-button" @click="reload">Reload</button
            ><button
              class="icon-button"
              aria-label="Dismiss error"
              @click="error = ''"
            >
              <X :size="16" />
            </button>
          </div>
          <div v-if="needRefresh && !active" class="notice">
            <span>A new version of Form is ready.</span
            ><button class="text-button" @click="updateServiceWorker(true)">
              Update app
            </button>
          </div>
          <div v-if="installMessage" class="notice" role="status">
            <span>{{ installMessage }}</span
            ><button
              class="icon-button"
              aria-label="Dismiss install instructions"
              @click="installMessage = ''"
            >
              <X :size="16" />
            </button>
          </div>

          <template v-if="page === 'today'">
            <div class="page-heading">
              <div>
                <div class="eyebrow">{{ longDate(now) }}</div>
                <h1>A little stronger, every day.</h1>
                <p class="muted">Make time for your next good session.</p>
              </div>
              <button
                class="btn secondary"
                :disabled="saving"
                @click="startWorkout(null)"
              >
                <Plus :size="17" />Free workout
              </button>
            </div>
            <div class="today-grid">
              <section class="next-workout panel">
                <div class="panel-overline">
                  <span class="eyebrow">{{
                    active ? "PICK UP WHERE YOU LEFT OFF" : "UP NEXT"
                  }}</span
                  ><span class="pill"><Dumbbell :size="13" />Strength</span>
                </div>
                <div class="next-content">
                  <div>
                    <h2>
                      {{
                        active?.name ??
                        nextRoutine?.name ??
                        "Your first workout"
                      }}
                    </h2>
                    <p class="muted">
                      {{
                        active
                          ? "Your logged sets are saved. Keep going when you are ready."
                          : nextRoutine?.description ||
                            "Start with a routine or build a session as you go."
                      }}
                    </p>
                    <div class="workout-facts">
                      <span
                        ><ListChecks :size="15" />{{
                          active?.exercises.length ??
                          nextRoutine?.exercises.length ??
                          0
                        }}
                        exercises</span
                      ><span
                        ><Clock3 :size="15" />{{
                          active ? elapsed : "At your own pace"
                        }}</span
                      >
                    </div>
                  </div>
                  <div class="workout-art" aria-hidden="true">
                    <svg viewBox="0 0 200 180" fill="none">
                      <path d="M28 125 98 164 172 122V55L103 16 28 56z" />
                      <path
                        d="m28 56 72 40 72-41M100 96v68M28 90l72 41 72-42M63 36l73 40v67M137 36 63 77v67"
                      />
                      <path
                        class="art-accent"
                        d="m64 104 36 20 36-20V77l-36-21-36 21z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="next-footer">
                  <button
                    class="btn primary"
                    :disabled="saving"
                    @click="
                      active
                        ? navigate('session')
                        : startWorkout(nextRoutine?.id ?? null)
                    "
                  >
                    {{ active ? "Resume workout" : "Start workout"
                    }}<ArrowRight :size="17" /></button
                  ><span class="muted small">{{
                    active
                      ? `${activeTotals.completedSets} sets logged`
                      : "One set at a time."
                  }}</span>
                </div>
              </section>
              <section class="week-panel panel">
                <div class="section-heading">
                  <h2>This week</h2>
                  <span class="muted small"
                    >{{ weekCount }}
                    {{ weekCount === 1 ? "session" : "sessions" }}</span
                  >
                </div>
                <div class="week-days">
                  <div
                    v-for="day in week"
                    :key="day.label"
                    class="week-day"
                    :class="{ today: day.today, trained: day.count > 0 }"
                  >
                    <span>{{ day.label.slice(0, 1) }}</span>
                    <div>{{ day.date }}</div>
                    <Check
                      v-if="day.count"
                      :size="13"
                      aria-label="Workout completed"
                    /><span v-else class="day-dot"></span>
                  </div>
                </div>
                <div class="week-caption">
                  <span class="accent">{{
                    weekCount
                      ? "Keep showing up."
                      : "A fresh week of possibility."
                  }}</span>
                  <p class="muted small">
                    {{
                      weekCount
                        ? "Every session adds up over time."
                        : "Your first session starts the story."
                    }}
                  </p>
                </div>
              </section>
            </div>
            <section class="metrics" aria-label="Training totals">
              <div>
                <span class="muted">Workouts completed</span
                ><strong>{{ totals.workouts }}<span>sessions</span></strong>
              </div>
              <div>
                <span class="muted">Sets logged</span
                ><strong>{{ fmt(totals.sets) }}<span>sets</span></strong>
              </div>
              <div>
                <span class="muted">Total volume</span
                ><strong>{{ fmt(totals.volume) }}<span>kg</span></strong>
              </div>
            </section>
            <section>
              <div class="section-heading">
                <div>
                  <h2>Your routines</h2>
                  <p class="muted small">A plan to come back to.</p>
                </div>
                <a class="text-link" href="#/workouts"
                  >View all<ArrowUpRight :size="15"
                /></a>
              </div>
              <div class="routine-list">
                <button
                  v-for="(routine, index) in routines.slice(0, 3)"
                  :key="routine.id"
                  class="routine-list-row"
                  :disabled="saving"
                  @click="startWorkout(routine.id)"
                >
                  <span class="routine-symbol"><Dumbbell :size="18" /></span
                  ><span class="routine-list-name"
                    >{{ routine.name
                    }}<small
                      >{{ routine.exercises.length }} exercises ·
                      {{
                        routine.exercises.reduce((sum, ex) => sum + ex.sets, 0)
                      }}
                      sets</small
                    ></span
                  ><span class="muted routine-number">0{{ index + 1 }}</span
                  ><ArrowRight :size="17" />
                </button>
              </div>
            </section>
            <section class="recent-section">
              <div class="section-heading">
                <h2>Recent activity</h2>
                <a v-if="history.length" class="text-link" href="#/history"
                  >View history<ArrowUpRight :size="15"
                /></a>
              </div>
              <button
                v-if="history[0]"
                class="history-row"
                @click="selectedSession = history[0].id"
              >
                <span class="history-icon"><Check :size="18" /></span
                ><span class="history-name"
                  >{{ history[0].name
                  }}<small
                    >{{ shortDate(history[0].finishedAt) }} ·
                    {{ sessionMinutes(history[0]) }} min</small
                  ></span
                ><span class="muted small"
                  >{{ sessionTotals(history[0]).completedSets }} sets</span
                ><ChevronRight :size="18" />
              </button>
              <div v-else class="empty-inline">
                <History :size="21" />
                <div>
                  <strong>Your story starts with one workout.</strong>
                  <p class="muted small">
                    Completed sessions will appear here.
                  </p>
                </div>
              </div>
            </section>
          </template>

          <template v-else-if="page === 'workouts'">
            <div class="page-heading">
              <div>
                <div class="eyebrow">A PLAN THAT FITS YOU</div>
                <h1>Your workouts</h1>
                <p class="muted">
                  Keep your favorites. Make each session your own.
                </p>
              </div>
              <button class="btn primary" @click="editRoutine(null)">
                <Plus :size="17" />Create routine
              </button>
            </div>
            <button
              v-if="active"
              class="resume-banner"
              @click="navigate('session')"
            >
              <span class="activity-dot"></span
              ><span
                >{{ active.name
                }}<small
                  >Workout in progress · {{ activeTotals.completedSets }} sets
                  logged</small
                ></span
              ><span class="text-link">Resume<ArrowRight :size="17" /></span>
            </button>
            <div class="routine-grid">
              <article
                v-for="routine in routines"
                :key="routine.id"
                class="routine-card panel"
              >
                <header>
                  <span class="routine-symbol"><Dumbbell :size="20" /></span
                  ><button
                    class="icon-button"
                    :aria-label="`Edit ${routine.name}`"
                    @click="editRoutine(routine)"
                  >
                    <MoreHorizontal :size="20" />
                  </button>
                </header>
                <h2>{{ routine.name }}</h2>
                <p class="muted small routine-description">
                  {{ routine.description || "Your custom training session." }}
                </p>
                <ul class="exercise-preview">
                  <li
                    v-for="entry in routine.exercises.slice(0, 4)"
                    :key="entry.exerciseId"
                  >
                    <span>{{ snapshot.exercises[entry.exerciseId]?.name }}</span
                    ><span class="muted"
                      >{{ entry.sets }} × {{ entry.reps }}</span
                    >
                  </li>
                  <li v-if="routine.exercises.length > 4" class="muted">
                    + {{ routine.exercises.length - 4 }} more exercises
                  </li>
                </ul>
                <footer>
                  <span class="muted small"
                    >{{ routine.exercises.length }} exercises</span
                  ><button
                    class="btn secondary"
                    :disabled="saving"
                    :aria-label="`Start ${routine.name}`"
                    @click="startWorkout(routine.id)"
                  >
                    Start<ArrowRight :size="16" />
                  </button>
                </footer>
              </article>
              <button class="new-routine-card" @click="startWorkout(null)">
                <Plus :size="24" /><strong>Go with the flow</strong
                ><span class="muted small"
                  >Start a free workout and add<br />exercises as you
                  train.</span
                ><span class="text-link"
                  >Free workout<ArrowRight :size="16"
                /></span>
              </button>
            </div>
          </template>

          <template v-else-if="page === 'session'">
            <template v-if="active"
              ><div class="page-heading session-heading">
                <div>
                  <div class="eyebrow">{{ longDate(active.startedAt) }}</div>
                  <h1>{{ active.name }}</h1>
                  <p class="muted">
                    <Clock3 :size="14" />{{ elapsed }} elapsed<span
                      class="separator"
                      >·</span
                    >{{ active.exercises.length }} exercises
                  </p>
                </div>
                <button
                  class="btn secondary"
                  :disabled="saving || !activeTotals.completedSets"
                  @click="finishOpen = true"
                >
                  Finish workout<Check :size="17" />
                </button>
              </div>
              <div class="session-layout">
                <div class="exercise-stack">
                  <div class="session-guide">
                    <span class="activity-dot"></span
                    ><span
                      >Enter your weight and reps, then check the set to
                      save.</span
                    >
                  </div>
                  <article
                    v-for="(exercise, exIndex) in active.exercises"
                    :key="exercise.id"
                    class="exercise-card"
                  >
                    <header>
                      <div class="exercise-title">
                        <span class="exercise-index">{{
                          String(exIndex + 1).padStart(2, "0")
                        }}</span>
                        <div>
                          <h2>{{ exercise.name }}</h2>
                          <p class="muted small">
                            {{ exercise.category
                            }}<span class="separator">·</span
                            >{{
                              exercise.sets.filter((set) => set.completed)
                                .length
                            }}/{{ exercise.sets.length }} sets logged
                          </p>
                        </div>
                      </div>
                      <button
                        class="icon-button"
                        :aria-label="`Remove ${exercise.name} from workout`"
                        :disabled="saving"
                        @click="
                          confirmation = {
                            title: 'Remove exercise?',
                            description: `This removes ${exercise.name} and its logged sets from the active workout.`,
                            command: {
                              type: 'remove-exercise',
                              sessionId: active.id,
                              exerciseId: exercise.id,
                            },
                          }
                        "
                      >
                        <X :size="16" />
                      </button>
                    </header>
                    <div class="set-labels">
                      <span>SET</span><span>WEIGHT · KG</span><span>REPS</span
                      ><span>LOG</span><span></span>
                    </div>
                    <SetRow
                      v-for="(set, index) in exercise.sets"
                      :key="set.id"
                      :set="set"
                      :index="index"
                      :exercise-name="exercise.name"
                      :revision="snapshot.revision"
                      :busy="saving"
                      :removable="exercise.sets.length > 1"
                      @commit="(values) => logSet(exercise, set.id, values)"
                      @remove="
                        confirmation = {
                          title: 'Remove set?',
                          description:
                            'This removes the set from your active workout.',
                          command: {
                            type: 'remove-set',
                            sessionId: active.id,
                            exerciseId: exercise.id,
                            setId: set.id,
                          },
                        }
                      "
                    /><button
                      class="add-set text-button"
                      :disabled="saving || exercise.sets.length >= 30"
                      @click="
                        run({
                          type: 'add-set',
                          sessionId: active.id,
                          exerciseId: exercise.id,
                        })
                      "
                    >
                      <Plus :size="15" />Add set
                    </button>
                  </article>
                  <div v-if="active.exercises.length === 0" class="empty-state">
                    <Dumbbell :size="32" />
                    <h2>What are we training?</h2>
                    <p class="muted">
                      Add your first exercise to start logging sets.
                    </p>
                  </div>
                  <button
                    class="btn secondary full-width"
                    @click="pickerOpen = true"
                  >
                    <Plus :size="18" />Add exercise
                  </button>
                </div>
                <aside class="session-summary">
                  <section class="panel">
                    <div class="section-heading">
                      <h2>Session</h2>
                      <span class="pill">In progress</span>
                    </div>
                    <div class="summary-progress">
                      <strong
                        >{{ activeTotals.completedSets
                        }}<span> / {{ activeSetCount }}</span></strong
                      ><span class="muted small">sets completed</span>
                    </div>
                    <div class="progress-track">
                      <div
                        :style="{
                          width: `${activeSetCount ? (activeTotals.completedSets / activeSetCount) * 100 : 0}%`,
                        }"
                      ></div>
                    </div>
                    <div class="summary-line">
                      <span class="muted">Volume logged</span
                      ><strong>{{ fmt(activeTotals.volumeKg) }} kg</strong>
                    </div>
                    <div class="summary-line">
                      <span class="muted">Elapsed time</span
                      ><strong>{{ elapsed }}</strong>
                    </div>
                  </section>
                  <section class="rest-card panel">
                    <div class="section-heading">
                      <h2><Clock3 :size="16" />Rest timer</h2>
                      <span class="muted small">{{
                        snapshot.settings.autoRest ? "Auto" : "Off"
                      }}</span>
                    </div>
                    <strong class="rest-time">{{ duration(rest) }}</strong>
                    <p class="muted small">
                      {{
                        rest > 0
                          ? "Breathe. Your next set can wait."
                          : active.rest
                            ? "Rest complete. Ready when you are."
                            : "Starts when you log a set."
                      }}
                    </p>
                    <button
                      v-if="rest > 0"
                      class="btn secondary full-width"
                      :disabled="saving"
                      @click="run({ type: 'stop-rest', sessionId: active.id })"
                    >
                      Skip rest<ArrowRight :size="16" />
                    </button>
                  </section>
                  <button
                    class="text-button discard-button"
                    :disabled="saving"
                    @click="
                      confirmation = {
                        title: 'Discard this workout?',
                        description:
                          'This deletes the active workout and its logged sets. Your completed history stays saved.',
                        command: { type: 'discard', sessionId: active.id },
                      }
                    "
                  >
                    Discard workout
                  </button>
                  <p class="saved-indicator" role="status">
                    <ShieldCheck :size="14" />{{
                      saving ? "Saving…" : "Logged sets saved on this device"
                    }}
                  </p>
                </aside>
              </div>
            </template>
            <div v-else class="empty-state">
              <Dumbbell :size="32" />
              <h1>Ready for your next session?</h1>
              <p class="muted">Choose a routine or start a free workout.</p>
              <button class="btn primary" @click="navigate('workouts')">
                Choose a workout<ArrowRight :size="17" />
              </button>
            </div>
          </template>

          <template v-else-if="page === 'history'">
            <div class="page-heading">
              <div>
                <div class="eyebrow">THE WORK YOU PUT IN</div>
                <h1>Your training history</h1>
                <p class="muted">
                  {{
                    history.length
                      ? `${history.length} ${history.length === 1 ? "session" : "sessions"}. Every one counts.`
                      : "A record of showing up for yourself."
                  }}
                </p>
              </div>
              <div v-if="history.length" class="search-field">
                <Search :size="17" /><input
                  v-model="historySearch"
                  aria-label="Search workout history"
                  placeholder="Find a workout"
                />
              </div>
            </div>
            <div v-if="!history.length" class="empty-state panel">
              <History :size="34" />
              <h2>Every story has a first session.</h2>
              <p class="muted">
                Finish a workout to see your sets, volume,<br />and time
                together in one place.
              </p>
              <button class="btn primary" @click="navigate('workouts')">
                Find your workout<ArrowRight :size="17" />
              </button>
            </div>
            <div v-else class="history-list">
              <button
                v-for="session in filteredHistory"
                :key="session.id"
                class="history-row"
                @click="selectedSession = session.id"
              >
                <span class="date-tile"
                  ><strong>{{ new Date(session.finishedAt).getDate() }}</strong
                  ><span>{{
                    new Date(session.finishedAt).toLocaleDateString("en", {
                      month: "short",
                    })
                  }}</span></span
                ><span class="history-name"
                  >{{ session.name
                  }}<small
                    >{{ session.exercises.length }} exercises ·
                    {{ sessionMinutes(session) }} min</small
                  ></span
                ><span class="history-volume"
                  >{{ fmt(sessionTotals(session).volumeKg)
                  }}<small>kg volume</small></span
                ><span class="muted small history-sets"
                  >{{ sessionTotals(session).completedSets }} sets</span
                ><ChevronRight :size="18" />
              </button>
              <p v-if="!filteredHistory.length" class="empty-inline muted">
                No workouts match your search.
              </p>
            </div>
          </template>

          <template v-else-if="page === 'progress'">
            <div class="page-heading">
              <div>
                <div class="eyebrow">BUILT ONE SESSION AT A TIME</div>
                <h1>See how far you’ve come.</h1>
                <p class="muted">Your training, made tangible.</p>
              </div>
              <span class="pill">All time</span>
            </div>
            <section class="metrics progress-metrics">
              <div>
                <span class="muted">Completed workouts</span
                ><strong>{{ totals.workouts }}<span>sessions</span></strong>
              </div>
              <div>
                <span class="muted">Total volume</span
                ><strong>{{ fmt(totals.volume) }}<span>kg</span></strong>
              </div>
              <div>
                <span class="muted">Completed sets</span
                ><strong>{{ fmt(totals.sets) }}<span>sets</span></strong>
              </div>
            </section>
            <div v-if="!history.length" class="empty-state panel">
              <TrendingUp :size="34" />
              <h2>Progress starts where you are.</h2>
              <p class="muted">
                Log your first workout to start tracking<br />your lifting
                history and personal bests.
              </p>
              <button class="btn primary" @click="navigate('workouts')">
                Start training<ArrowRight :size="17" />
              </button>
            </div>
            <template v-else
              ><section class="chart-panel panel">
                <div class="section-heading">
                  <div>
                    <h2>Weight over time</h2>
                    <p class="muted small">
                      Heaviest logged set per session · kg
                    </p>
                  </div>
                  <label class="sr-only" for="progress-exercise"
                    >Exercise progress</label
                  ><select
                    id="progress-exercise"
                    v-model="progressExercise"
                    class="input compact-select"
                  >
                    <option
                      v-for="exercise in trainedExercises"
                      :key="exercise.id"
                      :value="exercise.id"
                    >
                      {{ exercise.name }}
                    </option>
                  </select>
                </div>
                <svg
                  class="trend-chart"
                  viewBox="0 0 600 190"
                  role="img"
                  :aria-label="`Heaviest weights across ${trend.length} recorded sessions. Values listed below.`"
                >
                  <path
                    d="M25 30H575M25 95H575M25 160H575"
                    class="chart-grid"
                  />
                  <polyline
                    :points="trendPoints.map((p) => `${p.x},${p.y}`).join(' ')"
                    class="chart-line"
                  />
                  <circle
                    v-for="(point, index) in trendPoints"
                    :key="index"
                    :cx="point.x"
                    :cy="point.y"
                    r="4"
                    class="chart-point"
                  />
                </svg>
                <div class="chart-values">
                  <span v-for="(point, index) in trend" :key="index"
                    >{{ shortDate(point.at)
                    }}<strong>{{ fmt(point.weight) }} kg</strong></span
                  >
                </div>
              </section>
              <section>
                <div class="section-heading">
                  <h2>Personal bests</h2>
                  <span class="muted small">Heaviest completed sets</span>
                </div>
                <div class="records-grid">
                  <article
                    v-for="record in records"
                    :key="record.id"
                    class="record-card"
                  >
                    <span class="muted small">{{ record.name }}</span
                    ><strong>{{ fmt(record.weight) }}<span> kg</span></strong
                    ><span class="muted small"
                      >{{ record.reps }} reps at this weight</span
                    >
                  </article>
                </div>
              </section></template
            >
          </template>
          <footer class="main-footer">
            <span>Small steps. Lasting strength.</span
            ><span class="save-status" role="status">{{
              saving
                ? "Saving…"
                : message || "Private by default. Saved on your device."
            }}</span>
          </footer>
        </template>
      </main>
    </div>
    <nav class="mobile-nav" aria-label="Mobile navigation">
      <a
        v-for="item in navigation"
        :key="item.id"
        :href="`#/${item.id}`"
        :class="{
          selected:
            page === item.id || (page === 'session' && item.id === 'workouts'),
        }"
        :aria-current="page === item.id ? 'page' : undefined"
        ><component :is="item.icon" :size="20" /><span>{{
          item.label
        }}</span></a
      >
    </nav>
  </div>

  <Sheet
    :open="routineOpen"
    :title="editingRoutine ? 'Edit routine' : 'Create routine'"
    description="Set up the exercises you want to come back to."
    wide
    @close="routineOpen = false"
    ><RoutineEditor
      v-if="routineOpen"
      :key="editingRoutine?.id ?? 'new'"
      :routine="editingRoutine"
      :exercises="catalog"
      :busy="saving"
      @save="saveRoutine"
      @cancel="routineOpen = false"
    />
    <p v-if="error" class="field-error" role="alert">{{ error }}</p></Sheet
  >
  <Sheet
    :open="pickerOpen"
    title="Add exercise"
    description="Choose an exercise or add your own."
    @close="pickerOpen = false"
    ><div class="search-field picker-search">
      <Search :size="18" /><input
        v-model="exerciseSearch"
        aria-label="Search exercises"
        placeholder="Search exercises or muscle groups"
      />
    </div>
    <div class="picker-list">
      <button
        v-for="exercise in pickerResults"
        :key="exercise.id"
        :disabled="saving"
        @click="addExercise(exercise.id)"
      >
        <span class="routine-symbol"><Dumbbell :size="17" /></span
        ><span
          >{{ exercise.name }}<small>{{ exercise.category }}</small></span
        ><Plus :size="18" />
      </button>
      <p v-if="!pickerResults.length" class="muted">
        No exercises found. Add your own below.
      </p>
    </div>
    <form class="custom-exercise" @submit.prevent="createExercise">
      <h3>Create an exercise</h3>
      <label class="field"
        ><span>Exercise name</span
        ><input
          v-model="customName"
          class="input"
          required
          maxlength="80"
          placeholder="e.g. Cable lateral raise" /></label
      ><label class="field"
        ><span>Muscle group</span
        ><select v-model="customCategory" class="input">
          <option
            v-for="group in [
              'Chest',
              'Back',
              'Legs',
              'Shoulders',
              'Arms',
              'Core',
              'Other',
            ]"
            :key="group"
          >
            {{ group }}
          </option>
        </select></label
      ><button
        class="btn secondary full-width"
        type="submit"
        :disabled="saving || !customName.trim()"
      >
        <Plus :size="17" />Create and add exercise
      </button>
    </form>
    <p v-if="error" role="alert">{{ error }}</p></Sheet
  >
  <Sheet
    :open="finishOpen"
    title="Finish this workout?"
    description="Only logged sets count toward your progress. Unlogged sets stay in the session record."
    @close="finishOpen = false"
    ><div class="finish-stats">
      <div>
        <strong>{{ activeTotals.completedSets }}</strong
        ><span>sets logged</span>
      </div>
      <div>
        <strong>{{ fmt(activeTotals.volumeKg) }}</strong
        ><span>kg volume</span>
      </div>
      <div>
        <strong>{{ elapsed }}</strong
        ><span>elapsed</span>
      </div>
    </div>
    <div class="form-actions">
      <button
        class="btn secondary"
        :disabled="saving"
        @click="finishOpen = false"
      >
        Keep training</button
      ><button class="btn primary" :disabled="saving" @click="finishWorkout">
        Save workout<Check :size="17" />
      </button></div
  ></Sheet>
  <Sheet
    :open="confirmation !== null"
    :title="confirmation?.title ?? 'Confirm'"
    :description="confirmation?.description"
    @close="confirmation = null"
    ><div class="form-actions">
      <button
        class="btn secondary"
        :disabled="saving"
        @click="confirmation = null"
      >
        Keep it</button
      ><button class="btn primary" :disabled="saving" @click="confirmAction">
        {{
          confirmation?.command.type === "discard"
            ? "Discard workout"
            : "Remove"
        }}
      </button>
    </div></Sheet
  >
  <Sheet
    :open="!!detail"
    :title="detail?.name ?? 'Workout'"
    :description="detail ? longDate(detail.finishedAt) : ''"
    wide
    @close="selectedSession = null"
    ><template v-if="detail"
      ><div class="finish-stats">
        <div>
          <strong>{{ sessionTotals(detail).completedSets }}</strong
          ><span>sets logged</span>
        </div>
        <div>
          <strong>{{ fmt(sessionTotals(detail).volumeKg) }}</strong
          ><span>kg volume</span>
        </div>
        <div>
          <strong>{{ sessionMinutes(detail) }}</strong
          ><span>minutes</span>
        </div>
      </div>
      <section
        v-for="exercise in detail.exercises"
        :key="exercise.id"
        class="detail-exercise"
      >
        <h3>{{ exercise.name }}</h3>
        <div
          v-for="(set, index) in exercise.sets"
          :key="set.id"
          class="detail-set"
        >
          <span class="muted">Set {{ index + 1 }}</span
          ><span>{{ fmt(set.weightKg) }} kg × {{ set.reps }} reps</span
          ><span class="detail-status"
            ><Check v-if="set.completed" :size="15" />{{
              set.completed ? "Logged" : "Not logged"
            }}</span
          >
        </div>
      </section></template
    ></Sheet
  >
  <Sheet
    :open="settingsOpen"
    title="Make it your space"
    description="Your training preferences and local data."
    @close="settingsOpen = false"
    ><template v-if="snapshot"
      ><section class="settings-section">
        <h3>Training preferences</h3>
        <label class="settings-row"
          ><span
            >Automatic rest timer<small
              >Start counting down after a logged set.</small
            ></span
          ><input
            class="switch-input"
            type="checkbox"
            :checked="snapshot.settings.autoRest"
            :disabled="saving"
            @change="
              run({
                type: 'settings',
                settings: {
                  ...snapshot.settings,
                  autoRest: !snapshot.settings.autoRest,
                },
              })
            " /></label
        ><label class="settings-row"
          ><span
            >Rest between sets<small
              >Choose the pace that suits your session.</small
            ></span
          ><select
            class="input rest-select"
            aria-label="Rest duration"
            :value="snapshot.settings.restSeconds"
            :disabled="saving"
            @change="changeRestDuration"
          >
            <option
              v-for="seconds in [30, 60, 90, 120, 180, 300]"
              :key="seconds"
              :value="seconds"
            >
              {{ seconds }} sec
            </option>
          </select></label
        >
        <div class="settings-row">
          <span>Weight unit</span><span class="muted">Kilograms · kg</span>
        </div>
      </section>
      <section class="settings-section">
        <h3>Keep a copy of your progress</h3>
        <p class="muted small">
          Workouts live in this browser. Export a backup to keep them safe or
          move them to another device.
        </p>
        <div class="backup-actions">
          <button
            class="btn secondary"
            :disabled="backupBusy || saving"
            @click="exportBackup"
          >
            <ArrowDownToLine :size="17" />Export backup</button
          ><button
            class="btn secondary"
            :disabled="backupBusy || saving"
            @click="importInput?.click()"
          >
            <Upload :size="17" />Import backup</button
          ><input
            ref="importInput"
            class="sr-only"
            tabindex="-1"
            type="file"
            accept="application/json,.json"
            aria-label="Choose backup file"
            @change="selectBackup"
          />
        </div>
        <div v-if="backupFile" class="import-preview">
          <strong>{{ backupFile.name }}</strong>
          <p class="muted small">
            A new install restores your backup, including edited starter
            routines. Otherwise, import adds missing records and rejects
            conflicts. Your current settings stay unchanged.
          </p>
          <div class="form-actions">
            <button
              class="btn ghost"
              :disabled="backupBusy"
              @click="backupFile = null"
            >
              Cancel import</button
            ><button
              class="btn primary"
              :disabled="backupBusy || saving"
              @click="importBackup"
            >
              {{ backupBusy ? "Importing…" : "Import this backup" }}
            </button>
          </div>
        </div>
        <p v-if="backupMessage" role="status" class="small">
          {{ backupMessage }}
        </p>
      </section>
      <section class="settings-section">
        <div class="settings-row">
          <span
            >Form on your home screen<small
              >Open your journal like any other app.</small
            ></span
          ><button class="btn secondary" :disabled="installed" @click="install">
            {{ installed ? "Installed" : "Install app" }}
          </button>
        </div>
        <p v-if="installMessage" class="small" role="status">
          {{ installMessage }}
        </p>
        <p class="muted small">
          {{
            offlineReady
              ? "Ready for offline use."
              : "Offline availability starts after the first complete load."
          }}
          No account. No cloud sync.
        </p>
      </section>
      <p class="settings-signoff">
        <span class="brand small">form<span class="accent">.</span></span
        ><span class="muted small">A quieter space to get stronger.</span>
      </p></template
    ></Sheet
  >
</template>
