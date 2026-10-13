<script setup lang="ts">
import {
  BaseBackLink,
  BaseButton,
  BaseButtonIcon,
  BaseEmptyState,
  BaseInput,
  BaseListGroup,
  BaseListRow,
  BasePageHeader,
} from "@form/ui";
import { computed, ref, useTemplateRef } from "vue";
import { Plus, ArrowRight, Bookmark, CalendarDays, Search } from "@lucide/vue";
import {
  sessionTotals,
  type Snapshot,
  type Routine,
  type CompletedSession,
} from "../domain";
import { useTranslation } from "../../../i18n";
import SessionRow from "./SessionRow.vue";
import { filterHistory } from "./textSearch";
import WorkoutCalendar from "./WorkoutCalendar.vue";
const {
  routines,
  history: allHistory,
  active,
  saving,
  now,
} = defineProps<{
  routines: Routine[];
  history: CompletedSession[];
  active: Snapshot["active"];
  saving: boolean;
  now: number;
}>();
const emit = defineEmits<{
  start: [id: string | null];
  navigate: [page: "session"];
  detail: [id: string];
}>();
const tab = defineModel<"home" | "history" | "templates">("view", {
  default: "home",
});
const { t } = useTranslation();
const search = ref("");
const calendar =
  useTemplateRef<InstanceType<typeof WorkoutCalendar>>("calendar");
const calendarAction =
  useTemplateRef<InstanceType<typeof BaseButtonIcon>>("calendarAction");
const latest = computed(() => allHistory[0]);
const isFreshJournal = computed(
  () => !active && !routines.length && !allHistory.length,
);
const history = computed(() => filterHistory(allHistory, search.value, t));
</script>
<template>
  <div class="workouts-dashboard">
    <template v-if="tab !== 'history'">
      <BasePageHeader variant="root" :title="t('workouts.home.title')">
        <template #action>
          <BaseButtonIcon
            ref="calendarAction"
            :label="t('workouts.calendar.open')"
            @click="calendar?.open()"
            ><CalendarDays :size="21"
          /></BaseButtonIcon>
        </template>
      </BasePageHeader>
      <WorkoutCalendar
        ref="calendar"
        :sessions="allHistory"
        :now="now"
        :action="() => calendarAction?.$el"
        @detail="emit('detail', $event)"
      />
      <section v-if="active" class="active-workout-card">
        <span class="active-label"
          ><i aria-hidden="true" />{{ t("workouts.home.inProgress") }}</span
        >
        <h2>{{ active.name }}</h2>
        <p>
          {{
            t("workouts.home.activeSummary", {
              exercises: t(
                "workouts.home.exerciseCount",
                active.exercises.length,
              ),
              sets: t(
                "workouts.home.setsLogged",
                sessionTotals(active).completedSets,
              ),
            })
          }}
        </p>
        <BaseButton
          class="continue-workout"
          @click="emit('navigate', 'session')"
          >{{ t("workouts.home.continueWorkout") }}<ArrowRight :size="18"
        /></BaseButton>
      </section>
      <section v-else class="home-start">
        <p v-if="isFreshJournal" class="muted">
          {{ t("workouts.home.firstHint") }}
        </p>
        <BaseButton
          size="lg"
          class="dashboard-start"
          :disabled="saving"
          @click="emit('start', null)"
          ><Plus :size="18" />{{
            isFreshJournal
              ? t("workouts.home.startFirst")
              : t("workouts.home.start")
          }}</BaseButton
        >
      </section>
      <div class="home-lists">
        <BaseListGroup :label="t('workouts.home.latest')">
          <template #action>
            <BaseButton variant="link" size="sm" @click="tab = 'history'">{{
              t("workouts.home.viewHistory")
            }}</BaseButton>
          </template>
          <SessionRow
            v-if="latest"
            :session="latest"
            with-date
            @click="emit('detail', latest.id)"
          />
          <BaseEmptyState
            v-else
            size="compact"
            :heading-level="3"
            :title="t('workouts.home.latestEmpty')"
          />
        </BaseListGroup>
        <BaseListGroup>
          <BaseListRow
            id="workout-templates"
            as="button"
            chevron
            :icon="Bookmark"
            :label="t('workouts.home.templates')"
            :value="String(routines.length)"
            @click="tab = 'templates'"
          />
        </BaseListGroup>
      </div>
    </template>
    <template v-if="tab === 'history'">
      <BasePageHeader variant="detail" :title="t('workouts.history.title')">
        <template #back>
          <BaseBackLink
            as="button"
            :aria-label="t('workouts.history.back')"
            @click="tab = 'home'"
            >{{ t("shell.nav.workouts") }}</BaseBackLink
          >
        </template>
      </BasePageHeader>
      <div v-if="allHistory.length" class="search-field history-search">
        <Search :size="17" /><BaseInput
          v-model="search"
          :aria-label="t('workouts.history.searchLabel')"
          :placeholder="t('workouts.history.searchPlaceholder')"
        />
      </div>
      <BaseEmptyState
        v-if="!allHistory.length"
        :title="t('workouts.history.emptyTitle')"
        :body="t('workouts.history.empty')"
      />
      <BaseListGroup v-else>
        <SessionRow
          v-for="session in history"
          :key="session.id"
          :session="session"
          with-date
          exercises
          @click="emit('detail', session.id)"
        />
        <p v-if="!history.length" class="history-empty muted">
          {{ t("workouts.history.noMatches") }}
        </p>
      </BaseListGroup>
    </template>
  </div>
</template>

<style scoped>
.workouts-dashboard {
  min-width: 0;
}
.active-workout-card {
  margin: var(--space-5) 0;
  padding: var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.active-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--muted);
  font-size: var(--text-xs);
  letter-spacing: 1.5px;
}
.active-label i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}
.active-workout-card h2 {
  margin: var(--space-2) 0 var(--space-1);
  font-size: var(--text-lg);
  font-weight: 500;
  overflow-wrap: anywhere;
}
.active-workout-card p {
  margin: 0;
  color: var(--muted);
  font-size: var(--text-sm);
}
.continue-workout {
  width: 100%;
  margin-block-start: var(--space-3);
  justify-content: space-between;
}
.home-start {
  margin: var(--space-5) 0;
}
.home-start p {
  margin: 0 0 var(--space-3);
  font-size: var(--text-sm);
  line-height: 1.5;
}
.dashboard-start {
  width: 100%;
  min-height: 48px;
}
.home-lists {
  display: grid;
  gap: var(--space-4);
}
.history-search {
  margin-block-end: var(--space-2);
}
.history-empty {
  margin: 0;
  padding: var(--space-4);
}
</style>
