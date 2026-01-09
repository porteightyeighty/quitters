import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pb from '../lib/pocketbase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(pb.authStore.model)
  const isLoggedIn = computed(() => pb.authStore.isValid)

  // Listen for auth changes
  pb.authStore.onChange(() => {
    user.value = pb.authStore.model
  })

  async function login(email, password) {
    const authData = await pb.collection('users').authWithPassword(email, password)
    user.value = authData.record
    return authData
  }

  async function register(email, password, username) {
    const data = {
      email,
      password,
      passwordConfirm: password,
      username,
      quit_date: null,
      is_public: true
    }
    const record = await pb.collection('users').create(data)
    await login(email, password)
    return record
  }

  function logout() {
    pb.authStore.clear()
    user.value = null
    // Note: tracking store should be cleared separately if needed
  }

  async function updateProfile(data) {
    if (!user.value) return
    const updated = await pb.collection('users').update(user.value.id, data)
    user.value = updated
    return updated
  }

  return {
    user,
    isLoggedIn,
    login,
    register,
    logout,
    updateProfile
  }
})
