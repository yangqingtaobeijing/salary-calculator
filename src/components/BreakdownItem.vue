<template>
  <div class="breakdown-item">
    <span class="breakdown-item__label">{{ label }}</span>
    <span class="breakdown-item__value" :class="{ 'is-placeholder': value === null }">
      <template v-if="value !== null">
        <span class="breakdown-item__currency">¥</span>{{ fmt(value) }}
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

<style scoped>
.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  background: var(--surface-muted);
}

.breakdown-item__label {
  color: var(--text-subtle);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.breakdown-item__value {
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
}

.breakdown-item__currency {
  margin-right: 4px;
  color: var(--accent-strong);
}

.is-placeholder {
  color: var(--text-subtle);
}
</style>
