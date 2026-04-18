<script setup lang="ts">
import CommonTabs from '@/components/common/pageComponents/CommonTabs.vue';
import type { TabItem } from '@/components/common/pageComponents/CommonTabs.vue';

const modelValue = defineModel<string>();

const tabs: TabItem[] = [
  { label: '歌曲', value: 'songs' },
  { label: '评论', value: 'comments' },
];
</script>

<template>
  <CommonTabs v-model="modelValue" :tabs="tabs" />
</template>
