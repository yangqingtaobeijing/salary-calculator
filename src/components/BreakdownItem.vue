<template>
  <div class="flex flex-col items-center gap-1 py-2">
    <span class="text-xs uppercase tracking-wider" style="color: var(--t-text-dim);">{{ label }}</span>
    <span class="tabular-nums font-semibold text-lg"
          :style="value !== null ? 'color: var(--t-text)' : 'color: var(--t-text-dim)'">
      <template v-if="value !== null">
        <span style="color: var(--t-primary);">¥</span>{{ fmt(value) }}
      </template>
      <template v-else>--</template>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number | null
  fmt: (val: number | null, decimals?: number) => string
}>()
</script>
