<script setup lang="ts">
// Stands in for any screen that fails while rendering a workout. The message
// is the kind of text an error could carry; diagnostics must never repeat it.
throw new Error("Bench press 100 kg is private workout content");
</script>

<template>
  <p>Never rendered</p>
</template>
