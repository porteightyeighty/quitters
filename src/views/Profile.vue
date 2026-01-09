<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import pb from '../lib/pocketbase'
import PublicQuitCounter from '../components/PublicQuitCounter.vue'
import PublicCalendar from '../components/PublicCalendar.vue'

const route = useRoute()
const theme = useThemeStore()

const user = ref(null)
const entries = ref([])
const loading = ref(true)
const error = ref(null)

const userId = computed(() => route.params.id)

async function loadProfile() {
  loading.value = true
  error.value = null
  
  try {
    const userData = await pb.collection('users').getOne(userId.value)
    
    if (!userData.is_public) {
      error.value = 'This profile is private'
      return
    }
    
    user.value = userData
    
    const records = await pb.collection('tracking_entries').getFullList({
      filter: `user = "${userId.value}"`,
      sort: '-date'
    })
    entries.value = records
    
  } catch (e) {
    console.error('Failed to load profile:', e)
    error.value = 'Profile not found'
  } finally {
    loading.value = false
  }
}

const displayName = computed(() => {
  return user.value?.username || user.value?.email?.split('@')[0] || 'Anonymous'
})

onMounted(loadProfile)
watch(userId, loadProfile)
</script>

<template>
  <div>
    <!-- Loading -->
    <div 
      v-if="loading" 
      class="text-center py-12"
      :class="theme.isDark ? 'text-gray-400' : 'text-gray-500'"
    >
      <p>Loading profile...</p>
    </div>
    
    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <div 
        class="rounded-xl shadow-sm p-8 max-w-md mx-auto"
        :class="theme.isDark ? 'bg-gray-800' : 'bg-white'"
      >
        <p 
          class="mb-4"
          :class="theme.isDark ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ error }}
        </p>
        <RouterLink to="/" class="text-indigo-500 hover:underline">
          ← Back to Dashboard
        </RouterLink>
      </div>
    </div>
    
    <!-- Profile -->
    <div v-else class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <RouterLink to="/" class="text-indigo-500 hover:underline text-sm">
          ← Back to Dashboard
        </RouterLink>
      </div>
      
      <div class="space-y-6">
        <PublicQuitCounter :user="user" :entries="entries" />
        <PublicCalendar :entries="entries" :username="displayName" />
      </div>
    </div>
  </div>
</template>
