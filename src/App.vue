<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useTrackingStore } from './stores/tracking'
import { RouterLink, RouterView } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()
const tracking = useTrackingStore()

function handleLogout() {
  auth.logout()
  tracking.clearEntries()
  router.push('/')
}
</script>

<template>
  <div 
    class="min-h-screen transition-colors duration-200"
    :class="theme.isDark 
      ? 'bg-gradient-to-br from-gray-900 to-slate-800' 
      : 'bg-gradient-to-br from-indigo-50 to-purple-100'"
  >
    <!-- Navigation -->
    <nav 
      class="shadow-sm border-b transition-colors duration-200"
      :class="theme.isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-indigo-100'"
    >
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <RouterLink 
            to="/" 
            class="text-2xl font-bold transition-colors"
            :class="theme.isDark ? 'text-indigo-400' : 'text-indigo-600'"
          >
            🚭 Quitters
          </RouterLink>
          
          <div class="flex items-center gap-6">
            <RouterLink 
              to="/" 
              class="transition-colors"
              :class="theme.isDark 
                ? 'text-gray-300 hover:text-indigo-400' 
                : 'text-gray-600 hover:text-indigo-600'"
            >
              Dashboard
            </RouterLink>
            <RouterLink 
              to="/about" 
              class="transition-colors"
              :class="theme.isDark 
                ? 'text-gray-300 hover:text-indigo-400' 
                : 'text-gray-600 hover:text-indigo-600'"
            >
              About
            </RouterLink>
            
            <template v-if="auth.isLoggedIn">
              <RouterLink 
                to="/settings" 
                class="transition-colors"
                :class="theme.isDark 
                  ? 'text-gray-300 hover:text-indigo-400' 
                  : 'text-gray-600 hover:text-indigo-600'"
              >
                Settings
              </RouterLink>
              <button 
                @click="handleLogout" 
                class="px-4 py-2 text-sm rounded-lg transition-colors"
                :class="theme.isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <RouterLink 
                to="/login" 
                class="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Login
              </RouterLink>
            </template>
            
            <!-- Dark mode toggle -->
            <button 
              @click="theme.toggle()"
              class="p-2 rounded-lg transition-colors"
              :class="theme.isDark 
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              :title="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <span v-if="theme.isDark">☀️</span>
              <span v-else>🌙</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
