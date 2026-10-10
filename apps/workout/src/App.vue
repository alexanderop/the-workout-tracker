<script setup lang="ts">
import {
  BaseButtonIcon,
  BaseButton,
  BaseLoading,
  BaseSheet,
  BaseInstallInstructions,
} from "@form/ui";
import { computed, onScopeDispose, ref, useTemplateRef, watch } from "vue";
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
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useWorkoutNavigation } from "./app/useWorkoutNavigation";
import { provideWorkoutRouteContext } from "./app/workoutRouteContext";
import type { Workouts, DraftJournal } from "./features/workouts";
import { useWorkoutClock } from "./app/useWorkoutClock";
import { useLanguage } from "./app/useLanguage";
import { provideAppUiText } from "./app/uiText";
import { useTranslation } from "./i18n";
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
useLanguage();
const { t, locale } = useTranslation();
provideAppUiText(t, locale);
const clock = useWorkoutClock(environment.now);
const workspace = useWorkoutWorkspace(workouts, drafts, {
  now: clock.now,
  t,
});
watch(() => workspace.active.value?.rest?.endsAt, clock.refresh);
const {
  state,
  loadFailure,
  snapshot,
  saving,
  message,
  error,
  notice,
  history,
  active,
} = workspace;
const dialogs = useTemplateRef<InstanceType<typeof WorkoutDialogs>>("dialogs");
const router = useRouter();
onScopeDispose(router.beforeEach(() => dialogs.value?.requestLeave() ?? true));
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
} = useWorkoutNavigation(
  workspace.clearMessage,
  () => workspace.fail(t("shell.notice.pageNotOpened"), true),
  focusMain,
);
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
  reloadReady,
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
const navigation = computed(
  () =>
    [
      { id: "workouts", label: t("shell.nav.workouts"), icon: Dumbbell },
      { id: "exercises", label: t("shell.nav.exercises"), icon: Library },
      { id: "progress", label: t("shell.nav.progress"), icon: TrendingUp },
    ] as const,
);
const mobileNavigation = computed(
  () =>
    [
      ...navigation.value,
      { id: "settings", label: t("shell.nav.settings"), icon: Settings },
    ] as const,
);
function reload() {
  window.location.reload();
}
const title = computed(() => {
  if (page.value === "session") return t("shell.nav.session");
  if (page.value === "settings") return t("shell.nav.settings");
  return (
    navigation.value.find((item) => item.id === page.value)?.label ??
    t("shell.nav.workouts")
  );
});
</script>

<template>
  <a class="skip-link" href="#main" @click.prevent="focusMain">{{
    t("shell.skipToContent")
  }}</a>
  <div class="app-layout">
    <aside class="sidebar">
      <RouterLink
        :to="destination('workouts')"
        @click="prepareLinkNavigation($event, 'workouts')"
        class="brand"
        :aria-label="t('shell.brand.home')"
        ><span class="brand-mark"
          ><Dumbbell :size="20" aria-hidden="true" /></span
        ><span class="brand-name"
          >{{ t("shell.brand.first") }}<br />{{ t("shell.brand.second") }}</span
        ></RouterLink
      >
      <div class="workspace-label">{{ t("shell.workspaceLabel") }}</div>
      <nav class="desktop-nav" :aria-label="t('shell.nav.main')">
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
          >{{ t("shell.workoutInProgress")
          }}<small>{{ active.name }}</small></span
        ><ChevronRight :size="16" />
      </BaseButton>
      <div class="sidebar-bottom">
        <BaseButton
          unstyled
          v-if="!installed"
          class="sidebar-action"
          @click="install"
        >
          <ArrowDownToLine :size="17" aria-hidden="true" /><span>{{
            t("shell.installApp")
          }}</span>
        </BaseButton>
        <div class="local-note">
          <ShieldCheck :size="17" aria-hidden="true" /><span>{{
            t("shell.localNote")
          }}</span>
        </div>
      </div>
    </aside>

    <div class="workspace">
      <header
        v-if="
          (page !== 'workouts' && page !== 'session') || !snapshot || !online
        "
        class="topbar"
        :class="{ 'is-offline': !online }"
      >
        <div>
          <span class="muted">{{ t("shell.yourWorkspace") }}</span
          ><span class="slash">/</span><span>{{ title }}</span>
        </div>
        <div class="topbar-right">
          <span v-if="!online" class="connection accent"
            ><WifiOff :size="14" aria-hidden="true" />{{
              t("shell.offline")
            }}</span
          >
        </div>
      </header>
      <main
        id="main"
        ref="main"
        class="main"
        :class="{
          'journal-ready': snapshot && page !== 'exercises',
          'compact-home': page === 'workouts' && workoutView !== 'history',
        }"
        tabindex="-1"
      >
        <BaseLoading
          v-if="state.kind === 'loading'"
          :label="t('shell.loading')"
        />
        <div v-else-if="loadFailure" class="empty-state">
          <ShieldCheck :size="32" />
          <h1>{{ t("shell.loadFailure.title") }}</h1>
          <p>{{ loadFailure.message }}</p>
          <BaseButton
            unstyled
            v-if="loadFailure.recoveryExport"
            class="btn secondary"
            @click="
              download(
                loadFailure.recoveryExport,
                'the-workout-tracker-recovery.json',
              )
            "
          >
            {{ t("shell.loadFailure.export") }}</BaseButton
          ><BaseButton unstyled class="btn primary" @click="reload">{{
            t("shell.loadFailure.tryAgain")
          }}</BaseButton>
        </div>
        <template v-else-if="snapshot">
          <div v-if="error" class="notice" role="alert">
            <CircleHelp :size="18" /><span>{{ error }}</span
            ><BaseButton
              v-if="notice.kind === 'failed' && notice.reload"
              unstyled
              class="text-button"
              @click="reload"
              >{{ t("shell.notice.reload") }}</BaseButton
            ><BaseButtonIcon
              :label="t('shell.notice.dismiss')"
              @click="workspace.clearError()"
            >
              <X :size="16" />
            </BaseButtonIcon>
          </div>
          <div v-if="needRefresh && !active" class="notice" role="status">
            <span>{{ t("shell.notice.updateReady") }}</span
            ><BaseButton
              unstyled
              class="text-button"
              @click="updateServiceWorker(true)"
            >
              {{ t("shell.notice.updateApp") }}
            </BaseButton>
          </div>
          <div v-if="reloadReady && !active" class="notice" role="status">
            <span>{{ t("shell.notice.updated") }}</span
            ><BaseButton unstyled class="text-button" @click="reload">
              {{ t("shell.notice.reloadApp") }}
            </BaseButton>
          </div>
          <RouterView />
          <footer class="main-footer">
            <nav :aria-label="t('shell.nav.footer')">
              <RouterLink
                :to="destination('settings')"
                @click="prepareLinkNavigation($event, 'settings')"
                :aria-current="page === 'settings' ? 'page' : undefined"
                >{{ t("shell.nav.settings") }}</RouterLink
              >
            </nav>
            <span class="save-status" role="status">{{
              saving ? t("shell.saving") : message || ""
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
    <nav v-else class="mobile-nav" :aria-label="t('shell.nav.mobile')">
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
    :title="t('shell.install.title')"
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
