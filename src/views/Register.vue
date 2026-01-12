<script setup>
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useThemeStore } from "../stores/theme";

const router = useRouter();
const auth = useAuthStore();
const theme = useThemeStore();

const username = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleRegister() {
  error.value = "";
  loading.value = true;

  try {
    await auth.register(email.value, password.value, username.value);
    await nextTick();
    router.push("/");
  } catch (e) {
    error.value = e.message || "Registration failed";
  } finally {
    loading.value = false;
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
        class="text-2xl font-bold mb-2 text-center"
        :class="theme.isDark ? 'text-white' : 'text-gray-800'"
      >
        Start Your Journey
      </h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label
            class="block text-sm font-medium mb-1"
            :class="theme.isDark ? 'text-gray-300' : 'text-gray-700'"
          >
            Username
          </label>
          <input
            type="text"
            v-model="username"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            :class="
              theme.isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900'
            "
            placeholder="QuitterPro123"
          />
        </div>

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
            :class="
              theme.isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900'
            "
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
            minlength="8"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            :class="
              theme.isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900'
            "
            placeholder="••••••••"
          />
          <p
            class="text-xs mt-1"
            :class="theme.isDark ? 'text-gray-500' : 'text-gray-500'"
          >
            Minimum 8 characters
          </p>
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 font-medium"
        >
          {{ loading ? "Creating account..." : "Create Account" }}
        </button>
      </form>

      <p
        class="text-center mt-6"
        :class="theme.isDark ? 'text-gray-400' : 'text-gray-600'"
      >
        Already have an account?
        <RouterLink to="/login" class="text-indigo-500 hover:underline"
          >Sign in</RouterLink
        >
      </p>
    </div>
  </div>
</template>
