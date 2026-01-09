<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import pb from '../lib/pocketbase'
import QuitCounter from '../components/QuitCounter.vue'
import Calendar from '../components/Calendar.vue'
import PublicCounters from '../components/PublicCounters.vue'

const auth = useAuthStore()
const theme = useThemeStore()
const publicUsers = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const records = await pb.collection('users').getList(1, 50, {
      filter: 'is_public = true && last_use_date != null',
      sort: '-last_use_date'
    })
    publicUsers.value = records.items
  } catch (e) {
    console.error('Failed to fetch public users:', e)
  } finally {
    loading.value = false
  }
})

const otherUsers = computed(() => {
  if (!auth.user) return publicUsers.value
  return publicUsers.value.filter(u => u.id !== auth.user.id)
})
</script>

<template>
  <div>
    <!-- Logged In View -->
    <template v-if="auth.isLoggedIn">
      <!-- Mobile layout - stacked -->
      <div class="md:hidden space-y-6">
        <QuitCounter :user="auth.user" :is-own="true" />
        <Calendar />
        <div>
          <h2 
            class="text-xl font-semibold mb-4"
            :class="theme.isDark ? 'text-white' : 'text-gray-800'"
          >
            Community Progress
          </h2>
          <PublicCounters :users="otherUsers" :loading="loading" />
        </div>
      </div>
      
      <!-- Desktop layout - side by side with divider -->
      <div class="hidden md:flex gap-8">
        <div class="w-1/2 space-y-6">
          <QuitCounter :user="auth.user" :is-own="true" />
          <Calendar />
        </div>
        
        <div 
          class="w-px self-stretch"
          :class="theme.isDark ? 'bg-gray-700' : 'bg-gray-200'"
        ></div>
        
        <div class="w-1/2">
          <h2 
            class="text-xl font-semibold mb-4"
            :class="theme.isDark ? 'text-white' : 'text-gray-800'"
          >
            Community Progress
          </h2>
          <PublicCounters :users="otherUsers" :loading="loading" />
        </div>
      </div>
    </template>

    <!-- Logged Out View -->
    <template v-else>
      <!-- Mobile layout -->
      <div class="md:hidden">
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
          Community Progress
        </h2>
        <PublicCounters :users="publicUsers" :loading="loading" />
      </div>
      
      <!-- Desktop layout -->
      <div class="hidden md:block">
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
          Community Progress
        </h2>
        <PublicCounters :users="publicUsers" :loading="loading" />
      </div>
    </template>
  </div>
</template>
