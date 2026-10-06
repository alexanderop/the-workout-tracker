<script setup lang="ts">
import {
  BaseButtonIcon,
  BaseButton,
  BaseLoading,
  BaseSheet,
  BaseInstallInstructions,
} from "@form/ui";
import { computed, ref, useTemplateRef, watch } from "vue";
import {
  ArrowDownToLine,
  ChevronRight,
  CircleHelp,
  Dumbbell,
  Library,
  Settings,
  ShieldCheck,
  TrendingUp,
  WifiOff,
  X,
} from "@lucide/vue";
import {
  useWorkoutWorkspace,
  TrainingDock,
  WorkoutDialogs,
  download,
} from "./features/workouts/ui";
import { RouterLink, RouterView } from "vue-router";
import { useWorkoutNavigation } from "./app/useWorkoutNavigation";
import { provideWorkoutRouteContext } from "./app/workoutRouteContext";
import type { Workouts, DraftJournal } from "./features/workouts";
import { useWorkoutClock } from "./app/useWorkoutClock";
import type { WorkoutEnvironment } from "./app/environment";
const {
  workouts,
  drafts,
  environment,
  initialExerciseSearch = "",
} = defineProps<{
  workouts: Workouts;
  drafts: DraftJournal;
  environment: WorkoutEnvironment;
  initialExerciseSearch?: string;
}>();
const clock = useWorkoutClock(environment.now);
const workspace = useWorkoutWorkspace(workouts, drafts, clock.now);
watch(() => workspace.active.value?.rest?.endsAt, clock.refresh);
const { state, snapshot, saving, message, error, history, active } = workspace;
const dialogs = useTemplateRef<InstanceType<typeof WorkoutDialogs>>("dialogs");
const main = useTemplateRef<HTMLElement>("main");
function focusTemplates(event: Event) {
  const trigger =
    main.value?.querySelector<HTMLButtonElement>("#workout-templates");
  if (!trigger) return;
  event.preventDefault();
  trigger.focus({ preventScroll: true });
}
function focusMain() {
  main.value?.focus({ preventScroll: true });
}
const {
  page,
  workoutView,
  destination,
  navigate,
  selectWorkoutView,
  workoutsHref,
  prepareLinkNavigation,
} = useWorkoutNavigation(message, error, focusMain);
const progressExercise = ref("");
const {
  installOpen,
  installing,
  canInstall,
  platform,
  requestInstall,
  online,
  installed,
  offlineReady,
  needRefresh,
  installMessage,
  install,
  updateServiceWorker,
} = environment.useInstallation();
provideWorkoutRouteContext({
  initialExerciseSearch,
  workspace,
  dialogs,
  progressExercise,
  navigate,
  selectWorkoutView,
  workoutsHref,
  installation: {
    installed,
    offlineReady,
    message: installMessage,
    install,
  },
});
const navigation = [
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "exercises", label: "Exercises", icon: Library },
  { id: "progress", label: "Progress", icon: TrendingUp },
] as const;
const mobileNavigation = [
  ...navigation,
  { id: "settings", label: "Settings", icon: Settings },
] as const;
function reload() {
  window.location.reload();
}
const title = computed(() => {
  if (page.value === "session") return "Active workout";
  if (page.value === "settings") return "Settings";
  return navigation.find((item) => item.id === page.value)?.label ?? "Workouts";
});
</script>

<template>
  <a class="skip-link" href="#main" @click.prevent="focusMain"
    >Skip to content</a
  >
  <div class="app-layout">
    <aside class="sidebar">
      <RouterLink
        :to="destination('workouts')"
        @click="prepareLinkNavigation($event, 'workouts')"
        class="brand"
        aria-label="The Workout Tracker home"
        ><span class="brand-mark"
          ><Dumbbell :size="20" aria-hidden="true" /></span
        ><span class="brand-name">The Workout<br />Tracker</span></RouterLink
      >
      <div class="workspace-label">YOUR TRAINING SPACE</div>
      <nav class="desktop-nav" aria-label="Main navigation">
        <RouterLink
          v-for="item in navigation"
          :key="item.id"
          :to="destination(item.id)"
          @click="prepareLinkNavigation($event, item.id)"
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
          ></RouterLink
        >
      </nav>
      <BaseButton
        unstyled
        v-if="active"
        class="active-sidebar"
        @click="navigate('session')"
      >
        <span class="activity-dot"></span
        ><span
          >Workout in progress<small>{{ active.name }}</small></span
        ><ChevronRight :size="16" />
      </BaseButton>
      <div class="sidebar-bottom">
        <BaseButton
          unstyled
          v-if="!installed"
          class="sidebar-action"
          @click="install"
        >
          <ArrowDownToLine :size="17" aria-hidden="true" /><span
            >Install The Workout Tracker</span
          >
        </BaseButton>
        <div class="local-note">
          <ShieldCheck :size="17" aria-hidden="true" /><span
            >Yours. On this device.</span
          >
        </div>
      </div>
    </aside>

    <div class="workspace">
      <header v-if="(page !== 'workouts' && page !== 'session') || !snapshot || !online" class="topbar">
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
          >
        </div>
      </header>
      <main
        id="main"
        ref="main"
        class="main"
        :class="{
          'journal-ready': snapshot,
          'compact-home': page === 'workouts' && workoutView !== 'history',
        }"
        tabindex="-1"
      >
        <BaseLoading v-if="state.kind === 'loading'" />
        <div
          v-else-if="state.kind === 'unavailable' || state.kind === 'recovery'"
          class="empty-state"
        >
          <ShieldCheck :size="32" />
          <h1>Your data needs attention</h1>
          <p>{{ state.message }}</p>
          <BaseButton
            unstyled
            v-if="state.kind === 'recovery'"
            class="btn secondary"
            @click="
              download(state.rawExport, 'the-workout-tracker-recovery.json')
            "
          >
            Export recovery data</BaseButton
          ><BaseButton unstyled class="btn primary" @click="reload"
            >Try again</BaseButton
          >
        </div>
        <template v-else-if="snapshot">
          <div v-if="error" class="notice" role="alert">
            <CircleHelp :size="18" /><span>{{ error }}</span
            ><BaseButton unstyled class="text-button" @click="reload"
              >Reload</BaseButton
            ><BaseButtonIcon label="Dismiss error" @click="error = ''">
              <X :size="16" />
            </BaseButtonIcon>
          </div>
          <div v-if="needRefresh && !active" class="notice">
            <span>A new version of The Workout Tracker is ready.</span
            ><BaseButton
              unstyled
              class="text-button"
              @click="updateServiceWorker(true)"
            >
              Update app
            </BaseButton>
          </div>
          <RouterView />
          <footer class="main-footer">
            <nav aria-label="Footer navigation">
              <RouterLink
                :to="destination('settings')"
                @click="prepareLinkNavigation($event, 'settings')"
                :aria-current="page === 'settings' ? 'page' : undefined"
                >Settings</RouterLink
              >
            </nav>
            <span class="save-status" role="status">{{
              saving ? "Saving…" : message || ""
            }}</span>
          </footer>
        </template>
      </main>
    </div>
    <TrainingDock
      :workouts-href="workoutsHref"
      v-if="page === 'session' && active"
      :workspace="workspace"
      @finish="dialogs?.openFinish()"
      @pick="dialogs?.openPicker()"
    />
    <nav v-else class="mobile-nav" aria-label="Mobile navigation">
      <RouterLink
        v-for="item in mobileNavigation"
        :key="item.id"
        :to="destination(item.id)"
        @click="prepareLinkNavigation($event, item.id)"
        :class="{
          selected:
            page === item.id || (page === 'session' && item.id === 'workouts'),
        }"
        :aria-current="page === item.id ? 'page' : undefined"
        ><component :is="item.icon" :size="20" aria-hidden="true" /><span>{{
          item.label
        }}</span></RouterLink
      >
    </nav>
  </div>

  <BaseSheet
    :open="installOpen"
    title="Install The Workout Tracker"
    @close="installOpen = false"
  >
    <BaseInstallInstructions
      :platform="platform"
      :can-install="canInstall"
      :busy="installing"
      :installed="installed"
      :message="installMessage"
      @install="requestInstall"
    />
  </BaseSheet>
  <WorkoutDialogs
    ref="dialogs"
    :workspace="workspace"
    :templates-open="page === 'workouts' && workoutView === 'templates'"
    @close-templates="selectWorkoutView('home', 'replace')"
    @template-closed="focusTemplates"
    @navigate="navigate"
    @template-saved="selectWorkoutView('templates', 'replace')"
  />
</template>
