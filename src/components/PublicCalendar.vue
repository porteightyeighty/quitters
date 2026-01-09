<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  entries: Array,
  username: String
})

const theme = useThemeStore()
const currentDate = ref(new Date())

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
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

function getEntryType(dateStr) {
  const entry = (props.entries || []).find(e => e.date === dateStr)
  return entry?.type || null
}

function getEntryColor(type) {
  const colors = {
    smoked: 'bg-red-500',
    vaped: 'bg-orange-500',
    nicotine_replacement: 'bg-yellow-500'
  }
  return colors[type] || ''
}
</script>

<template>
  <div 
    class="rounded-xl shadow-sm p-6 transition-colors duration-200"
    :class="theme.isDark ? 'bg-gray-800' : 'bg-white'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <button 
        @click="previousMonth"
        class="p-2 rounded-lg transition-colors"
        :class="theme.isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'"
      >
        ←
      </button>
      <h3 
        class="text-lg font-semibold"
        :class="theme.isDark ? 'text-white' : 'text-gray-800'"
      >
        {{ monthName }} {{ currentYear }}
      </h3>
      <button 
        @click="nextMonth"
        class="p-2 rounded-lg transition-colors"
        :class="theme.isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'"
      >
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
      <div 
        v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
        :key="day"
        class="text-center text-xs font-medium py-1"
        :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'"
      >
        {{ day }}
      </div>
    </div>
    
    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-1">
      <div 
        v-for="({ day, date }, index) in calendarDays" 
        :key="index"
        class="aspect-square flex items-center justify-center text-sm rounded-lg"
        :class="{
          'ring-2 ring-indigo-500': day && isToday(date),
          [getEntryColor(getEntryType(date))]: day && getEntryType(date),
          'text-white': day && getEntryType(date),
          [theme.isDark ? 'text-gray-300' : 'text-gray-700']: day && !getEntryType(date)
        }"
      >
        {{ day }}
      </div>
    </div>
    
    <p 
      class="text-xs mt-4 text-center"
      :class="theme.isDark ? 'text-gray-500' : 'text-gray-400'"
    >
      {{ username }}'s tracking history
    </p>
  </div>
</template>
