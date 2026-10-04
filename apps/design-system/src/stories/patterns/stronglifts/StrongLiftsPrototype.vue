<script setup lang="ts">
import { ref } from "vue";
import { Button, Sheet } from "@form/ui";
import { ArrowUpRight, RotateCcw, Timer } from "@lucide/vue";
import StrongLiftsPrototypeExerciseList from "./StrongLiftsPrototypeExerciseList.vue";
import StrongLiftsPrototypeExercisePicker from "./StrongLiftsPrototypeExercisePicker.vue";
import StrongLiftsPrototypeSetEditor from "./StrongLiftsPrototypeSetEditor.vue";
import StrongLiftsPrototypeWeightEditor from "./StrongLiftsPrototypeWeightEditor.vue";
import { useCircleWorkout, type CircleExercise, type CircleSet, type Scenario } from "./useCircleWorkout";
import "./stronglifts.css";
const { scenario = "fresh" } = defineProps<{ scenario?: Scenario }>();
const { exercises, active, completed, total, add, configure, logged, volume, remaining, rest, fast, notice, tap, save, clear, reset } = useCircleWorkout(scenario);
const adding = ref(false);
const editing = ref(false);
function addExercise(name: string) { add(name); adding.value = false; weightExercise.value = exercises.value.find(exercise => exercise.name === name) ?? null; }
const selected = ref<{ set: CircleSet; title: string } | null>(null);
const weightExercise = ref<CircleExercise | null>(null);
const finishing = ref(false);
const finished = ref(false);
function clock(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
function saveSet(weight: number, reps: number) {
  if (!selected.value) return;
  save(selected.value.set, weight, reps);
  selected.value = null;
}
function clearSet() {
  if (!selected.value) return;
  clear(selected.value.set);
  selected.value = null;
}
function saveWeight(weight: number, reps: number, count: number) {
  if (!weightExercise.value) return;
  configure(weightExercise.value, weight, reps, count);
  weightExercise.value = null;
}
function finish() {
  rest.value = null;
  finishing.value = false;
  finished.value = true;
}
function requestFinish() {
  if (logged.value === total.value) { finish(); return; }
  finishing.value = true;
}
function restart() { adding.value = false; reset(); finished.value = false; editing.value = false; }
</script>
<template>
  <main class="sl-study">
    <header class="sl-intro"><p class="sl-eyebrow">FORM / INTERACTION STUDY 01</p><h1>Less typing.<br />More lifting.</h1><p>A StrongLifts-inspired workout you can actually try.</p></header>
    <div class="sl-layout">
      <section class="sl-phone" aria-label="Interactive workout prototype">
        <header class="sl-top"><span class="sl-brand">FORM <small>WORKOUT A</small></span><button class="sl-text-action" @click="requestFinish">Finish</button></header>
        <div v-if="finished" class="sl-summary">
          <p class="sl-eyebrow">SESSION COMPLETE</p><h2>You showed up.</h2><strong>{{ logged }} / {{ total }} sets</strong><p>{{ volume.toLocaleString() }} kg lifted · {{ total - logged }} sets skipped</p><p>Demo summary only. Nothing is saved.</p><Button @click="finished = false">Back to workout</Button><Button variant="ghost" @click="restart">Start again</Button>
        </div>
        <template v-else>
          <div class="sl-session"><div><p class="sl-eyebrow">SUNDAY, 4 OCTOBER</p><h2>Workout A</h2></div><span v-if="logged">{{ logged }}<small> / {{ total }} sets</small></span><span v-else>{{ exercises.length }}<small> {{ exercises.length === 1 ? 'exercise' : 'exercises' }}</small></span></div>
          <div v-if="logged" class="sl-progress" role="progressbar" aria-label="Logged sets" :aria-valuenow="logged" :aria-valuemax="Math.max(1, total)" :aria-valuemin="0"><span :style="{ width: `${total ? logged / total * 100 : 0}%` }" /></div>
          <div v-if="!logged && total" class="sl-beginning">Ready when you are. Check your weights, then tap a circle after your first set.</div>
          <StrongLiftsPrototypeExerciseList :active="active" :completed="completed" :editing="editing" @weight="weightExercise = $event" @tap="tap" @edit="(set, index, exercise) => selected = { set, title: `${exercise.name} · Set ${index + 1}` }" @add="adding = true" @finish="requestFinish" />
          <div v-if="active.length" class="sl-helper"><p>{{ editing ? 'Choose any circle to edit its values.' : 'Tap to log target reps. Tap again for fewer.' }}</p><button class="sl-text-action" :aria-pressed="editing" @click="editing = !editing">{{ editing ? 'Done editing' : 'Edit sets' }}</button></div>
          <footer class="sl-bottom">
            <div v-if="rest" class="sl-rest"><div class="sl-rest-heading"><Timer :size="19" /><strong>{{ remaining ? clock(remaining) : 'Ready' }}</strong><span>{{ rest.preview ? 'Fast demo' : `Rest ${rest.duration / 60} min` }}</span><button class="sl-text-action" @click="rest = null">{{ remaining ? 'Skip' : 'Dismiss' }}</button></div><progress :value="rest.duration - remaining" :max="rest.duration" aria-label="Rest elapsed" /><p>{{ remaining ? 'Take a breath. Your next set can wait.' : 'Rest complete. Start when you feel ready.' }}</p></div>
            <div v-else-if="active.length" class="sl-idle"><Timer :size="20" /><p>{{ logged ? 'Your rest timer starts with the next set.' : 'Log your first set to start resting.' }}</p></div>
            <div class="sl-bottom-meta"><span>{{ volume.toLocaleString() }} kg lifted</span><span>Strength workout</span></div>
          </footer>
        </template>
        <span class="sl-sr" role="status">{{ notice }}</span>
      </section>
      <aside class="sl-notes">
        <p class="sl-eyebrow">TRY THE INTERACTION</p><h2>One tap.<br />The whole workout.</h2>
        <ol><li>Tap an exercise’s prescription to configure sets, reps and weight. Tap a circle to log its target.</li><li>Tap it again. It becomes four reps and the rest target extends.</li><li>Hold a circle, right-click it, or use Edit sets to correct weight or reps.</li><li>Complete every planned circle: that exercise moves to Completed below. Add another exercise at any time.</li></ol>
        <div class="sl-demo-controls"><label><input v-model="fast" type="checkbox" /> Fast timer preview (6 / 10 seconds)</label><p>Applies to the next logged or corrected set. Normal mode uses 3 / 5 minutes.</p><Button variant="secondary" @click="restart"><RotateCcw :size="15" /> Reset sample</Button></div>
        <details class="sl-evidence"><summary>What matches StrongLifts?</summary><p>Official screenshots show compact exercise rows, five circles and a bottom timer. First tap logs the target; more taps reduce reps. A hold opens individual-set editing. Zero is an attempted set; blank means skipped.</p><p>Our choices: adding exercises during a session, moving fully logged exercises into a reviewable Completed section, purple palette, target/reps labels, visible editing, explicit clear at zero, countdown display and a manual finish. Weight changes apply only to unlogged sets. These details are interpretations, not verified app behavior.</p><p>No persistence, notifications, warm-ups, progression rules, idle pause or automatic finish-on-navigation. This is an interactive study, not an installed-app replica.</p><a href="https://support.stronglifts.com/article/63-log-workouts" target="_blank" rel="noreferrer">Logging guide <ArrowUpRight :size="14" /></a><a href="https://support.stronglifts.com/article/39-timer" target="_blank" rel="noreferrer">Timer guide <ArrowUpRight :size="14" /></a><a href="https://support.stronglifts.com/article/8-change-weight" target="_blank" rel="noreferrer">Weight editing <ArrowUpRight :size="14" /></a><a href="https://stronglifts.com/app/" target="_blank" rel="noreferrer">Official interface screenshots <ArrowUpRight :size="14" /></a></details>
      </aside>
    </div>
    <StrongLiftsPrototypeExercisePicker v-if="adding" :existing="exercises.map(exercise => exercise.name)" @close="adding = false" @add="addExercise" />
    <StrongLiftsPrototypeSetEditor v-if="selected" :key="selected.set.id" :set="selected.set" :title="selected.title" @close="selected = null" @save="saveSet" @clear="clearSet" />
    <StrongLiftsPrototypeWeightEditor v-if="weightExercise" :key="weightExercise.name" :exercise="weightExercise" @close="weightExercise = null" @save="saveWeight" />
    <Sheet :open="finishing" title="Finish this workout?" :description="`${logged} ${logged === 1 ? 'set' : 'sets'} logged. ${total - logged} unlogged sets will be skipped.`" @close="finishing = false"><div class="sl-editor"><Button @click="finish">Finish with {{ logged }} {{ logged === 1 ? 'set' : 'sets' }}</Button><Button variant="secondary" @click="finishing = false">Keep training</Button></div></Sheet>
  </main>
</template>
