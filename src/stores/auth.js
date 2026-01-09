import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pb from '../lib/pocketbase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(pb.authStore.model)
  const token = ref(pb.authStore.token)
  
  // isLoggedIn must be based on reactive refs, not pb.authStore directly
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // Listen for auth changes (e.g., token expiry, external changes)
  pb.authStore.onChange((newToken, model) => {
    token.value = newToken
    user.value = model
  }, true)

  async function login(email, password) {
    const authData = await pb.collection('users').authWithPassword(email, password)
    user.value = authData.record
    token.value = pb.authStore.token
    return authData
  }

  async function register(email, password, username) {
    const data = {
      email,
      password,
      passwordConfirm: password,
      username,
      is_public: true
    }
    await pb.collection('users').create(data)
    // Login after registration
    return await login(email, password)
  }

  function logout() {
    pb.authStore.clear()
    user.value = null
    token.value = ''
  }

  async function updateProfile(data) {
    if (!user.value) return
    const updated = await pb.collection('users').update(user.value.id, data)
    user.value = updated
    return updated
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
    updateProfile
  }
})
