<script setup lang="ts">
import CommonTabs from '@/components/common/pageComponents/CommonTabs.vue';
import type { TabItem } from '@/components/common/pageComponents/CommonTabs.vue';

const modelValue = defineModel<string>();

const tabs: TabItem[] = [
  { label: '歌单', value: 'playlists' },
  { label: '关注', value: 'follows' },
  { label: '粉丝', value: 'followeds' },
];
</script>

<template>
  <CommonTabs v-model="modelValue" :tabs="tabs" />
</template>