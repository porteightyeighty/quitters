<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const auth = useAuthStore()
const theme = useThemeStore()

const isPublic = ref(auth.user?.is_public ?? true)
const saving = ref(false)
const message = ref('')

async function saveSettings() {
  saving.value = true
  message.value = ''
  
  try {
    await auth.updateProfile({
      is_public: isPublic.value
    })
    message.value = 'Settings saved!'
  } catch (e) {
    message.value = 'Failed to save settings: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto">
    <div 
      class="rounded-xl shadow-sm p-8 transition-colors duration-200"
      :class="theme.isDark ? 'bg-gray-800' : 'bg-white'"
    >
      <h1 
        class="text-2xl font-bold mb-6"
        :class="theme.isDark ? 'text-white' : 'text-gray-800'"
      >
        Settings
      </h1>
      
      <form @submit.prevent="saveSettings" class="space-y-6">
        <!-- Public Toggle -->
        <div>
          <label class="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="isPublic"
              class="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span :class="theme.isDark ? 'text-gray-200' : 'text-gray-700'">
              Show my progress publicly
            </span>
          </label>
          <p 
            class="text-sm mt-1 ml-8"
            :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'"
          >
            When enabled, your username and days since last use will appear on the public dashboard.
          </p>
        </div>
        
        <!-- Submit -->
        <div class="flex items-center gap-4">
          <button 
            type="submit"
            :disabled="saving"
            class="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
          <span 
            v-if="message" 
            :class="message.includes('Failed') ? 'text-red-500' : 'text-indigo-500'" 
            class="text-sm"
          >
            {{ message }}
          </span>
        </div>
      </form>
      
      <!-- Info about tracking -->
      <div 
        class="mt-8 pt-6 border-t"
        :class="theme.isDark ? 'border-gray-700' : ''"
      >
        <h2 
          class="text-lg font-semibold mb-2"
          :class="theme.isDark ? 'text-white' : 'text-gray-800'"
        >
          How Tracking Works
        </h2>
        <p 
          class="text-sm mb-3"
          :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'"
        >
          Your progress is calculated from the entries you log on the calendar. 
          Click any date to record what you used that day.
        </p>
        <ul 
          class="text-sm space-y-1"
          :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'"
        >
          <li>🚬 <strong>Smoked</strong> — Cigarettes, cigars, etc.</li>
          <li>💨 <strong>Vaped</strong> — E-cigarettes, vape pens</li>
          <li>💊 <strong>Nicotine Replacement</strong> — Patches, gum, lozenges</li>
        </ul>
        <p 
          class="text-sm mt-3"
          :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'"
        >
          Your counter shows days since your most recent entry of any type.
        </p>
      </div>
    </div>
  </div>
</template>
