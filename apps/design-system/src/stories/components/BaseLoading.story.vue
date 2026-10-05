<script setup lang="ts">
import { BaseLoading } from "@form/ui";
</script>
<template>
  <Story title="02 Components/BaseLoading"
    ><Variant title="Journal loading"><BaseLoading /></Variant
  ></Story>
</template>
<docs lang="md">
# BaseLoading

## Usage

A quiet branded status while the journal opens.

## Variants

Use the label prop to describe the operation.

## States

Loading only; consumers render recovery or ready content separately.

## Behavior

No looping animation or forced minimum wait. The label is announced as a status.

## Examples and limitations

This component does not load data or hide failures.
</docs>
