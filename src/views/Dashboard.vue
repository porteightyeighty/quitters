<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import pb from '../lib/pocketbase'
import { daysSinceLatest } from '../lib/date'
import QuitCounter from '../components/QuitCounter.vue'
import Calendar from '../components/Calendar.vue'
import PublicCounters from '../components/PublicCounters.vue'

const auth = useAuthStore()
const theme = useThemeStore()
const publicUsers = ref([])
const loading = ref(true)

// Streak anchor = most recent of quit date and last logged slip.
// -1 for users with no dates so they sort to the bottom.
function streakDays(user) {
  return daysSinceLatest([user?.quit_date, user?.last_use_date], -1)
}

// Longest streak first.
const sortedUsers = computed(() =>
  [...publicUsers.value].sort((a, b) => streakDays(b) - streakDays(a))
)

onMounted(async () => {
  try {
    const records = await pb.collection('users').getList(1, 50, {
      filter: 'is_public = true && (quit_date != null || last_use_date != null)'
    })
    publicUsers.value = records.items
  } catch (e) {
    console.error('Failed to fetch public users:', e)
  } finally {
    loading.value = false
  }
})

// Leaderboard includes the current user (even if not public), sorted longest streak first.
const leaderboardUsers = computed(() => {
  const list = [...publicUsers.value]
  if (auth.user && !list.some(u => u.id === auth.user.id)) {
    list.push(auth.user)
  }
  return list.sort((a, b) => streakDays(b) - streakDays(a))
})
</script>

<template>
  <div>
    <!-- Logged In View -->
    <template v-if="auth.isLoggedIn">
      <!-- Stacked on mobile, side by side with divider on desktop -->
      <div class="flex flex-col md:flex-row gap-6 md:gap-8">
        <div class="space-y-6 md:w-1/2">
          <QuitCounter :user="auth.user" :is-own="true" />
          <Calendar />
        </div>

        <div
          class="hidden md:block w-px self-stretch"
          :class="theme.isDark ? 'bg-gray-700' : 'bg-gray-200'"
        ></div>

        <div class="md:w-1/2">
          <h2
            class="text-xl font-semibold mb-4"
            :class="theme.isDark ? 'text-white' : 'text-gray-800'"
          >
            Community Leaderboard
          </h2>
          <PublicCounters :users="leaderboardUsers" :loading="loading" :current-user-id="auth.user?.id" />
        </div>
      </div>
    </template>

    <!-- Logged Out View -->
    <template v-else>
      <div class="text-center mb-8">
        <h1
          class="text-3xl font-bold mb-2"
          :class="theme.isDark ? 'text-white' : 'text-gray-800'"
        >
          Welcome to Quitters
        </h1>
        <p :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'">
          Join our community of people quitting nicotine together.
        </p>
        <RouterLink
          to="/register"
          class="inline-block mt-4 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition font-medium"
        >
          Start Your Journey
        </RouterLink>
      </div>

      <h2
        class="text-xl font-semibold mb-4"
        :class="theme.isDark ? 'text-white' : 'text-gray-800'"
      >
        Community Leaderboard
      </h2>
      <PublicCounters :users="sortedUsers" :loading="loading" />
    </template>
  </div>
</template>
