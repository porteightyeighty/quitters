<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'
import { daysSinceLatest } from '../lib/date'

const props = defineProps({
  user: Object,
  entries: Array
})

const theme = useThemeStore()

const displayName = computed(() => {
  return props.user?.username || props.user?.email?.split('@')[0] || 'Anonymous'
})

const sortedAll = computed(() => 
  [...(props.entries || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
)

const smokingVapingEntries = computed(() => 
  (props.entries || []).filter(e => e.type === 'smoked' || e.type === 'vaped')
)

const sortedSmokingVaping = computed(() => 
  [...smokingVapingEntries.value].sort((a, b) => new Date(b.date) - new Date(a.date))
)

const hasNrt = computed(() => 
  (props.entries || []).some(e => e.type === 'nicotine_replacement')
)

const quitDate = computed(() => props.user?.quit_date || null)

const daysSinceAll = computed(() =>
  daysSinceLatest([quitDate.value, sortedAll.value[0]?.date])
)

const daysSinceSmokingVaping = computed(() =>
  daysSinceLatest([quitDate.value, sortedSmokingVaping.value[0]?.date])
)

const showDual = computed(() => 
  hasNrt.value && daysSinceAll.value !== daysSinceSmokingVaping.value
)

function getMilestones(days) {
  const milestones = []
  if (days >= 1) milestones.push({ emoji: '🌟', label: 'Day 1' })
  if (days >= 7) milestones.push({ emoji: '🔥', label: '1 Week' })
  if (days >= 30) milestones.push({ emoji: '💪', label: '1 Month' })
  if (days >= 90) milestones.push({ emoji: '🏆', label: '3 Months' })
  if (days >= 365) milestones.push({ emoji: '👑', label: '1 Year' })
  return milestones
}
</script>

<template>
  <div 
    class="rounded-xl shadow-sm p-6 transition-colors duration-200"
    :class="theme.isDark ? 'bg-gray-800' : 'bg-white'"
  >
    <!-- Has entries -->
    <div v-if="daysSinceAll !== null || daysSinceSmokingVaping !== null">
      
      <!-- Dual counter view -->
      <div v-if="showDual" class="space-y-6">
        <div class="text-center">
          <p :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'" class="mb-2">
            {{ displayName }} has been smoke & vape free for
          </p>
          <div class="text-6xl font-bold mb-1" :class="theme.isDark ? 'text-indigo-400' : 'text-indigo-500'">
            {{ daysSinceSmokingVaping }}
          </div>
          <p class="text-lg" :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'">
            {{ daysSinceSmokingVaping === 1 ? 'day' : 'days' }}
          </p>
          
          <div class="mt-3 flex flex-wrap justify-center gap-2">
            <span 
              v-for="m in getMilestones(daysSinceSmokingVaping)" 
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
          <p class="text-sm mb-1" :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'">
            Including nicotine replacement
          </p>
          <div class="flex items-baseline justify-center gap-1">
            <span class="text-2xl font-semibold" :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'">
              {{ daysSinceAll }}
            </span>
            <span :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'">
              {{ daysSinceAll === 1 ? 'day' : 'days' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Single counter view -->
      <div v-else class="text-center">
        <p :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'" class="mb-2">
          {{ displayName }} has been nicotine-free for
        </p>
        <div class="text-6xl font-bold mb-2" :class="theme.isDark ? 'text-indigo-400' : 'text-indigo-500'">
          {{ daysSinceSmokingVaping ?? daysSinceAll }}
        </div>
        <p class="text-xl" :class="theme.isDark ? 'text-gray-300' : 'text-gray-700'">
          {{ (daysSinceSmokingVaping ?? daysSinceAll) === 1 ? 'day' : 'days' }}
        </p>
        
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <span 
            v-for="m in getMilestones(daysSinceSmokingVaping ?? daysSinceAll)" 
            :key="m.label"
            class="px-3 py-1 rounded-full text-sm"
            :class="theme.isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-700'"
          >
            {{ m.emoji }} {{ m.label }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- No entries -->
    <div v-else class="text-center py-4">
      <p :class="theme.isDark ? 'text-gray-400' : 'text-gray-500'">
        {{ displayName }} hasn't logged any entries yet
      </p>
    </div>
  </div>
</template>
