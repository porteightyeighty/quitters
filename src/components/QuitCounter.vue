<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTrackingStore } from '../stores/tracking'
import { useThemeStore } from '../stores/theme'
import { daysSinceLatest } from '../lib/date'

const props = defineProps({
  user: Object,
  isOwn: Boolean
})

const tracking = useTrackingStore()
const theme = useThemeStore()
const allEntries = ref([])
const loading = ref(false)

const quitDate = computed(() => props.user?.quit_date || null)

function mostRecentEntryDate(types) {
  const matching = allEntries.value.filter(e => types.includes(e.type))
  if (matching.length === 0) return null
  return matching.reduce((a, b) => (new Date(b.date) > new Date(a.date) ? b : a)).date
}

const daysSinceLastUse = computed(() => {
  if (!props.isOwn) {
    return daysSinceLatest([quitDate.value, props.user?.last_use_date])
  }
  return daysSinceLatest([
    quitDate.value,
    mostRecentEntryDate(['smoked', 'vaped', 'nicotine_replacement'])
  ])
})

const daysSinceSmokingOrVaping = computed(() => {
  if (!props.isOwn) return null
  return daysSinceLatest([quitDate.value, mostRecentEntryDate(['smoked', 'vaped'])])
})

const hasNrtEntries = computed(() => {
  return allEntries.value.some(e => e.type === 'nicotine_replacement')
})

const showDualCounter = computed(() => {
  if (!props.isOwn) return false
  if (!hasNrtEntries.value) return false
  return daysSinceLastUse.value !== daysSinceSmokingOrVaping.value
})

const displayName = computed(() => {
  return props.user?.username || props.user?.email?.split('@')[0] || 'Anonymous'
})

function getMilestones(days) {
  const milestones = []
  if (days >= 1) milestones.push({ emoji: '🌟', label: 'Day 1' })
  if (days >= 7) milestones.push({ emoji: '🔥', label: '1 Week' })
  if (days >= 30) milestones.push({ emoji: '💪', label: '1 Month' })
  if (days >= 90) milestones.push({ emoji: '🏆', label: '3 Months' })
  if (days >= 365) milestones.push({ emoji: '👑', label: '1 Year' })
  return milestones
}

async function loadEntries() {
  if (!props.isOwn) return
  loading.value = true
  allEntries.value = await tracking.fetchAllEntries()
  loading.value = false
}

onMounted(loadEntries)
watch(() => tracking.entries, loadEntries, { deep: true })
</script>

<template>
  <div 
    class="rounded-xl shadow-sm p-6 transition-colors duration-200"
    :class="theme.isDark ? 'bg-gray-800' : 'bg-white'"
  >
    <div v-if="loading" class="text-center py-4">
      <p :class="theme.isDark ? 'text-gray-400' : 'text-gray-500'">Loading...</p>
    </div>
    
    <div v-else-if="daysSinceLastUse !== null || daysSinceSmokingOrVaping !== null">
      
      <!-- Dual counter view -->
      <div v-if="showDualCounter" class="space-y-6">
        <div class="text-center">
          <p :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'" class="mb-2">Days smoke & vape free</p>
          <div class="text-6xl font-bold mb-1" :class="theme.isDark ? 'text-indigo-400' : 'text-indigo-500'">
            {{ daysSinceSmokingOrVaping }}
          </div>
          <p class="text-lg" :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'">
            {{ daysSinceSmokingOrVaping === 1 ? 'day' : 'days' }}
          </p>
          
          <div class="mt-3 flex flex-wrap justify-center gap-2">
            <span 
              v-for="m in getMilestones(daysSinceSmokingOrVaping)" 
              :key="m.label"
              class="px-3 py-1 rounded-full text-sm"
              :class="theme.isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-700'"
            >
              {{ m.emoji }} {{ m.label }}
            </span>
          </div>
        </div>
        
        <div 
          class="pt-4 border-t text-center"
          :class="theme.isDark ? 'border-gray-700' : ''"
        >
          <p class="text-sm mb-1" :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'">Including nicotine replacement</p>
          <div class="flex items-baseline justify-center gap-1">
            <span class="text-2xl font-semibold" :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'">{{ daysSinceLastUse }}</span>
            <span :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'">{{ daysSinceLastUse === 1 ? 'day' : 'days' }}</span>
          </div>
          <p class="text-xs mt-1" :class="theme.isDark ? 'text-gray-500' : 'text-gray-400'">
            NRT is a tool, not a setback — keep going! 💪
          </p>
        </div>
      </div>
      
      <!-- Single counter view -->
      <div v-else class="text-center">
        <p :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'" class="mb-2">
          {{ isOwn ? 'Days nicotine-free' : `${displayName} — days nicotine-free` }}
        </p>
        <div class="text-6xl font-bold mb-2" :class="theme.isDark ? 'text-indigo-400' : 'text-indigo-500'">
          {{ daysSinceSmokingOrVaping ?? daysSinceLastUse }}
        </div>
        <p class="text-xl" :class="theme.isDark ? 'text-gray-300' : 'text-gray-700'">
          {{ (daysSinceSmokingOrVaping ?? daysSinceLastUse) === 1 ? 'day' : 'days' }}
        </p>
        
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <span 
            v-for="m in getMilestones(daysSinceSmokingOrVaping ?? daysSinceLastUse)" 
            :key="m.label"
            class="px-3 py-1 rounded-full text-sm"
            :class="theme.isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-700'"
          >
            {{ m.emoji }} {{ m.label }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- No entries yet -->
    <div v-else class="text-center py-4">
      <p class="mb-2" :class="theme.isDark ? 'text-gray-400' : 'text-gray-500'">
        {{ isOwn ? "No entries yet" : "No data available" }}
      </p>
      <p v-if="isOwn" class="text-sm" :class="theme.isDark ? 'text-gray-500' : 'text-gray-400'">
        Set your quit date in
        <RouterLink to="/settings" class="text-indigo-500 hover:underline">Settings</RouterLink>
        to start your streak.<br>
        Logging a slip on the calendar resets the count from that day.
      </p>
    </div>
  </div>
</template>
