<script setup lang="ts">
import CommonTabs from '@/components/common/pageComponents/CommonTabs.vue';
import type { TabItem } from '@/components/common/pageComponents/CommonTabs.vue';

const modelValue = defineModel<string>();

const tabs: TabItem[] = [
  { label: '歌曲', value: 'songs' },
  { label: '专辑', value: 'albums' },
  { label: '视频', value: 'videos' },
  { label: '动态', value: 'activities' },
];
</script>

<template>
  <CommonTabs v-model="modelValue" :tabs="tabs" />
</template>