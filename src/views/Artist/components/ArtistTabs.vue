<script setup lang="ts">
const modelValue = defineModel<string>();

const tabs = [
  { label: '歌曲', value: 'songs' as const },
  { label: '专辑', value: 'albums' as const },
  { label: '视频', value: 'videos' as const },
  { label: '动态', value: 'activities' as const }
];
</script>

<template>
  <div class=" sticky top-0 z-20 py-2">
    <div class="flex justify-center px-2">
      <div class="glass-tab-container rounded-xl px-1 py-1 shadow-lg border border-white/10 backdrop-blur-lg">
        <div class="flex gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            class="tab-button relative px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
            :class="modelValue === tab.value
              ? 'active-tab text-white'
              : 'inactive-tab text-gray-300 hover:text-white'"
            @click="modelValue = tab.value"
          >
            <span class="relative z-10">{{ tab.label }}</span>
            <span
              v-if="modelValue === tab.value"
              class="absolute inset-0 bg-gradient-to-r rounded-lg shadow bg-gradient-red-custom"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.tab-button {
  overflow: hidden;
}

.inactive-tab {
  background: rgba(255, 255, 255, 0.05);
}

.inactive-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.active-tab {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
}

/* 液态玻璃流动效果 */
@keyframes liquidFlow {
  0%, 100% {
    transform: translateX(-100%) skewX(-15deg);
  }
  50% {
    transform: translateX(100%) skewX(-15deg);
  }
}

.active-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: liquidFlow 3s infinite;
  z-index: 0;
}

@media (max-width: 768px) {
  .artist-tabs {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .glass-tab-container {
    padding-left: 0.125rem;
    padding-right: 0.125rem;
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    border-radius: 12px;
  }

  .tab-button {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    font-size: 0.7rem;
    min-width: 60px;
  }
}

@media (max-width: 480px) {
  .tab-button {
    padding-left: 0.375rem;
    padding-right: 0.375rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    font-size: 0.65rem;
    min-width: 50px;
  }
}
</style>