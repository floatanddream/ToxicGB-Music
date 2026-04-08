
<template>
  <div class="search-bar group" :class="{ 'focused': isFocused }">
    <input
      v-model="query"
      type="text"
      :placeholder="placeholder || '搜索歌曲、歌手、专辑...'"
      class="search-input"
      @keypress="handleKeyPress"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <button class="search-button" @click="handleSearch">
      <SearchIcon class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SearchIcon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();
const isFocused = ref(false);

defineProps<{
  placeholder?: string
}>();

const emit = defineEmits<{
  search: [query: string]
}>();

const query = defineModel<string>();

const handleSearch = () => {
  if (query.value?.trim()) {
    router.push({
      path: '/search',
      query: {
        keywords: query.value
      }
    });
    emit('search', query.value);
  }
};

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  border-radius: 20px;
  padding: 0 15px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.dark .search-bar {
  background: rgba(17, 25, 40, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.search-bar.focused {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(14, 165, 233, 0.3);
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.1);
}

.dark .search-bar.focused {
  background: rgba(17, 25, 40, 0.25);
  border-color: rgba(14, 165, 233, 0.2);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 15px;
  font-size: 15px;
  color: #1e293b;
  transition: color 0.3s ease;
}

.dark .search-input {
  color: #f1f5f9;
}

.search-input::placeholder {
  color: #94a3b8;
}

.dark .search-input::placeholder {
  color: #64748b;
}

.search-button {
  border: none;
  background: none;
  cursor: pointer;
  padding: 10px;
  color: #64748b;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.dark .search-button {
  color: #94a3b8;
}

.search-button:hover {
  background: rgba(14, 165, 233, 0.1);
  color: #0ea5e9;
}

.dark .search-button:hover {
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
}

.search-bar.group {
  position: relative;
}

.search-bar.group::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 25px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.search-bar.group.focused::before {
  opacity: 1;
}
</style>