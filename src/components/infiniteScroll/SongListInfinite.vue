<script setup lang="ts">
/**
 * SongListInfinite — SongList 的无限加载包装
 *
 * 区别于基础 SongList：
 * - 父组件传全量 songs，组件内只渲染前 N 首
 * - 滚动到底部（IntersectionObserver 触发）追加 B 首
 * - 解决大歌单（1000+ 首）一次性渲染 1000 个 DOM 节点的 TTI 问题
 *
 * 本组件复用通用 InfiniteScroll（IntersectionObserver + hasMore/load-more），
 * 不重复实现 observer 逻辑；只负责分批切片与切换重置。
 *
 * 注意：本组件不处理网络分页，仍是"渐进渲染"。
 * 真正的网络分页需要父组件在 observer 触发时调用增量 API（如 /playlist/track/all）。
 */
import { ref, computed, watch } from 'vue'
import SongList from '@/components/common/musicComponents/SongList.vue'
import InfiniteScroll from './InfiniteScroll.vue'
import type { Song } from '@/types/musicTypes'

const props = withDefaults(
  defineProps<{
    /** 全量歌曲数组 */
    songs: Song[]
    /** 初始渲染数量 */
    initialCount?: number
    /** 每次追加数量 */
    batchSize?: number
  }>(),
  {
    initialCount: 20,
    batchSize: 20,
  },
)

const displayCount = ref(props.initialCount)

const hasMore = computed(() => displayCount.value < props.songs.length)
const displayedSongs = computed(() => props.songs.slice(0, displayCount.value))

const loadMore = () => {
  displayCount.value = Math.min(
    displayCount.value + props.batchSize,
    props.songs.length,
  )
}

// 歌单切换时（props.songs 引用变化）重置 displayCount
watch(
  () => props.songs,
  () => {
    displayCount.value = props.initialCount
  },
)
</script>

<template>
  <InfiniteScroll :has-more="hasMore" @load-more="loadMore">
    <SongList :songs="displayedSongs" />
  </InfiniteScroll>
</template>