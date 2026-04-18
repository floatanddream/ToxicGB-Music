<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TabItem {
  label: string;
  value: string;
}

const modelValue = defineModel<string>();

const props = defineProps<{
  tabs: TabItem[];
}>();
</script>

<template>
  <div class="sticky top-0 z-20 py-2">
    <div class="inline-flex px-2">
      <Tabs
        v-model="modelValue"
        class="glass-tab-container w-full rounded-xl px-1 py-1 shadow-lg border border-white/10 backdrop-blur-lg"
      >
        <TabsList class="bg-transparent w-full flex gap-1">
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            class="tab-button relative flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 data-[state=inactive]:text-gray-300 data-[state=active]:text-white"
          >
            <span class="relative z-10">{{ tab.label }}</span>
            <span
              v-if="modelValue === tab.value"
              class="absolute inset-0 bg-gradient-to-r rounded-lg shadow bg-gradient-red-custom"
            ></span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>

.tab-button {
  overflow: hidden;
}

:deep(.tabs-trigger[data-state='inactive']) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.tabs-trigger[data-state='inactive']):hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

:deep(.tabs-trigger[data-state='active']) {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
}

/* 动态玻璃流动效果 */
@keyframes liquidFlow {
  0%, 100% {
    transform: translateX(-100%) skewX(-15deg);
  }
  50% {
    transform: translateX(100%) skewX(-15deg);
  }
}

:deep(.tabs-trigger[data-state='active'])::before {
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
