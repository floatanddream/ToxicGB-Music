<script setup lang="ts">
/**
 * PlaylistGridInfinite — PlaylistGrid 的渐进渲染包装
 *
 * 区别于基础 PlaylistGrid：
 * - 父组件传全量 playlists，组件内只渲染前 N 个
 * - 滚动到底部（IntersectionObserver 触发）追加 B 个
 * - 解决大用户（罕见但可能 100+ 歌单）一次性渲染 DOM 节点的 TTI 问题
 *
 * 注意：fetchUserPlaylist 后端暂时不支持分页，
 * 本组件只做"渐进渲染"，不做网络分页。
 * 复用通用 InfiniteScroll（IntersectionObserver + hasMore/load-more），
 * 不重复实现 observer 逻辑。
 */
import { ref, computed, watch } from 'vue'
import PlaylistGrid from '@/components/common/pageComponents/PlaylistGrid.vue'
import InfiniteScroll from './InfiniteScroll.vue'
import type { Playlist } from '@/types/musicTypes'

const props = withDefaults(
	defineProps<{
		/** 全量歌单数组 */
		playlists: Playlist[]
		/** 初始渲染数量 */
		initialCount?: number
		/** 每次追加数量 */
		batchSize?: number
	}>(),
	{
		initialCount: 30,
		batchSize: 30,
	},
)

const displayCount = ref(props.initialCount)

const hasMore = computed(() => displayCount.value < props.playlists.length)
const displayedPlaylists = computed(() => props.playlists.slice(0, displayCount.value))

const loadMore = () => {
	displayCount.value = Math.min(
		displayCount.value + props.batchSize,
		props.playlists.length,
	)
}

// 切换用户时（props.playlists 引用变化）重置 displayCount
watch(
	() => props.playlists,
	() => {
		displayCount.value = props.initialCount
	},
)
</script>

<template>
	<InfiniteScroll :has-more="hasMore" @load-more="loadMore">
		<PlaylistGrid :playlists="displayedPlaylists" />
	</InfiniteScroll>
</template>