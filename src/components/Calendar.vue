<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTrackingStore } from '../stores/tracking'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'


const tracking = useTrackingStore()
const auth = useAuthStore()
const theme = useThemeStore()

const currentDate = ref(new Date())
const selectedDate = ref(null)
const showModal = ref(false)
const saving = ref(false)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const entryTypes = [
  { value: 'smoked', label: '🚬 Smoked', color: 'bg-red-500' },
  { value: 'vaped', label: '💨 Vaped', color: 'bg-orange-500' },
  { value: 'nicotine_replacement', label: '💊 Nicotine Replacement', color: 'bg-yellow-500' }
]

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())
const monthName = computed(() => monthNames[currentMonth.value])

function previousMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

function nextMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, date: null })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    days.push({ day, date: dateStr })
  }

  return days
})

const today = new Date()
const todayStr = today.toISOString().split('T')[0]

function isToday(dateStr) {
  return dateStr === todayStr
}

function isFuture(dateStr) {
  return new Date(dateStr) > today
}

function getEntryType(dateStr) {
  const entry = tracking.getEntryForDate(dateStr)
  return entry?.type || null
}

function getEntryColor(type) {
  const entry = entryTypes.find(e => e.value === type)
  return entry?.color || ''
}

function selectDate(dateStr) {
  if (!dateStr || isFuture(dateStr)) return
  selectedDate.value = dateStr
  showModal.value = true
}

async function setEntryType(type) {
  if (!selectedDate.value) return
  saving.value = true
  try {
    await tracking.setEntry(selectedDate.value, type)
    showModal.value = false
  } catch (e) {
    console.error('Failed to save:', e)
  } finally {
    saving.value = false
  }
}

async function clearEntry() {
  if (!selectedDate.value) return
  saving.value = true
  try {
    await tracking.removeEntry(selectedDate.value)
    showModal.value = false
  } catch (e) {
    console.error('Failed to clear:', e)
  } finally {
    saving.value = false
  }
}

const selectedEntry = computed(() => {
  if (!selectedDate.value) return null
  return tracking.getEntryForDate(selectedDate.value)
})

watch([currentMonth, currentYear], () => {
  if (auth.isLoggedIn) {
    tracking.fetchEntriesForMonth(currentYear.value, currentMonth.value)
  }
}, { immediate: true })

onMounted(() => {
  if (auth.isLoggedIn) {
    tracking.fetchEntriesForMonth(currentYear.value, currentMonth.value)
  }
})
</script>

<template>
  <div class="rounded-xl shadow-sm p-6 transition-colors duration-200"
    :class="theme.isDark ? 'bg-gray-800' : 'bg-white'">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <button @click="previousMonth" class="p-2 rounded-lg transition-colors"
        :class="theme.isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'">
        ←
      </button>
      <h3 class="text-lg font-semibold" :class="theme.isDark ? 'text-white' : 'text-gray-800'">
        {{ monthName }} {{ currentYear }}
      </h3>
      <button @click="nextMonth" class="p-2 rounded-lg transition-colors"
        :class="theme.isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'">
        →
      </button>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-3 mb-4 text-xs">
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-red-500"></span>
        <span :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'">Smoked</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-orange-500"></span>
        <span :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'">Vaped</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
        <span :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'">NRT</span>
      </div>
    </div>

    <!-- Weekday headers -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day"
        class="text-center text-xs font-medium py-1" :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'">
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-1">
      <div v-for="({ day, date }, index) in calendarDays" :key="index" @click="selectDate(date)"
        class="aspect-square flex items-center justify-center text-sm rounded-lg transition relative" :class="{
          'cursor-pointer': day && !isFuture(date),
          'cursor-not-allowed opacity-40': day && isFuture(date),
          'ring-2 ring-indigo-500': day && isToday(date),
          [getEntryColor(getEntryType(date))]: day && getEntryType(date),
          'text-white': day && getEntryType(date),
          [theme.isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100']: day && !getEntryType(date) && !isFuture(date)
        }">
        {{ day }}
      </div>
    </div>

    <p class="text-xs mt-4 text-center" :class="theme.isDark ? 'text-gray-500' : 'text-gray-400'">
      Click a date to log nicotine use
    </p>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      click.self="showModal = false">

      <div class="rounded-xl shadow-xl p-6 w-full max-w-sm" :class="theme.isDark ? 'bg-gray-800' : 'bg-white'">
        <h3 class="text-lg font-semibold mb-1" :class="theme.isDark ? 'text-white' : 'text-gray-800'">
          {{ new Date(selectedDate + ' 12:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day:
              'numeric'
          }) }}
        </h3>
        <p class="text-sm mb-4" :class="theme.isDark ? 'text-gray-400' : 'text-gray-500'">
          {{ selectedEntry ? 'Update or clear this entry' : 'What did you use?' }}
        </p>

        <div class="space-y-2">
          <button v-for="type in entryTypes" :key="type.value" @click="setEntryType(type.value)" :disabled="saving"
            class="w-full py-3 px-4 rounded-lg text-left transition flex items-center justify-between" :class="[
              selectedEntry?.type === type.value
                ? type.color + ' text-white'
                : theme.isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            ]">
            <span>{{ type.label }}</span>
            <span v-if="selectedEntry?.type === type.value">✓</span>
          </button>
        </div>

        <div class="mt-4 pt-4 border-t flex gap-2" :class="theme.isDark ? 'border-gray-700' : ''">
          <button v-if="selectedEntry" @click="clearEntry" :disabled="saving"
            class="flex-1 py-2 px-4 rounded-lg transition disabled:opacity-50" :class="theme.isDark
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
            Clear Entry
          </button>
          <button @click="showModal = false" class="flex-1 py-2 px-4 rounded-lg transition" :class="theme.isDark
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
