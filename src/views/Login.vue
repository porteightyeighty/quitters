<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    await auth.login(email.value, password.value)
    await nextTick()
    router.push('/')
  } catch (e) {
    error.value = e.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div 
      class="rounded-xl shadow-sm p-8 transition-colors duration-200"
      :class="theme.isDark ? 'bg-gray-800' : 'bg-white'"
    >
      <h1 
        class="text-2xl font-bold mb-6 text-center"
        :class="theme.isDark ? 'text-white' : 'text-gray-800'"
      >
        Welcome Back
      </h1>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label 
            class="block text-sm font-medium mb-1"
            :class="theme.isDark ? 'text-gray-300' : 'text-gray-700'"
          >
            Email
          </label>
          <input 
            type="email" 
            v-model="email"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            :class="theme.isDark 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900'"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label 
            class="block text-sm font-medium mb-1"
            :class="theme.isDark ? 'text-gray-300' : 'text-gray-700'"
          >
            Password
          </label>
          <input 
            type="password" 
            v-model="password"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            :class="theme.isDark 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900'"
            placeholder="••••••••"
          />
        </div>
        
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        
        <button 
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 font-medium"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      
      <p 
        class="text-center mt-6"
        :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'"
      >
        Don't have an account? 
        <RouterLink to="/register" class="text-indigo-500 hover:underline">Sign up</RouterLink>
      </p>
    </div>
  </div>
</template>
