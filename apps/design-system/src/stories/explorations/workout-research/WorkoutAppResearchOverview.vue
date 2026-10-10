<script setup lang="ts">
import { references } from "./references";
import "./research.css";
</script>
<template>
  <main class="research-page">
    <div class="research-overview">
      <header class="study-heading">
        <p class="research-kicker">
          RESEARCH → INTERACTIVE DESIGN · 4 OCTOBER 2026
        </p>
        <h1>Ten ways to stay in your workout.</h1>
        <p>Choose a named variant in Histoire to try its logging flow.</p>
      </header>
      <p class="research-intro">
        A purposeful selection of ten established workout apps, not a verified
        global top-ten ranking. Strength loggers are the closest peers; guided
        training apps offer contrasting formats. All previews use the same three
        exercises, nine sets and our existing palette so the comparison is about
        structure and interaction.
      </p>
      <section class="research-shortlist">
        <h2>Start with Hevy, StrongLifts and Fitbod.</h2>
        <p>
          <strong>Hevy:</strong> the strongest balance of overview and entry for
          our journal. <strong>StrongLifts:</strong> explore how much faster
          large set targets feel. <strong>Fitbod:</strong> compare a focused
          exercise screen. My proposed direction is Hevy’s card structure with
          larger completion targets and a compact persistent rest strip.
        </p>
        <p>
          Keep recommendations and effort ratings optional. Circuit players are
          worth studying, but adopting them would change our product’s training
          model.
        </p>
      </section>
      <div class="research-grid">
        <article
          v-for="(item, index) in references"
          :key="item.id"
          class="research-reference-card"
        >
          <span class="research-kicker"
            >{{ String(index + 1).padStart(2, "0") }} · DESIGN REFERENCE</span
          >
          <h2>{{ item.name }}</h2>
          <h3>{{ item.pattern }}</h3>
          <p>{{ item.observed }}</p>
          <p><strong>Good for:</strong> {{ item.benefit }}</p>
          <p><strong>Tradeoff:</strong> {{ item.cost }}</p>
          <a
            v-for="source in item.sources"
            :key="source.url"
            :href="source.url"
            target="_blank"
            rel="noreferrer"
            >{{ source.label }} ↗</a
          >
        </article>
      </div>
      <section class="research-shortlist">
        <h2>Compare these four moments</h2>
        <p>
          1. Find your current set. 2. Change 60 kg to 62.5 kg without logging.
          3. Log it and see what happens during rest. 4. Undo the log and review
          your progress.
        </p>
        <p>
          These are source-informed interpretations, not exact replicas or
          user-tested conclusions. No accounts, storage, coaching algorithms,
          working videos or live timers are connected. Sources and evidence
          limitations appear next to every preview. Optional effort ratings are
          illustrative local fields.
        </p>
      </section>
    </div>
  </main>
</template>
