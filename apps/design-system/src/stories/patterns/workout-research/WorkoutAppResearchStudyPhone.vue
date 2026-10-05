<script setup lang="ts">
import { computed, ref } from "vue";
import { BaseButton, BaseInputNumber, BaseSelectNative } from "@form/ui";
import { ArrowRight, Check, Clock3, ChevronLeft, Dumbbell } from "@lucide/vue";
import WorkoutAppResearchStudyPhoneSetTable from "./WorkoutAppResearchStudyPhoneSetTable.vue";
import type { Reference } from "./references";
import { useResearchWorkout } from "./useResearchWorkout";
import "./research.css";

const { reference } = defineProps<{ reference: Reference }>();
const { exercises, selected, exercise, current, setNumber, logged, volume, resting, review, notice, lastId, edit, toggle, logCurrent, undo, next, reset } = useResearchWorkout();
const effort = ref<string | number>("");
const media = ref(true);
const circuit = computed(() => reference.id === "nike" || reference.id === "sweat");
const ledger = computed(() => reference.id === "strong" || reference.id === "hevy");
const consoleLayout = computed(() => reference.id === "jefit" || reference.id === "boostcamp");
const guided = computed(() => reference.id === "freeletics" || reference.id === "sweat");
const nextName = computed(() => exercises.value[(selected.value + 1) % 3]?.name);
function applySuggestion() {
  if (!current.value) return;
  edit(current.value.id, "weight", exercise.value.weight + 2.5);
  edit(current.value.id, "reps", 8);
}
</script>

<template>
      <main class="study-phone" :class="`study-${reference.id}`" :aria-label="`${reference.name} inspired workout`">
        <header class="study-toolbar"><span><Dumbbell :size="17" aria-hidden="true" /> Upper body</span><BaseButton variant="ghost" :disabled="logged.length === 0" @click="review = !review">{{ review ? 'Back' : 'Review' }}</BaseButton></header>
        <template v-if="review">
          <section class="study-review"><Check :size="32" aria-hidden="true" /><h2>Your session so far</h2><strong>{{ logged.length }} / 9</strong><p>sets logged · {{ volume }} kg volume</p><p>This is a preview. No workout has been finished or saved.</p><BaseButton @click="review = false">Back to workout</BaseButton></section>
        </template>
        <template v-else>
          <div v-if="reference.id === 'hevy'" class="study-metrics"><div><small>Duration</small><strong>18:42</strong></div><div><small>Volume</small><strong>{{ volume }} kg</strong></div><div><small>Sets</small><strong>{{ logged.length }}</strong></div></div>
          <div v-else class="study-status"><span><Clock3 :size="13" aria-hidden="true" />18:42</span><span>{{ logged.length }} / 9 sets logged</span></div>
          <progress :value="logged.length" max="9" aria-label="Logged sets" />

          <template v-if="ledger">
            <section v-for="item in exercises" :key="item.name" class="study-exercise-card">
              <header><img v-if="reference.id === 'hevy'" :src="item.image" alt="" /><h2>{{ item.name }}</h2></header>
              <p v-if="reference.id === 'hevy'" class="study-small">Sample note: comfortable setup · Rest 1:30</p>
              <WorkoutAppResearchStudyPhoneSetTable :sets="item.sets" :name="item.name" :previous-weight="item.weight" @edit="edit" @toggle="toggle" />
            </section>
          </template>

          <template v-else-if="reference.id === 'stronglifts'">
            <section v-for="item in exercises" :key="item.name" class="study-circles-card">
              <h2>{{ item.name }}</h2>
              <p>Planned: {{ item.weight }} kg · 3 sets × 8 reps</p>
              <div class="study-circles"><button v-for="(set, setIndex) in item.sets" :key="set.id" :class="{ 'is-logged': set.logged }" :aria-label="`${set.logged ? 'Undo' : 'Log'} ${item.name} set ${setIndex + 1}`" @click="toggle(set.id)"><Check v-if="set.logged" :size="17" aria-hidden="true" /><span>{{ set.reps }}</span></button></div>
              <details class="study-details"><summary>Edit {{ item.name }} values</summary><WorkoutAppResearchStudyPhoneSetTable :sets="item.sets" :name="item.name" :previous-weight="item.weight" @edit="edit" @toggle="toggle" /></details>
            </section>
          </template>

          <template v-else>
            <nav v-if="!guided" class="study-exercise-nav" aria-label="Select exercise"><button v-for="(item, index) in exercises" :key="item.name" :aria-pressed="selected === index" @click="selected = index">{{ index + 1 }}. {{ item.name }}</button></nav>
            <div v-if="reference.id === 'boostcamp'" class="study-program"><span class="research-kicker">SAMPLE PROGRAM</span><h2>Week 3 · Day 2</h2><p>Upper-body strength · 3 × 8 · RPE 8 target</p></div>
            <div v-if="reference.id === 'sweat'" class="study-circuit-header"><span>CIRCUIT 1</span><strong>Round {{ setNumber || 3 }} / 3</strong><span>Sample · self-paced</span></div>
            <div v-if="reference.id === 'nike'" class="study-whiteboard"><p class="research-kicker">STRENGTH CIRCUIT · 3 ROUNDS</p><h2>Move at your pace.</h2><ol><li v-for="(item, index) in exercises" :key="item.name"><button :aria-pressed="selected === index" @click="selected = index"><span>{{ item.name }}</span><strong>8 reps</strong></button></li></ol></div>
            <div v-if="reference.id === 'freeletics'" class="study-guided-top"><button class="study-link" @click="selected = (selected + 2) % 3"><ChevronLeft :size="16" /> Previous</button><span>Movement {{ selected + 1 }} / 3</span></div>

            <section class="study-current">
              <div v-if="reference.id === 'fitbod' || guided || (reference.id === 'jefit' && media)" class="study-media"><img :src="exercise.image" alt="" /><span>Equipment illustration · demo video omitted</span></div>
              <button v-if="reference.id === 'jefit'" class="study-link" @click="media = !media">{{ media ? 'Hide illustration' : 'Show illustration' }}</button>
              <p class="research-kicker">{{ current ? `SET ${setNumber} OF 3` : 'EXERCISE COMPLETE' }}</p><h2>{{ exercise.name }}</h2>
              <div v-if="reference.id === 'alpha'" class="study-recommendation"><span class="research-kicker">SAMPLE SUGGESTION · NOT PERSONALIZED</span><strong>{{ exercise.weight + 2.5 }} kg × 8</strong><p>Previous: {{ exercise.weight }} kg × 8 · Target: 2 reps in reserve</p><BaseButton variant="secondary" :disabled="!current" @click="applySuggestion">Use suggestion in draft</BaseButton></div>
              <template v-if="consoleLayout">
                <WorkoutAppResearchStudyPhoneSetTable :sets="exercise.sets" :name="exercise.name" :previous-weight="exercise.weight" :prescription="reference.id === 'boostcamp'" @edit="edit" @toggle="toggle" />
              </template>
              <template v-else-if="current">
                <div v-if="reference.id === 'freeletics'" class="study-big-target"><strong>{{ current.reps }}</strong><span>repetitions</span></div>
                <p v-if="reference.id === 'fitbod'" class="study-small">3 sets · Rest 1:30 · Sample previous: {{ exercise.weight }} kg × 8</p>
                <div class="study-inputs"><label>Weight · kg<BaseInputNumber v-model="current.weight" title="Weight" label="Current set weight" unit="kg" :decimals="2" /></label><label>Repetitions<BaseInputNumber v-model="current.reps" title="Repetitions" label="Current set repetitions" :min="1" /></label></div>
              </template>
              <label v-if="reference.id === 'alpha' || reference.id === 'fitbod' || reference.id === 'boostcamp'" class="study-effort">{{ reference.id === 'boostcamp' ? 'Effort · RPE (optional)' : 'Reps in reserve (optional)' }}<BaseSelectNative v-model="effort" aria-label="Sample effort rating"><option value="">Not recorded</option><option v-for="value in (reference.id === 'boostcamp' ? ['6', '7', '8', '9', '10'] : ['0', '1', '2', '3', '4+'])" :key="value" :value="value">{{ value }}</option></BaseSelectNative></label>
              <p v-if="reference.id === 'sweat'" class="study-up-next"><span>UP NEXT</span><strong>{{ nextName }}</strong><small>8 repetitions</small></p>
              <div v-if="resting && (guided || reference.id === 'jefit')" class="study-rest-hero"><small>REST · PAUSED PREVIEW</small><strong>01:30</strong><BaseButton @click="next(circuit)">Continue <ArrowRight :size="16" /></BaseButton></div>
              <BaseButton v-else-if="current" class="study-log" @click="logCurrent">{{ guided ? 'Complete set' : 'Log set' }} {{ setNumber }} <Check :size="16" /></BaseButton>
              <BaseButton v-else-if="logged.length < 9" class="study-log" @click="next(circuit)">Next exercise <ArrowRight :size="16" /></BaseButton>
              <p v-else class="study-complete">All sets logged. Ready to review.</p>
            </section>
          </template>
          <aside v-if="resting && !guided && reference.id !== 'jefit'" class="study-rest-strip"><span><Clock3 :size="16" /><strong>01:30</strong><small>Rest · paused preview</small></span><BaseButton variant="secondary" @click="next(circuit)">End rest</BaseButton></aside>
        </template>
        <footer class="study-phone-footer"><p role="status">{{ notice }}</p><BaseButton v-if="lastId !== undefined" variant="ghost" @click="undo">Undo last log</BaseButton><BaseButton variant="ghost" @click="reset">Reset sample</BaseButton></footer>
      </main>
</template>
