<script setup>
import { useThemeStore } from '../stores/theme'

const theme = useThemeStore()
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="rounded-xl shadow-sm p-8 transition-colors duration-200"
      :class="theme.isDark ? 'bg-gray-800' : 'bg-white'">
      <h1 class="text-3xl font-bold mb-6" :class="theme.isDark ? 'text-white' : 'text-gray-800'">
        About Quitters
      </h1>

      <div class="prose space-y-4" :class="theme.isDark ? 'text-gray-300' : 'text-gray-600'">
        <p>
          <strong :class="theme.isDark ? 'text-white' : 'text-gray-800'">Quitters</strong> is an app designed to help
          people
          track and showcase their journey to quit nicotine — whether that's
          cigarettes, vapes, or any other nicotine delivery system.
        </p>

        <h2 class="text-xl font-semibold mt-6" :class="theme.isDark ? 'text-white' : 'text-gray-800'">
          How It Works
        </h2>
        <p>
          Log your nicotine use on the calendar, and we'll track how many days you've been
          smoke and vape free. Share your progress publicly to inspire others and stay accountable,
          or keep it private if you prefer.
        </p>

        <h2 class="text-xl font-semibold mt-6" :class="theme.isDark ? 'text-white' : 'text-gray-800'">
          Privacy First
        </h2>
        <p>
          You choose what to share. Your email stays private, and you can toggle your
          progress visibility at any time in Settings.
        </p>
      </div>
    </div>
  </div>
</template>
