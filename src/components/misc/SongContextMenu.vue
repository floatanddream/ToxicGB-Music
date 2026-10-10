<script setup lang="ts">
/**
 * 单曲右键菜单。调用方把「行」塞进默认插槽，右键那一行即弹出本菜单。
 *
 * 与同目录的 Menu.vue 是**两回事**，不能合并：那个挂在 LayoutContainer 的 <main> 上，
 * 动作对象永远固定为「当前正在播的那首」（playerStore.currentSong）；这个的动作对象是
 * **传进来的那一首**。
 *
 * 动作分发沿用项目既有约定：跨组件的走事件总线，与 Menu.vue / SongList.vue 的 payload
 * 完全一致；只有「从当前播放列表删除」直接调 store —— 它改的是播放器自己的队列，
 * 没有跨组件语义，绕一圈事件总线只是多一层间接。
 *
 * ⚠️ 术语：本项目里「喜欢」与「收藏」是两件事，不要混。
 *   喜欢 = 红心，走 /like（EVENTS.USER_LIKE_MUSIC）
 *   收藏 = 收进某个歌单，走 /playlist/tracks（EVENTS.USER_COLLECT_SONG）
 */
import {
  DiscAlbum,
  Heart,
  ListPlus,
  MessageSquare,
  Play,
  Trash2,
  UserCircle2Icon,
} from 'lucide-vue-next'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { usePlayerStore } from '@/stores/playerStore'
import { useUserStore } from '@/stores/user'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import type { Song } from '@/types/player'
import type { Artist } from '@/types/musicTypes'

const props = defineProps<{
  /** 被右键的那一首。菜单里所有动作的对象都是它 */
  song: Song
}>()

const playerStore = usePlayerStore()
const userStore = useUserStore()

/** 每次渲染现读 —— userLikeListSet 被替换成新 Set，读的时候就被追踪上了 */
const isLiked = () => userStore.isSongLiked(props.song)

const handlePlay = () => {
  emitter.emit(EVENTS.SWITCH_SONG, props.song)
}

// toggleLikeMusic 内部自带成功 / 失败的 toast，这里不再报一次
const handleToggleLike = () => {
  emitter.emit(EVENTS.USER_LIKE_MUSIC, props.song)
}

const handleClickAlbum = () => {
  emitter.emit(EVENTS.ALBUM_CLICK, props.song.album)
}

const handleClickArtist = (artist: Artist) => {
  emitter.emit(EVENTS.ARTIST_CLICK, artist)
}

const handleCollectToPlaylist = () => {
  emitter.emit(EVENTS.USER_COLLECT_SONG, props.song)
}

const handleRemove = () => {
  playerStore.removeFromPlaylist(props.song)
}
</script>

<template>
  <ContextMenu>
    <!--
      as-child 是硬需求：reka 的 trigger 默认渲染一个 <span>，包在行外面会多出一个盒子，
      把 PlaylistPanel 虚拟滚动的行高（ITEM_HEIGHT = 68）算歪。
      as-child 让 reka 把右键监听 merge 到调用方那一行上，DOM 一个节点都不多
      （mergeProps 会保留行自己的 @dblclick、:class）。
    -->
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>

    <!--
      z-[10001] 是硬需求，不是调色。菜单内容被 Portal 送到 <body>，而「正在播放」面板
      （.playlist-panel）也是 Teleport to="body" 出来的固定层、z-index: 10000
      （PlaylistPanel.vue）。两者是 <body> 下的平级兄弟，shadcn 默认的 z-50 会让菜单
      被面板整个盖住 —— 症状是「右键点了什么都不出现」。
      与 AlertDialogContent 抬到 z-500（躲 z-100 的 .player-footer）是同一类问题。
      reka-ui 自身不设任何 z-index，所以覆盖 shadcn 这一层就是全部。

      必须写成模板里的字面量：Tailwind v4 靠扫描源码提取候选类，提成 JS 常量就扫不到。
    -->
    <ContextMenuContent class="z-[10001]">
      <ContextMenuItem @click="handlePlay">
        <Play class="size-4" />
        <span>播放</span>
      </ContextMenuItem>

      <!-- 后端没有单曲评论接口（只有 /comment/playlist、/comment/album），先占位 -->
      <ContextMenuItem disabled>
        <MessageSquare class="size-4" />
        <span>查看评论（待开发）</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem @click="handleToggleLike">
        <Heart class="size-4" :class="isLiked() ? 'fill-red-500 text-red-500' : ''" />
        <span>{{ isLiked() ? '取消喜欢' : '喜欢歌曲' }}</span>
      </ContextMenuItem>

      <ContextMenuItem @click="handleClickAlbum">
        <DiscAlbum class="size-4" />
        <span>专辑：{{ song.album.title }}</span>
      </ContextMenuItem>

      <ContextMenuItem
        v-for="artist in song.artist"
        :key="artist.id"
        @click="handleClickArtist(artist)"
      >
        <UserCircle2Icon class="size-4" />
        <span>歌手：{{ artist.name }}</span>
      </ContextMenuItem>

      <ContextMenuItem @click="handleCollectToPlaylist">
        <ListPlus class="size-4" />
        <span>收藏到歌单</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <!--
        不用 ContextMenuItem 的 variant="destructive"：它依赖 --destructive-foreground，
        而 tokens.css 只定义了 --destructive，没有 -foreground —— 文本颜色会落到
        「var() 无效 → inherit」上，不如直接给图标标红来得确定。
      -->
      <ContextMenuItem @click="handleRemove">
        <Trash2 class="size-4" />
        <span>从当前播放列表删除</span>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
