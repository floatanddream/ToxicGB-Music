<script setup lang="ts">
import CommonTabs from '@/components/common/pageComponents/CommonTabs.vue';
import type { TabItem } from '@/components/common/pageComponents/CommonTabs.vue';

const modelValue = defineModel<string>();

const tabs: TabItem[] = [
  { label: '歌单', value: 'playlists' },
];
</script>

<template>
  <CommonTabs v-model="modelValue" :tabs="tabs" />
</template>