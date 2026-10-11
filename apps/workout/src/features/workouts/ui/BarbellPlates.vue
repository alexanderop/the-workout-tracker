<script setup lang="ts">
import { computed } from "vue";
import { loadBarbell, type Barbell } from "../domain";
import { useFormat, useTranslation } from "../../../i18n";

const { totalKg, barbell } = defineProps<{
  /** The weight being entered, or null while the draft is not a number. */
  totalKg: number | null;
  barbell: Barbell;
}>();
const { t } = useTranslation();
const format = useFormat();
const load = computed(() =>
  totalKg === null ? null : loadBarbell(totalKg, barbell),
);
const bar = computed(() => format.value.number(barbell.barKg));
const tones: ReadonlyMap<number, string> = new Map([
  [50, "green"],
  [25, "red"],
  [20, "blue"],
  [15, "yellow"],
  [10, "green"],
  [5, "white"],
  [2.5, "black"],
  [2, "blue"],
]);
const plateTone = (kg: number) => tones.get(kg) ?? "steel";
const size = (kg: number) => {
  if (kg >= 10) return "full";
  if (kg >= 5) return "large";
  return kg >= 2 ? "medium" : "small";
};
const description = computed(() => {
  const current = load.value;
  if (!current) return t("training.plates.belowBar", { bar: bar.value });
  const plates = current.perSide
    .map((kg) =>
      t("training.plates.plate", { weight: format.value.number(kg) }),
    )
    .join(", ");
  const loaded = plates
    ? t("training.plates.load", { plates, bar: bar.value })
    : t("training.plates.emptyBar", { bar: bar.value });
  if (current.remainderKg <= 0) return loaded;
  const remainder = t("training.plates.remainder", {
    weight: format.value.number(current.remainderKg),
  });
  return `${loaded}. ${remainder}`;
});
</script>

<template>
  <div
    class="barbell"
    :class="{ 'is-below-bar': !load }"
    role="img"
    :aria-label="description"
  >
    <span class="barbell-bar" aria-hidden="true">{{ bar }}</span>
    <span class="barbell-collar" aria-hidden="true" />
    <span
      v-for="(kg, index) in load?.perSide ?? []"
      :key="index"
      class="barbell-plate"
      :class="[`is-${plateTone(kg)}`, `is-${size(kg)}`]"
      aria-hidden="true"
      >{{ format.number(kg) }}</span
    >
    <span
      v-if="load && load.remainderKg > 0"
      class="barbell-rest"
      aria-hidden="true"
      >+{{ format.number(load.remainderKg) }}</span
    >
  </div>
</template>

<style scoped>
.barbell {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  height: 54px;
  overflow: clip;
}
/* The sleeve runs behind the plates across the whole space. */
.barbell::before {
  content: "";
  position: absolute;
  inset-inline: 0;
  inset-block-start: 50%;
  height: 12px;
  transform: translateY(-50%);
  border-radius: 3px;
  background: var(--ui-muted-foreground);
  opacity: 0.45;
}
.barbell > span {
  position: relative;
}
.barbell-bar {
  flex-shrink: 0;
  padding-inline: 4px 6px;
  color: var(--ui-foreground);
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.barbell-collar {
  flex-shrink: 0;
  width: 5px;
  height: 22px;
  border-radius: 2px;
  background: var(--ui-muted-foreground);
}
.barbell-plate {
  flex: 0 1 18px;
  min-width: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  writing-mode: vertical-rl;
  font-size: 11px;
  font-weight: 650;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  overflow: clip;
}
.barbell-plate.is-full {
  height: 54px;
}
.barbell-plate.is-large {
  height: 42px;
}
.barbell-plate.is-medium {
  height: 34px;
  font-size: 9px;
}
.barbell-plate.is-small {
  height: 28px;
  font-size: 8px;
}
.is-red {
  background: var(--ui-plate-red);
  color: var(--ui-plate-ink-light);
}
.is-blue {
  background: var(--ui-plate-blue);
  color: var(--ui-plate-ink-light);
}
.is-yellow {
  background: var(--ui-plate-yellow);
  color: var(--ui-plate-ink-dark);
}
.is-green {
  background: var(--ui-plate-green);
  color: var(--ui-plate-ink-light);
}
.is-white {
  background: var(--ui-plate-white);
  color: var(--ui-plate-ink-dark);
}
.is-black {
  background: var(--ui-plate-black);
  color: var(--ui-plate-ink-light);
}
.is-steel {
  background: var(--ui-plate-steel);
  color: var(--ui-plate-ink-dark);
}
.barbell-rest {
  flex-shrink: 0;
  padding: 1px 3px;
  border-radius: 4px;
  background: var(--ui-background);
  color: var(--ui-destructive);
  font-size: 10px;
  font-weight: 650;
}
.barbell.is-below-bar {
  opacity: 0.5;
}
</style>
