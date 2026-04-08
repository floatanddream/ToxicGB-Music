<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter();

defineProps<{
  placeholder?: string
}>()

const emit = defineEmits<{
  search: [query: string]
}>()

const query = defineModel<string>()

const handleSearch = () => {
  
  if (query.value?.trim()) {
     router.push({
    path: '/search',
    query: {
      keywords: query.value
    }
  })
  }
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
  <div class="search-bar">
    <input
      v-model="query"
      type="text"
      :placeholder="placeholder || '搜索...'"
      class="search-input"
      @keypress="handleKeyPress"
    />
    <button class="search-button" @click="handleSearch">
      🔍
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  background-color: #f0f2f5;
  border-radius: 20px;
  padding: 0 15px;
  transition: background-color 0.3s ease;
}

.search-bar:focus-within {
  background-color: #e4e6e9;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 8px 10px;
  font-size: 14px;
}

.search-button {
  border: none;
  background: none;
  cursor: pointer;
  padding: 8px;
  color: #666;
  font-size: 16px;
}
</style>