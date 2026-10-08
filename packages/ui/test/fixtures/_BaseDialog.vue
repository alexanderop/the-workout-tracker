<script setup lang="ts">
import { ref } from "vue";
import { DialogRoot } from "reka-ui";
import BaseButton from "../../src/button/BaseButton.vue";
import BaseInput from "../../src/input/BaseInput.vue";
import BaseDialogTrigger from "../../src/dialog/BaseDialogTrigger.vue";
import BaseDialogContent from "../../src/dialog/BaseDialogContent.vue";
import BaseDialogHeader from "../../src/dialog/BaseDialogHeader.vue";
import BaseDialogTitle from "../../src/dialog/BaseDialogTitle.vue";
import BaseDialogDescription from "../../src/dialog/BaseDialogDescription.vue";
import BaseDialogFooter from "../../src/dialog/BaseDialogFooter.vue";
import BaseDialogClose from "../../src/dialog/BaseDialogClose.vue";

// The README's composition: BaseDialog is Reka's DialogRoot re-exported.
const open = ref(false);
const name = ref("Push day");
</script>

<template>
  <main>
    <DialogRoot v-model:open="open">
      <BaseDialogTrigger as-child>
        <BaseButton type="button">Edit workout</BaseButton>
      </BaseDialogTrigger>
      <BaseDialogContent>
        <BaseDialogHeader>
          <BaseDialogTitle>Edit workout</BaseDialogTitle>
          <BaseDialogDescription>
            Changes apply to your next session.
          </BaseDialogDescription>
        </BaseDialogHeader>
        <BaseInput v-model="name" aria-label="Workout name" />
        <BaseDialogFooter>
          <BaseDialogClose as-child>
            <BaseButton type="button" variant="outline">Done</BaseButton>
          </BaseDialogClose>
        </BaseDialogFooter>
      </BaseDialogContent>
    </DialogRoot>
    <output data-testid="open-state">{{ open }}</output>
  </main>
</template>

<style scoped>
/* Consumers own the page surface; use the themed one, as the app does. */
main {
  background: var(--ui-background);
  color: var(--ui-foreground);
}
</style>
