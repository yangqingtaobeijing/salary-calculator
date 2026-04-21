import { ref, computed, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'salary-calc-v1'

interface SalaryData {
  salary: string      // btoa encoded
  workDays: number
  workHours: number
  startTime: string   // HH:MM
}

const DEFAULT_DATA: SalaryData = {
  salary: '',
  workDays: 22,
  workHours: 8,
  startTime: '09:00',
}

function encode(val: string): string {
  try {
    return btoa(encodeURIComponent(val))
  } catch {
    return ''
  }
}

function decode(val: string): string {
  try {
    return decodeURIComponent(atob(val))
  } catch {
    return ''
  }
}

function load(): { salary: string; workDays: number; workHours: number; startTime: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DATA, salary: '' }
    const parsed: SalaryData = JSON.parse(raw)
    return {
      salary: decode(parsed.salary ?? ''),
      workDays: parsed.workDays ?? DEFAULT_DATA.workDays,
      workHours: parsed.workHours ?? DEFAULT_DATA.workHours,
      startTime: parsed.startTime ?? DEFAULT_DATA.startTime,
    }
  } catch {
    return { ...DEFAULT_DATA, salary: '' }
  }
}

function save(data: { salary: string; workDays: number; workHours: number; startTime: string }) {
  const toStore: SalaryData = {
    salary: encode(data.salary),
    workDays: data.workDays,
    workHours: data.workHours,
    startTime: data.startTime,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
}

export function useSalary() {
  const stored = load()

  const salaryInput = ref(stored.salary)
  const workDays = ref(stored.workDays)
  const workHours = ref(stored.workHours)
  const startTime = ref(stored.startTime)

  // Salary visibility
  const salaryVisible = ref(false)
  const salaryEditing = ref(false)

  // Current time tick
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  // Validation
  const salaryNum = computed(() => {
    const v = parseFloat(salaryInput.value)
    return isNaN(v) || v <= 0 ? null : v
  })

  const workDaysValid = computed(() => {
    const v = workDays.value
    return Number.isInteger(v) && v >= 1 && v <= 31
  })

  const workHoursValid = computed(() => {
    const v = workHours.value
    // 0.5 increments, 0.5 to 24
    return v >= 0.5 && v <= 24 && (v * 2) % 1 === 0
  })

  const isValid = computed(() => {
    return salaryNum.value !== null && workDaysValid.value && workHoursValid.value
  })

  // Per-second income
  const perSecond = computed(() => {
    if (!isValid.value) return null
    return salaryNum.value! / (workDays.value * workHours.value * 3600)
  })

  const perMinute = computed(() => perSecond.value === null ? null : perSecond.value * 60)
  const perHour = computed(() => perSecond.value === null ? null : perSecond.value * 3600)
  const perDay = computed(() => perSecond.value === null ? null : perSecond.value * workHours.value * 3600)

  // Today accumulated income
  const todayIncome = computed(() => {
    if (perSecond.value === null) return null
    const n = now.value
    const [hStr, mStr] = startTime.value.split(':')
    const startH = parseInt(hStr, 10)
    const startM = parseInt(mStr, 10)

    if (isNaN(startH) || isNaN(startM)) return 0

    const startSec = startH * 3600 + startM * 60
    const nowSec = n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds()

    const elapsed = nowSec - startSec
    if (elapsed <= 0) return 0
    return perSecond.value * elapsed
  })

  function fmt(val: number | null, decimals = 3): string {
    if (val === null) return '--'
    return val.toFixed(decimals)
  }

  function persistAll() {
    save({
      salary: salaryInput.value,
      workDays: workDays.value,
      workHours: workHours.value,
      startTime: startTime.value,
    })
  }

  function onSalaryBlur() {
    salaryEditing.value = false
    persistAll()
  }

  function onSalaryFocus() {
    salaryEditing.value = true
    salaryVisible.value = true
  }

  function toggleSalaryVisible() {
    salaryVisible.value = !salaryVisible.value
  }

  function adjustWorkDays(delta: number) {
    const next = workDays.value + delta
    if (next >= 1 && next <= 31) {
      workDays.value = next
      persistAll()
    }
  }

  function adjustWorkHours(delta: number) {
    const next = Math.round((workHours.value + delta) * 2) / 2
    if (next >= 0.5 && next <= 24) {
      workHours.value = next
      persistAll()
    }
  }

  function resetAll() {
    salaryInput.value = ''
    workDays.value = 22
    workHours.value = 8
    startTime.value = '09:00'
    salaryEditing.value = false
    salaryVisible.value = false
    persistAll()
  }

  return {
    salaryInput,
    workDays,
    workHours,
    startTime,
    salaryVisible,
    salaryEditing,
    salaryNum,
    workDaysValid,
    workHoursValid,
    isValid,
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
  }
}
