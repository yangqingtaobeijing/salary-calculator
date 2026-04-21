<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-12"
       style="background: var(--t-bg);">
    <div class="w-full" style="max-width: 900px;">

      <!-- Header -->
      <div class="mb-10 text-center">
        <h1 class="font-bold tracking-tight mb-2"
            style="font-size: 1.75rem; color: var(--t-text);">
          工资计算器
        </h1>
        <p style="color: var(--t-text-muted); font-size: 0.9rem;">
          每一秒都在流逝，也在积累
        </p>
      </div>

      <!-- Main layout: left inputs + right display -->
      <div class="flex gap-6">

        <!-- LEFT: Input Card -->
        <div class="flex-1 rounded-2xl p-6 flex flex-col gap-5"
             style="background: var(--t-card); border: 1px solid var(--t-border);">
          <h2 class="font-semibold text-sm uppercase tracking-widest"
              style="color: var(--t-text-dim);">参数设置</h2>

          <!-- Monthly Salary -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: var(--t-text-muted);">
              月工资（元）
            </label>
            <div class="flex items-center gap-2 rounded-xl px-4 py-3 transition-all"
                 :style="inputWrapStyle(salaryInput !== '' && salaryNum === null)">
              <span style="color: var(--t-text-dim); font-size: 1rem;">¥</span>
              <input
                v-if="salaryEditing || !salaryInput"
                ref="salaryInputRef"
                v-model="salaryInput"
                type="number"
                min="0"
                step="0.01"
                placeholder="输入月工资"
                class="flex-1 bg-transparent outline-none text-base"
                style="color: var(--t-text);"
                @focus="onSalaryFocus"
                @blur="onSalaryBlur"
                @input="persistAll"
              />
              <span v-else class="flex-1 text-base"
                    :style="{ color: salaryVisible ? 'var(--t-text)' : 'var(--t-text-muted)', letterSpacing: salaryVisible ? 'normal' : '0.15em' }">
                {{ salaryVisible ? salaryInput : '••••••' }}
              </span>
              <button
                class="ml-1 flex items-center justify-center rounded-lg w-8 h-8 transition-colors"
                style="color: var(--t-text-dim);"
                @mouseenter="hoverEye = true"
                @mouseleave="hoverEye = false"
                :style="hoverEye ? 'color: var(--t-primary)' : ''"
                @click="onEyeClick"
                title="显示/隐藏工资"
              >
                <!-- Eye icon -->
                <svg v-if="salaryVisible || salaryEditing" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Work Days -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: var(--t-text-muted);">
              每月工作天数
            </label>
            <div class="flex items-center gap-2 rounded-xl px-4 py-3"
                 :style="inputWrapStyle(!workDaysValid)">
              <button class="stepper-btn" @click="adjustWorkDays(-1)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <input
                v-model.number="workDays"
                type="number"
                min="1"
                max="31"
                class="flex-1 bg-transparent outline-none text-center text-base"
                style="color: var(--t-text);"
                @change="persistAll"
                @blur="persistAll"
              />
              <button class="stepper-btn" @click="adjustWorkDays(1)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="text-sm" style="color: var(--t-text-dim);">天</span>
            </div>
            <p v-if="!workDaysValid" class="text-xs" style="color: var(--t-error);">请输入 1–31 之间的整数</p>
          </div>

          <!-- Work Hours -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: var(--t-text-muted);">
              每天工作时长
            </label>
            <div class="flex items-center gap-2 rounded-xl px-4 py-3"
                 :style="inputWrapStyle(!workHoursValid)">
              <button class="stepper-btn" @click="adjustWorkHours(-0.5)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <input
                v-model.number="workHours"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                class="flex-1 bg-transparent outline-none text-center text-base"
                style="color: var(--t-text);"
                @change="persistAll"
                @blur="persistAll"
              />
              <button class="stepper-btn" @click="adjustWorkHours(0.5)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="text-sm" style="color: var(--t-text-dim);">小时</span>
            </div>
            <p v-if="!workHoursValid" class="text-xs" style="color: var(--t-error);">请输入 0.5–24，精度 0.5 小时</p>
          </div>

          <!-- Start Time -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: var(--t-text-muted);">
              今日上班时间
            </label>
            <div class="flex items-center gap-2 rounded-xl px-4 py-3"
                 :style="inputWrapStyle(false)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: var(--t-text-dim); flex-shrink: 0;">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <input
                v-model="startTime"
                type="time"
                class="flex-1 bg-transparent outline-none text-base"
                style="color: var(--t-text); cursor: pointer;"
                @change="persistAll"
                @blur="persistAll"
              />
            </div>
          </div>

          <!-- Reset -->
          <button
            class="mt-2 rounded-xl py-2.5 text-sm font-medium transition-all"
            style="background: var(--t-border); color: var(--t-text-muted);"
            @mouseenter="(e) => (e.currentTarget as HTMLElement).style.background = 'var(--t-card-hover)'"
            @mouseleave="(e) => (e.currentTarget as HTMLElement).style.background = 'var(--t-border)'"
            @click="resetAll"
          >
            重置所有
          </button>
        </div>

        <!-- RIGHT: Display Card -->
        <div class="flex-1 flex flex-col gap-4">

          <!-- Per Second Hero -->
          <div class="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
               style="background: var(--t-card); border: 1px solid var(--t-border); min-height: 180px;">
            <p class="text-sm uppercase tracking-widest mb-3" style="color: var(--t-text-dim);">每秒收入</p>
            <div class="font-bold tabular-nums leading-none"
                 :style="heroStyle">
              <span v-if="perSecond !== null" style="color: var(--t-primary);">¥</span>
              <span :style="perSecond !== null ? 'color: var(--t-text)' : 'color: var(--t-text-dim)'">
                {{ perSecond !== null ? fmt(perSecond) : '--' }}
              </span>
            </div>
            <p v-if="perSecond !== null" class="mt-3 text-xs" style="color: var(--t-text-dim);">
              每秒钟，你赚了这么多
            </p>
          </div>

          <!-- Today accumulated -->
          <div class="rounded-2xl p-5 flex flex-col items-center text-center"
               style="background: var(--t-card); border: 1px solid var(--t-border);">
            <p class="text-xs uppercase tracking-widest mb-2" style="color: var(--t-text-dim);">
              今日累计收入
              <span class="ml-1 text-xs" style="color: var(--t-text-dim); opacity: 0.6;">（自 {{ startTime }} 起）</span>
            </p>
            <div class="font-semibold tabular-nums" style="font-size: 1.6rem;">
              <span v-if="todayIncome !== null">
                <span style="color: var(--t-success);">¥</span>
                <span style="color: var(--t-text);">{{ fmt(todayIncome) }}</span>
              </span>
              <span v-else style="color: var(--t-text-dim);">--</span>
            </div>
            <p v-if="todayIncome !== null && todayIncome === 0" class="mt-1 text-xs" style="color: var(--t-text-dim);">
              还没到上班时间，先歇着
            </p>
          </div>

          <!-- Breakdown -->
          <div class="rounded-2xl p-5 grid grid-cols-3 gap-3"
               style="background: var(--t-card); border: 1px solid var(--t-border);">
            <BreakdownItem label="每分钟" :value="perMinute" :fmt="fmt" />
            <BreakdownItem label="每小时" :value="perHour" :fmt="fmt" />
            <BreakdownItem label="每天" :value="perDay" :fmt="fmt" />
          </div>

          <!-- Live clock -->
          <div class="rounded-xl py-3 px-4 flex items-center justify-between"
               style="background: var(--t-card); border: 1px solid var(--t-border);">
            <span class="text-xs" style="color: var(--t-text-dim);">当前时间</span>
            <span class="tabular-nums text-sm font-medium" style="color: var(--t-text-muted);">
              {{ currentTimeStr }}
            </span>
          </div>

        </div>
      </div>

      <!-- Footer -->
      <p class="text-center mt-8 text-xs" style="color: var(--t-text-dim);">
        数据仅存储在本地，不会上传任何服务器
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useSalary } from '../composables/useSalary'
import BreakdownItem from '../components/BreakdownItem.vue'

const {
  salaryInput,
  workDays,
  workHours,
  startTime,
  salaryVisible,
  salaryEditing,
  salaryNum,
  workDaysValid,
  workHoursValid,
  perSecond,
  perMinute,
  perHour,
  perDay,
  todayIncome,
  now,
  fmt,
  persistAll,
  onSalaryBlur,
  onSalaryFocus,
  toggleSalaryVisible,
  adjustWorkDays,
  adjustWorkHours,
  resetAll,
} = useSalary()

const salaryInputRef = ref<HTMLInputElement | null>(null)
const hoverEye = ref(false)

function onEyeClick() {
  if (!salaryEditing.value && salaryInput.value) {
    toggleSalaryVisible()
  } else {
    salaryEditing.value = true
    nextTick(() => salaryInputRef.value?.focus())
  }
}

const heroStyle = computed(() => ({
  fontSize: '3.25rem',
  letterSpacing: '-0.02em',
}))

function inputWrapStyle(hasError: boolean) {
  if (hasError) {
    return {
      background: 'var(--t-error-muted)',
      border: '1px solid var(--t-error)',
    }
  }
  return {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--t-border)',
  }
}

const currentTimeStr = computed(() => {
  const d = now.value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})
</script>

<style scoped>
.stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: var(--t-text-muted);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
  border: none;
}
.stepper-btn:hover {
  background: var(--t-primary-muted);
  color: var(--t-primary);
}
</style>
