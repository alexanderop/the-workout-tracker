<script setup lang="ts">
const sections = [
  { name: "Pages", id: "pages-exercises", variant: "exercises.all", description: "Review complete screens with the real navigation and named starting states." },
  { name: "Flows", id: "flows-first-workout", variant: "flows.first-workout", description: "Start a workout, log sets and review what you finished." },
  { name: "Foundations", id: "foundations-colors", variant: "palette", description: "Check the colors, type, spacing and motion behind the product." },
  { name: "Components", id: "components-button", variant: "usage", description: "Inspect reusable controls and their interaction states." },
];
function storyLink(id: string, variant: string): string {
  const query = variant ? `?variantId=${encodeURIComponent(variant)}` : "";
  return `${import.meta.env.BASE_URL}#/story/${id}${query}`;
}
</script>

<template>
  <Story id="workspace" title="00 Start here/00 Workspace guide">
    <Variant id="welcome" title="Welcome">
      <main class="workspace-guide">
        <p class="eyebrow">THE WORKOUT TRACKER</p>
        <h1>The product, ready to review.</h1>
        <p>Open a screen, choose a state and try it. Pages and flows run the actual application with sample workouts.</p>
        <nav aria-label="Explore the design workspace" class="workspace-sections">
          <a v-for="section in sections" :key="section.id" :href="storyLink(section.id, section.variant)" target="_top">
            <h2>{{ section.name }}</h2>
            <p>{{ section.description }}</p>
            <span aria-hidden="true">Open →</span>
          </a>
        </nav>
        <section class="stack" aria-labelledby="workspace-review">
          <h2 id="workspace-review">Review a screen</h2>
          <ol>
            <li>Choose a page and its named starting state in the sidebar.</li>
            <li>Use the viewport menu for phone or desktop. The app fills that viewport.</li>
            <li>Open Controls for the example guide, journey steps and Reset example.</li>
            <li>Share the story URL to give someone the same starting state.</li>
          </ol>
        </section>
        <section class="stack" aria-labelledby="workspace-states">
          <h2 id="workspace-states">Know what you are reviewing</h2>
          <p>Pages and Flows show implemented screens. Components and Patterns let you inspect smaller pieces. Explorations holds proposals, references and experiments, each labeled separately.</p>
          <p>Sample changes stay inside the open example. Reset or reload restores its starting state. A shared link opens the original example, not your edits.</p>
          <p>Installation and offline use need review in the installed app. Settings can download sample backups; imports and deletion affect only the example. Preview data does not persist between visits.</p>
        </section>
      </main>
    </Variant>
  </Story>
</template>

<style scoped>
.workspace-guide { display: grid; gap: 28px; max-width: 860px; line-height: 1.6; }
.workspace-guide h1 { font-size: clamp(28px, 4vw, 42px); line-height: 1.15; max-width: 620px; }
.workspace-guide h2 { font-size: 20px; }
.workspace-guide p, .workspace-guide h2 { margin: 0; }
.workspace-sections { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.workspace-sections a { display: grid; gap: 12px; padding: 24px; border: 1px solid var(--ui-border); border-radius: var(--ui-radius); color: var(--ui-foreground); text-decoration: none; }
.workspace-sections a:hover { background: var(--ui-secondary); }
.workspace-sections a:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 4px; }
.workspace-sections p { color: var(--ui-muted-foreground); font-size: 14px; }
.workspace-sections span { color: var(--ui-primary); }
.workspace-guide li + li { margin-top: 12px; }
@media (max-width: 540px) { .workspace-sections { grid-template-columns: 1fr; } }
</style>

<docs lang="md">
# Product design workspace

Use Pages for full screens and Flows for connected journeys. Their sample data is isolated from your journal.
The Controls panel supplies Reset example and a separate-tab link. The canvas stays entirely available to the app.
Copy the story address to share its named starting state. Interactive edits are not included in that link.

Explorations contains design proposals and research. Its examples are not claims about implemented behavior.
The repository's design contract and production components define the implemented product.
</docs>
