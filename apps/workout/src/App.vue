<script setup lang="ts">
import {
  BaseActions,
  BaseButton,
  BaseEmptyState,
  BaseLoading,
  BaseNotice,
  BaseSheet,
  BaseInstallInstructions,
} from "@form/ui";
import { computed, onScopeDispose, ref, useTemplateRef, watch } from "vue";
import {
  ArrowDownToLine,
  ChevronRight,
  Dumbbell,
  Library,
  Settings,
  ShieldCheck,
  TrendingUp,
  WifiOff,
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
// A save confirmation belongs to one event: it ends when the route changes,
// unless it names the page being entered (Finish posts one for Workouts home).
watch(page, workspace.enterPage, { flush: "sync" });
// The footer line is ambient save feedback. A workout session has its own: the
// training notice names each event and the rest panel shows the save state.
const saveStatus = computed(() => {
  if (page.value === "session") return "";
  return saving.value ? t("shell.saving") : message.value;
});
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
        v-if="active"
        variant="ghost"
        size="row"
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
          v-if="!installed"
          variant="ghost"
          size="row"
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
        v-if="page !== 'session' || !snapshot || !online"
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
          'tab-column': page !== 'session',
        }"
        tabindex="-1"
      >
        <BaseLoading
          v-if="state.kind === 'loading'"
          :label="t('shell.loading')"
        />
        <BaseEmptyState
          v-else-if="loadFailure"
          :title="t('shell.loadFailure.title')"
          :body="loadFailure.message"
          :heading-level="1"
        >
          <template #icon><ShieldCheck :size="32" /></template>
          <template #action>
            <BaseActions>
              <BaseButton
                v-if="loadFailure.recoveryExport"
                variant="secondary"
                @click="
                  download(
                    loadFailure.recoveryExport,
                    'the-workout-tracker-recovery.json',
                  )
                "
              >
                {{ t("shell.loadFailure.export") }}</BaseButton
              ><BaseButton @click="reload">{{
                t("shell.loadFailure.tryAgain")
              }}</BaseButton>
            </BaseActions>
          </template>
        </BaseEmptyState>
        <template v-else-if="snapshot">
          <BaseNotice
            v-if="error"
            class="shell-notice"
            tone="danger"
            :dismiss-label="t('shell.notice.dismiss')"
            @dismiss="workspace.clearError()"
          >
            {{ error }}
            <template v-if="notice.kind === 'failed' && notice.reload" #action>
              <BaseButton variant="link" size="sm" @click="reload">{{
                t("shell.notice.reload")
              }}</BaseButton>
            </template>
          </BaseNotice>
          <BaseNotice v-if="needRefresh && !active" class="shell-notice">
            {{ t("shell.notice.updateReady") }}
            <template #action>
              <BaseButton
                variant="link"
                size="sm"
                @click="updateServiceWorker(true)"
                >{{ t("shell.notice.updateApp") }}</BaseButton
              >
            </template>
          </BaseNotice>
          <BaseNotice v-if="reloadReady && !active" class="shell-notice">
            {{ t("shell.notice.updated") }}
            <template #action>
              <BaseButton variant="link" size="sm" @click="reload">{{
                t("shell.notice.reloadApp")
              }}</BaseButton>
            </template>
          </BaseNotice>
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
            <span class="save-status" role="status">{{ saveStatus }}</span>
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
