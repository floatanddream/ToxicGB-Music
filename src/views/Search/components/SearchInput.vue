<script setup lang="ts">
import { ref } from 'vue';
import { SearchIcon, XIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const searchQuery = ref('');
const emit = defineEmits(['search']);

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim());
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
};
</script>

<template>
  <div class="search-input-container">
    <div class="relative">
      <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        v-model="searchQuery"
        type="text"
        placeholder="搜索歌曲、歌手、专辑..."
        class="pl-10 pr-10 py-6 rounded-2xl"
        @keyup.enter="handleSearch"
      />
      <Button
        v-if="searchQuery"
        variant="ghost"
        size="icon"
        class="absolute right-2 top-1/2 transform -translate-y-1/2"
        @click="clearSearch"
      >
        <XIcon class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>

<style scoped>
.search-input-container {
  max-width: 800px;
  margin: 0 auto 30px;
}
</style>