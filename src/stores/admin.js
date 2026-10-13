import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', () => {

  const isCollapse = ref(false)
  function toggleCollapse() {
    isCollapse.value = !isCollapse.value
  }
 
  return { isCollapse, toggleCollapse }
  
})
