<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'
import { daysSinceLatest } from '../lib/date'

const props = defineProps({
  users: Array,
  loading: Boolean,
  currentUserId: String
})

const theme = useThemeStore()

function isSelf(user) {
  return props.currentUserId && user?.id === props.currentUserId
}

function getDaysSinceQuit(user) {
  // Streak anchors on the quit date, unless a more recent slip (last_use_date) overrides it.
  return daysSinceLatest([user?.quit_date, user?.last_use_date])
}

function getDisplayName(user) {
  return user?.username || user?.email?.split('@')[0] || 'Anonymous'
}

function getTopMilestone(days) {
  if (days >= 365) return { emoji: '👑', label: '1+ Year' }
  if (days >= 90) return { emoji: '🏆', label: '3+ Months' }
  if (days >= 30) return { emoji: '💪', label: '1+ Month' }
  if (days >= 7) return { emoji: '🔥', label: '1+ Week' }
  if (days >= 1) return { emoji: '🌟', label: 'Started' }
  return null
}
</script>

<template>
  <div>
    <!-- Loading state -->
    <div 
      v-if="loading" 
      class="text-center py-8"
      :class="theme.isDark ? 'text-gray-400' : 'text-gray-500'"
    >
      Loading community progress...
    </div>
    
    <!-- Empty state -->
    <div 
      v-else-if="!users?.length" 
      class="rounded-xl shadow-sm p-8 text-center"
      :class="theme.isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'"
    >
      <p>No public quitters yet. Be the first!</p>
    </div>
    
    <template v-else>
      <!-- Mobile: List layout -->
      <div class="md:hidden space-y-3">
        <RouterLink
          v-for="user in users" 
          :key="user.id"
          :to="`/user/${user.id}`"
          class="rounded-xl shadow-sm p-4 flex items-center justify-between block hover:shadow-md transition-all duration-200"
          :class="[
            theme.isDark ? 'bg-gray-800' : 'bg-white',
            isSelf(user) ? 'ring-2 ring-indigo-500' : ''
          ]"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              :class="theme.isDark ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-100 text-indigo-600'"
            >
              {{ getDisplayName(user).charAt(0).toUpperCase() }}
            </div>
            <div>
              <p
                class="font-medium"
                :class="theme.isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ getDisplayName(user) }}
                <span
                  v-if="isSelf(user)"
                  class="ml-1 px-1.5 py-0.5 rounded text-xs font-medium align-middle"
                  :class="theme.isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-700'"
                >
                  You
                </span>
              </p>
              <p 
                v-if="getTopMilestone(getDaysSinceQuit(user))" 
                class="text-xs"
                :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'"
              >
                {{ getTopMilestone(getDaysSinceQuit(user)).emoji }} {{ getTopMilestone(getDaysSinceQuit(user)).label }}
              </p>
            </div>
          </div>
          
          <div class="text-right flex items-center gap-2">
            <div>
              <span 
                class="text-2xl font-bold"
                :class="theme.isDark ? 'text-indigo-400' : 'text-indigo-500'"
              >
                {{ getDaysSinceQuit(user) }}
              </span>
              <span 
                class="text-sm ml-1"
                :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'"
              >
                days
              </span>
            </div>
            <span :class="theme.isDark ? 'text-gray-600' : 'text-gray-300'">→</span>
          </div>
        </RouterLink>
      </div>
      
      <!-- Desktop: Grid layout -->
      <div class="hidden md:grid md:grid-cols-2 gap-3">
        <RouterLink
          v-for="user in users" 
          :key="user.id"
          :to="`/user/${user.id}`"
          class="rounded-xl shadow-sm p-4 block hover:shadow-md transition-all duration-200"
          :class="[
            theme.isDark ? 'bg-gray-800' : 'bg-white',
            isSelf(user) ? 'ring-2 ring-indigo-500' : ''
          ]"
        >
          <div class="flex items-center gap-3 mb-2">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              :class="theme.isDark ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-100 text-indigo-600'"
            >
              {{ getDisplayName(user).charAt(0).toUpperCase() }}
            </div>
            <span
              class="font-medium text-sm truncate"
              :class="theme.isDark ? 'text-white' : 'text-gray-800'"
            >
              {{ getDisplayName(user) }}
            </span>
            <span
              v-if="isSelf(user)"
              class="px-1.5 py-0.5 rounded text-xs font-medium"
              :class="theme.isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-700'"
            >
              You
            </span>
          </div>
          <div class="flex items-baseline gap-1">
            <span 
              class="text-3xl font-bold"
              :class="theme.isDark ? 'text-indigo-400' : 'text-indigo-500'"
            >
              {{ getDaysSinceQuit(user) }}
            </span>
            <span 
              class="text-sm"
              :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'"
            >
              days
            </span>
          </div>
          <p 
            v-if="getTopMilestone(getDaysSinceQuit(user))" 
            class="text-xs mt-1"
            :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'"
          >
            {{ getTopMilestone(getDaysSinceQuit(user)).emoji }} {{ getTopMilestone(getDaysSinceQuit(user)).label }}
          </p>
        </RouterLink>
      </div>
    </template>
  </div>
</template>
