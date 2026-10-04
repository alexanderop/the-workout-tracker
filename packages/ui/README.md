# Form UI

Private Vue 3 component library for the Form workspace. Requires Vue 3.5 or later within major version 3. Consumers need a Vue-aware bundler; this package exports source rather than a precompiled distribution.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Sheet } from "@form/ui";
import "@form/ui/tokens.css";

const open = ref(false);
</script>

<template>
  <button @click="open = true">Preferences</button>
  <Sheet :open="open" title="Preferences" @close="open = false">
    <p>Your content</p>
  </Sheet>
</template>
```

`Sheet` supports `open`, `title`, optional `description`, optional `wide`, the default slot, and a `close` event. It uses Reka UI for dialog semantics, keyboard dismissal and focus trapping, and returns focus to its opener. Its responsive styles are included in the component. Import the token stylesheet once in your entry point; consumers may override its CSS variables for theming. Application resets and fonts remain the consumer's responsibility.

Use `pnpm --filter @form/ui typecheck` and `pnpm --filter @form/ui test:browser` from the repository root. Browser tests run independently of the workout application and its styles. Add exports explicitly in `src/index.ts`; do not import workout types or storage here.
