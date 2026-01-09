import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  // Initialize from localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('quitters-theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  // Watch for changes and persist
  watch(isDark, (value) => {
    localStorage.setItem('quitters-theme', value ? 'dark' : 'light')
    updateDocumentClass(value)
  }, { immediate: true })

  function updateDocumentClass(dark) {
    if (typeof document !== 'undefined') {
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  function toggle() {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggle
  }
})
