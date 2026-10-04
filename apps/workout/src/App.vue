<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  ArrowDownToLine,
  ChevronRight,
  CircleHelp,
  Dumbbell,
  Settings2,
  ShieldCheck,
  TrendingUp,
  WifiOff,
  X,
} from "@lucide/vue";
import {
  useWorkoutWorkspace,
  WorkoutsPage,
  TrainingPage,
  ExercisesPage,
  ProgressPage,
  TrainingDock,
  WorkoutDialogs,
  WorkoutSettings,
  download,
} from "./features/workouts/ui";
import type { WorkoutPage } from "./features/workouts/ui";
import type { Workouts, DraftJournal } from "./features/workouts";
import { usePwa } from "./usePwa";
const props = defineProps<{ workouts: Workouts; drafts: DraftJournal }>();
const workspace = useWorkoutWorkspace(props.workouts, props.drafts);
const { state, snapshot, saving, message, error, history, routines, active } =
  workspace;
const dialogs = ref<InstanceType<typeof WorkoutDialogs> | null>(null);
const settingsOpen = ref(false);
const progressExercise = ref("");
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
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "exercises", label: "Exercises", icon: Dumbbell },
  { id: "progress", label: "Progress", icon: TrendingUp },
] as const;
type Page = WorkoutPage;
function route(): Page {
  const value = location.hash.slice(2);
  return value === "session" || navigation.some((item) => item.id === value)
    ? (value as Page)
    : "workouts";
}
const page = ref<Page>(route());
const navigate = (next: Page) => {
  const destination =
    next === "today" || next === "history" ? "workouts" : next;
  location.hash = `/${destination}`;
  page.value = destination;
  window.scrollTo({ top: 0, behavior: "instant" });
};
const routeChanged = () => {
  page.value = route();
};
onMounted(() => window.addEventListener("hashchange", routeChanged));
onUnmounted(() => window.removeEventListener("hashchange", routeChanged));
function reload() {
  window.location.reload();
}
const title = computed(() =>
  page.value === "session"
    ? "Active workout"
    : (navigation.find((item) => item.id === page.value)?.label ?? "Workouts"),
);
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="app-layout">
    <aside class="sidebar">
      <a href="#/workouts" class="brand" aria-label="The Workout Tracker home"
        ><span class="brand-mark"
          ><Dumbbell :size="20" aria-hidden="true" /></span
        ><span class="brand-name">The Workout<br />Tracker</span></a
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
            v-if="item.id === 'workouts' && history.length"
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
          <ArrowDownToLine :size="17" />Install The Workout Tracker
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
          <span v-if="!online" class="connection accent"
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
            <Settings2 :size="15" aria-hidden="true" />
          </button>
        </div>
      </header>
      <main id="main" class="main">
        <div v-if="state.kind === 'loading'" class="empty-state loading-state">
          <div class="brand-mark">
            <Dumbbell :size="20" aria-hidden="true" />
          </div>
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
            @click="
              download(state.rawExport, 'the-workout-tracker-recovery.json')
            "
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
            <span>A new version of The Workout Tracker is ready.</span
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

          <WorkoutsPage
            v-if="page === 'workouts'"
            :routines="routines"
            :history="history"
            :active="active"
            :exercises="snapshot.exercises"
            :saving="saving"
            @start="dialogs?.startWorkout($event)"
            @edit="dialogs?.editRoutine($event)"
            @detail="dialogs?.showDetail($event)"
            @repeat="dialogs?.repeatWorkout($event)"
            @convert="dialogs?.convertWorkout($event)"
            @navigate="navigate"
          />
          <TrainingPage
            v-else-if="page === 'session'"
            :workspace="workspace"
            @finish="dialogs?.openFinish()"
            @pick="dialogs?.openPicker()"
            @options="dialogs?.showOptions($event)"
            @confirm="dialogs?.confirm($event)"
            @navigate="navigate"
          />
          <ExercisesPage
            v-else-if="page === 'exercises'"
            :exercises="workspace.catalog.value"
            @create="dialogs?.openCreateExercise()"
          />
          <ProgressPage
            v-else-if="page === 'progress'"
            v-model:exercise="progressExercise"
            :history="history"
            @navigate="navigate"
          />
          <footer class="main-footer">
            <span class="save-status" role="status">{{
              saving ? "Saving…" : message || ""
            }}</span>
          </footer>
        </template>
      </main>
    </div>
    <TrainingDock
      v-if="page === 'session' && active"
      :workspace="workspace"
      @finish="dialogs?.openFinish()"
      @pick="dialogs?.openPicker()"
    />
    <nav v-else class="mobile-nav" aria-label="Mobile navigation">
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

  <WorkoutDialogs ref="dialogs" :workspace="workspace" @navigate="navigate" />
  <WorkoutSettings v-model:open="settingsOpen" :workspace="workspace">
    <section class="settings-section">
      <div class="settings-row">
        <span
          >The Workout Tracker on your home screen<small
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
  </WorkoutSettings>
</template>
