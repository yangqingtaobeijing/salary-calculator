<template>
  <div class="page-shell">
    <div class="page-backdrop" />

    <main class="dashboard">
      <header class="topbar panel reveal">
        <div>
          <p class="eyebrow">Salary Flow</p>
          <h1 class="title">工资计算器</h1>
          <p class="subtitle">把今天赚到的钱放在最显眼的位置，其他指标退居辅助。</p>
        </div>

        <button
          class="theme-toggle"
          type="button"
          :aria-label="theme === 'light' ? '切换到夜间模式' : '切换到日间模式'"
          @click="toggleTheme"
        >
          <span class="theme-toggle__icon">
            <svg v-if="theme === 'light'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3v2.5M12 18.5V21M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M3 12h2.5M18.5 12H21M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"/>
              <circle cx="12" cy="12" r="4.5"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3c0 0 0 0 0 0A7 7 0 0 0 21 12.79z"/>
            </svg>
          </span>
          <span class="theme-toggle__label">{{ theme === 'light' ? '夜间' : '日间' }}模式</span>
        </button>
      </header>

      <div class="content-grid">
        <section class="metrics-stack">
          <article class="hero-card panel reveal reveal-delay-1">
            <div class="hero-card__header">
              <div>
                <p class="eyebrow">Today Total</p>
                <h2>今日累计收入</h2>
              </div>
              <div class="hero-card__meta">
                <span class="chip">自 {{ startTime }} 起</span>
                <span class="chip chip-accent">{{ currentTimeStr }}</span>
              </div>
            </div>

            <div class="hero-card__body">
              <div class="hero-amount">
                <span v-if="todayIncome !== null" class="currency">¥</span>
                <span :class="{ 'placeholder': todayIncome === null }">
                  {{ todayIncome !== null ? fmt(todayIncome, 2) : '--' }}
                </span>
              </div>
              <p class="hero-note">
                <template v-if="todayIncome === null">先输入工资和工时参数。</template>
                <template v-else-if="todayIncome === 0">还没到上班时间，今天的计时还没开始。</template>
                <template v-else>这是今天最重要的数字，下面的速率指标仅作为参考。</template>
              </p>
            </div>
          </article>

          <section class="secondary-grid">
            <article class="panel metric-card reveal reveal-delay-2">
              <div class="metric-card__head">
                <p class="eyebrow">Live Rate</p>
                <span class="metric-caption">每秒收入</span>
              </div>
              <div class="metric-card__value">
                <span v-if="perSecond !== null" class="currency">¥</span>
                <span :class="{ 'placeholder': perSecond === null }">
                  {{ perSecond !== null ? fmt(perSecond) : '--' }}
                </span>
              </div>
              <p class="metric-help">每秒都在累加，适合直观看工作时间的价值密度。</p>
            </article>

            <article class="panel breakdown-card reveal reveal-delay-3">
              <div class="section-head">
                <div>
                  <p class="eyebrow">Breakdown</p>
                  <h3>速率拆分</h3>
                </div>
              </div>
              <div class="breakdown-grid">
                <BreakdownItem label="每分钟" :value="perMinute" :fmt="fmt" />
                <BreakdownItem label="每小时" :value="perHour" :fmt="fmt" />
                <BreakdownItem label="每天" :value="perDay" :fmt="fmt" />
              </div>
            </article>

            <article class="panel clock-card reveal reveal-delay-4">
              <p class="eyebrow">Live Clock</p>
              <h3>当前时间</h3>
              <p class="clock-value">{{ currentTimeStr }}</p>
            </article>
          </section>
        </section>

        <aside class="settings-card panel reveal reveal-delay-2">
          <div class="section-head">
            <div>
              <p class="eyebrow">Settings</p>
              <h2>参数设置</h2>
            </div>
            <span class="status-pill">本地存储</span>
          </div>

          <div class="field-group">
            <label class="field-label">月工资（元）</label>
            <div class="field-shell" :style="inputWrapStyle(salaryInput !== '' && salaryNum === null)">
              <span class="prefix">¥</span>
              <input
                v-if="salaryEditing || !salaryInput"
                ref="salaryInputRef"
                v-model="salaryInput"
                type="number"
                min="0"
                step="0.01"
                placeholder="输入月工资"
                class="field-input"
                @focus="onSalaryFocus"
                @blur="onSalaryBlur"
                @input="persistAll"
              />
              <span
                v-else
                class="field-input field-input--text"
                :style="{ letterSpacing: salaryVisible ? 'normal' : '0.18em' }"
              >
                {{ salaryVisible ? salaryInput : '••••••' }}
              </span>
              <button
                class="icon-button"
                type="button"
                title="显示/隐藏工资"
                @click="onEyeClick"
              >
                <svg v-if="salaryVisible || salaryEditing" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">每月工作天数</label>
            <div class="field-shell" :style="inputWrapStyle(!workDaysValid)">
              <button class="stepper-btn" type="button" @click="adjustWorkDays(-1)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <input
                v-model.number="workDays"
                type="number"
                min="1"
                max="31"
                class="field-input field-input--center"
                @change="persistAll"
                @blur="persistAll"
              />
              <button class="stepper-btn" type="button" @click="adjustWorkDays(1)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <span class="suffix">天</span>
            </div>
            <p v-if="!workDaysValid" class="field-error">请输入 1–31 之间的整数</p>
          </div>

          <div class="field-group">
            <label class="field-label">每天工作时长</label>
            <div class="field-shell" :style="inputWrapStyle(!workHoursValid)">
              <button class="stepper-btn" type="button" @click="adjustWorkHours(-0.5)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <input
                v-model.number="workHours"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                class="field-input field-input--center"
                @change="persistAll"
                @blur="persistAll"
              />
              <button class="stepper-btn" type="button" @click="adjustWorkHours(0.5)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <span class="suffix">小时</span>
            </div>
            <p v-if="!workHoursValid" class="field-error">请输入 0.5–24，精度 0.5 小时</p>
          </div>

          <div class="field-group">
            <label class="field-label">今日上班时间</label>
            <div class="field-shell">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="field-icon">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <input
                v-model="startTime"
                type="time"
                class="field-input"
                @change="persistAll"
                @blur="persistAll"
              />
            </div>
          </div>

          <button class="reset-button" type="button" @click="resetAll">重置所有</button>
        </aside>
      </div>

      <p class="footer-note reveal reveal-delay-4">数据只保存在浏览器本地，不会上传任何服务器。</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import BreakdownItem from '../components/BreakdownItem.vue'
import { useSalary } from '../composables/useSalary'

const THEME_KEY = 'salary-calc-theme'

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
const theme = ref<'light' | 'dark'>('light')

function onEyeClick() {
  if (!salaryEditing.value && salaryInput.value) {
    toggleSalaryVisible()
  } else {
    salaryEditing.value = true
    nextTick(() => salaryInputRef.value?.focus())
  }
}

function inputWrapStyle(hasError = false) {
  if (hasError) {
    return {
      background: 'var(--surface-critical)',
      border: '1px solid var(--danger)',
      boxShadow: '0 0 0 1px var(--surface-critical)',
    }
  }

  return {
    background: 'var(--surface-muted)',
    border: '1px solid var(--border-subtle)',
  }
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

onMounted(() => {
  const storedTheme = localStorage.getItem(THEME_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    theme.value = storedTheme
    return
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
  }
})

watch(theme, (value) => {
  document.documentElement.dataset.theme = value
  localStorage.setItem(THEME_KEY, value)
}, { immediate: true })

const currentTimeStr = computed(() => {
  const d = now.value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})
</script>

<style scoped>
.page-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 40px 20px;
}

.page-backdrop {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at top left, var(--bg-glow-1), transparent 34%),
    radial-gradient(circle at bottom right, var(--bg-glow-2), transparent 28%),
    linear-gradient(160deg, var(--bg-primary), var(--bg-secondary));
  z-index: 0;
}

.dashboard {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.panel {
  border: 1px solid var(--border-soft);
  background: var(--surface-panel);
  border-radius: 28px;
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(18px);
}

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 26px 28px;
  margin-bottom: 24px;
}

.eyebrow {
  margin-bottom: 8px;
  color: var(--text-subtle);
  font-size: 0.72rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.title {
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 0.95;
}

.subtitle {
  margin-top: 10px;
  max-width: 36rem;
  color: var(--text-muted);
  font-size: 0.98rem;
  line-height: 1.6;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--text-strong);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.theme-toggle:hover {
  transform: translateY(-1px);
  background: var(--surface-elevated);
  border-color: var(--border-strong);
}

.theme-toggle__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.theme-toggle__label {
  font-size: 0.95rem;
  font-weight: 600;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.78fr);
  gap: 24px;
}

.metrics-stack,
.settings-card {
  min-width: 0;
}

.hero-card {
  position: relative;
  overflow: hidden;
  padding: 28px;
  min-height: 320px;
  background:
    linear-gradient(135deg, var(--hero-overlay), transparent 68%),
    linear-gradient(180deg, var(--surface-panel), var(--surface-elevated));
}

.hero-card::after {
  content: '';
  position: absolute;
  inset: auto -8% -18% auto;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--hero-orb), transparent 62%);
  opacity: 0.85;
  pointer-events: none;
}

.hero-card__header,
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-card__header h2,
.section-head h2,
.section-head h3,
.clock-card h3 {
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.hero-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.chip,
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--surface-muted);
  color: var(--text-muted);
  font-size: 0.82rem;
}

.chip-accent,
.status-pill {
  background: var(--accent-soft);
  border-color: transparent;
  color: var(--accent-strong);
}

.hero-card__body {
  position: relative;
  z-index: 1;
  margin-top: 42px;
}

.hero-amount {
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: clamp(3.3rem, 8vw, 5.8rem);
  font-weight: 600;
  letter-spacing: -0.07em;
  line-height: 0.92;
}

.currency {
  margin-right: 8px;
  color: var(--accent-strong);
}

.placeholder {
  color: var(--text-subtle);
}

.hero-note,
.metric-help,
.footer-note,
.field-error {
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.6;
}

.hero-note {
  margin-top: 18px;
  max-width: 28rem;
}

.secondary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 20px;
  margin-top: 20px;
}

.metric-card,
.clock-card,
.breakdown-card {
  padding: 24px;
}

.metric-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-caption {
  color: var(--text-muted);
  font-size: 0.88rem;
}

.metric-card__value {
  margin-top: 32px;
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 4.2vw, 3.6rem);
  font-weight: 600;
  letter-spacing: -0.06em;
  line-height: 1;
}

.metric-help {
  margin-top: 14px;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.clock-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.clock-value {
  margin-top: 22px;
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: clamp(2rem, 3vw, 2.8rem);
  letter-spacing: -0.05em;
}

.settings-card {
  padding: 28px;
}

.field-group + .field-group {
  margin-top: 18px;
}

.field-label {
  display: block;
  margin-bottom: 10px;
  color: var(--text-muted);
  font-size: 0.92rem;
  font-weight: 600;
}

.field-shell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 0 16px;
  border-radius: 18px;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.field-shell:focus-within {
  border-color: var(--border-strong) !important;
  box-shadow: 0 0 0 4px var(--focus-ring) !important;
}

.prefix,
.suffix,
.field-icon {
  color: var(--text-subtle);
  flex-shrink: 0;
}

.field-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-strong);
  font-size: 1rem;
}

.field-input--center {
  text-align: center;
}

.field-input--text {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
}

.icon-button,
.stepper-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--text-subtle);
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease;
  flex-shrink: 0;
}

.icon-button:hover,
.stepper-btn:hover {
  transform: translateY(-1px);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.field-error {
  margin-top: 8px;
  color: var(--danger);
}

.reset-button {
  width: 100%;
  min-height: 54px;
  margin-top: 26px;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--surface-muted);
  color: var(--text-strong);
  font-size: 0.96rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.reset-button:hover {
  transform: translateY(-1px);
  background: var(--surface-elevated);
  border-color: var(--border-strong);
}

.footer-note {
  margin-top: 18px;
  text-align: center;
}

.reveal {
  animation: rise-in 0.55s ease both;
}

.reveal-delay-1 {
  animation-delay: 0.06s;
}

.reveal-delay-2 {
  animation-delay: 0.12s;
}

.reveal-delay-3 {
  animation-delay: 0.18s;
}

.reveal-delay-4 {
  animation-delay: 0.24s;
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .secondary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .page-shell {
    padding: 18px 14px 28px;
  }

  .topbar,
  .settings-card,
  .hero-card,
  .metric-card,
  .breakdown-card,
  .clock-card {
    padding: 20px;
    border-radius: 22px;
  }

  .topbar,
  .hero-card__header,
  .section-head {
    flex-direction: column;
  }

  .theme-toggle,
  .hero-card__meta {
    width: 100%;
    justify-content: center;
  }

  .hero-card {
    min-height: unset;
  }

  .hero-card__body {
    margin-top: 26px;
  }

  .breakdown-grid {
    grid-template-columns: 1fr;
  }

  .clock-value {
    font-size: 2.3rem;
  }
}
</style>
