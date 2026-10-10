<script setup lang="ts">
import type { Reference } from "./references";
import WorkoutAppResearchStudyPhone from "./WorkoutAppResearchStudyPhone.vue";
import "./research.css";
const { reference } = defineProps<{ reference: Reference }>();
</script>

<template>
  <div class="research-page">
    <header class="study-heading">
      <p class="research-kicker">ACTIVE WORKOUT STUDY · {{ reference.name }}</p>
      <h1>{{ reference.pattern }}</h1>
      <p>Inspired by {{ reference.name }} · our palette · sample session</p>
    </header>
    <div class="study-layout">
      <WorkoutAppResearchStudyPhone :reference="reference" />

      <aside class="study-rationale">
        <p class="research-kicker">WHAT WE ARE COMPARING</p>
        <h2>{{ reference.name }}</h2>
        <h3>Documented pattern</h3>
        <p>{{ reference.observed }}</p>
        <h3>Our interpretation</h3>
        <p>{{ reference.adaptation }}</p>
        <h3>Why choose this?</h3>
        <p>{{ reference.benefit }}</p>
        <h3>Tradeoff</h3>
        <p>{{ reference.cost }}</p>
        <details open>
          <summary>Evidence & limitations</summary>
          <p>{{ reference.evidence }}</p>
          <ul>
            <li v-for="source in reference.sources" :key="source.url">
              <a :href="source.url" target="_blank" rel="noreferrer"
                >{{ source.label }} ↗</a
              >
            </li>
          </ul>
          <p>
            Research checked 4 October 2026. Public documentation, not
            authenticated app use. No exact ranking, copied branding, working
            video or real AI guidance. Timers are paused samples. Effort is a
            local illustrative field, not saved per set.
          </p>
        </details>
      </aside>
    </div>
  </div>
</template>
