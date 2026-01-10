import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pb from '../lib/pocketbase'
import { useAuthStore } from './auth'

export const useTrackingStore = defineStore('tracking', () => {
  const entries = ref([])
  const loading = ref(false)

  const auth = useAuthStore()


  // Get entries for a specific month
  async function fetchEntriesForMonth(year, month) {
    if (!auth.user) return
    
    loading.value = true
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
      
      const records = await pb.collection('tracking_entries').getList(1, 100, {
        filter: `user = "${auth.user.id}" && date >= "${startDate}" && date <= "${endDate}"`,
        sort: '-date'
      })
      
      entries.value = records.items
    } catch (e) {
      console.error('Failed to fetch entries:', e)
    } finally {
      loading.value = false
    }
  }

  // Get all entries for calculating streak
  async function fetchAllEntries() {
    if (!auth.user) return []
    
    try {
      const records = await pb.collection('tracking_entries').getFullList({
        filter: `user = "${auth.user.id}"`,
        sort: '-date'
      })
      return records
    } catch (e) {
      console.error('Failed to fetch all entries:', e)
      return []
    }
  }

  // Add or update entry for a specific date
  async function setEntry(date, type) {
    if (!auth.user) return
    
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date
    
    try {
      // Check if entry exists for this date
      const existing = entries.value.find(e => e.date.split(' ')[0] === dateStr)
      
      let result
      if (existing) {
        // Update existing
        result = await pb.collection('tracking_entries').update(existing.id, { type })
        const idx = entries.value.findIndex(e => e.id === existing.id)
        if (idx !== -1) entries.value[idx] = result
      } else {
        // Create new
        result = await pb.collection('tracking_entries').create({
          user: auth.user.id,
          date: dateStr,
          type
        })
        entries.value.push(result)
      }
      // last_use_date is updated automatically by PocketBase hooks

      return result
    } catch (e) {
      console.error('Failed to set entry:', e)
      throw e
    }
  }

  // Remove entry for a specific date
  async function removeEntry(date) {
    if (!auth.user) return
    
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date
    const existing = entries.value.find(e => e.date.split(' ')[0] === dateStr)
    
    if (existing) {
      try {
        await pb.collection('tracking_entries').delete(existing.id)
        entries.value = entries.value.filter(e => e.id !== existing.id)
        // last_use_date is updated automatically by PocketBase hooks
      } catch (e) {
        console.error('Failed to remove entry:', e)
        throw e
      }
    }
  }

  // Get entry for a specific date
  function getEntryForDate(date) {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date
    return entries.value.find(e => e.date.split(' ')[0] === dateStr)
  }

  // Calculate days since last nicotine use
  const daysSinceLastUse = computed(() => {
    if (entries.value.length === 0) return null
    
    // Find most recent entry
    const sorted = [...entries.value].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
    
    if (sorted.length === 0) return null
    
    const lastUse = new Date(sorted[0].date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    lastUse.setHours(0, 0, 0, 0)
    
    const diff = Math.floor((today - lastUse) / (1000 * 60 * 60 * 24))
    return diff
  })

  function clearEntries() {
    entries.value = []
  }

  return {
    entries,
    loading,
    fetchEntriesForMonth,
    fetchAllEntries,
    setEntry,
    removeEntry,
    getEntryForDate,
    daysSinceLastUse,
    clearEntries
  }
})
