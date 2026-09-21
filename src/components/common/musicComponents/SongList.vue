<script setup lang="ts">
import {
  PlayIcon,
  HeartIcon,
  ListPlusIcon,
  MoreVerticalIcon,
  BookmarkPlus,
  Trash2Icon,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Song, Artist, Album } from '@/types/musicTypes'
import ArtistDivider from './artistDivider.vue'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import { MESSAGE_TYPE } from '@/constants/messages'
import { usePlayerStore } from '@/stores/playerStore'
import { useUserStore } from '@/stores/user'
import { computed, onBeforeUnmount, ref, type ComponentPublicInstance, inject } from 'vue'
import { storeToRefs } from 'pinia'

const playerStore = usePlayerStore()
const userStore = useUserStore()
const { userLikeListSet } = storeToRefs(userStore)

// 通过 computed 追踪 userLikeListSet 的变化
const isSongLiked = computed(
  () => (songId: number | string) => userLikeListSet.value.has(Number(songId)),
)

const props = defineProps<{
  songs: Song[]
}>()

const isUserCreatePlayList = inject('isUserCreatePlayList', false)
const deletePlaylistPageSong = inject<(song: Song) => void>('deleteSong', () => {})

/*
 * 删除前的二次确认。
 *
 * 整个列表共用一个 AlertDialog 实例（不是 v-for 里每行一个，那会为每首歌
 * 实例化一套 reka-ui 弹窗），所以用 deleteTarget 记住「待删的那首」。
 *
 * 为什么要两个 ref，而不是把 open 直接写成 `deleteTarget !== null`：
 * AlertDialogAction 内部就是 DialogClose，reka-ui 把 onOpenChange(false) 挂在
 * **元素自身**的 onClick 上，父组件透传的 @click 经 Vue mergeProps 合并后排在它
 * **后面**执行 —— 即「弹窗关闭」的 update:open 会早于 confirmDeleteSong 触发。
 * 若两者共用一个 ref，关闭那一步已把它置空，确认时就拿不到目标歌曲了。
 * 因此：isDeleteDialogOpen 只管开关，deleteTarget 只在发起删除时被覆盖/清空。
 */
const isDeleteDialogOpen = ref(false)
const deleteTarget = ref<Song | null>(null)

const askDeleteSong = (song: Song) => {
  deleteTarget.value = song
  isDeleteDialogOpen.value = true
}

const confirmDeleteSong = () => {
  const song = deleteTarget.value
  if (song === null) return
  deleteTarget.value = null
  deletePlaylistPageSong(song)
}

// 取消 / ESC / 点确认后关闭都会走到这里；只同步开关，不动 deleteTarget
const handleDeleteDialogOpenChange = (open: boolean) => {
  isDeleteDialogOpen.value = open
}

// 存储所有 cover 的引用
const coverImgRefs = ref<HTMLImageElement[]>([])

// 设置引用的方法，在组件销毁时图片纹理缓存能够正常的GC
const setCoverRef = (el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLImageElement && !coverImgRefs.value.includes(el)) {
    coverImgRefs.value.push(el)
  }
}

onBeforeUnmount(() => {
  // 清空 coverImgRefs 数组
  coverImgRefs.value.forEach((img) => {
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  })
  coverImgRefs.value.length = 0
})

const handleInsertSong = (song: Song) => {
  emitter.emit(EVENTS.INSERT_NEXT, song)
  emitter.emit(MESSAGE_TYPE.TOAST_INFO, `已将歌曲 "${song.title}" 插入到下一首`)
}

const playSong = (song: Song) => {
  emitter.emit(EVENTS.INSERT_AND_PLAY, song)
  emitter.emit(MESSAGE_TYPE.TOAST_INFO, `开始播放歌曲 "${song.title}"`)
}

const handleAddSongToUserPlaylist = (song: Song) => {
  emitter.emit(EVENTS.USER_COLLECT_SONG, song)
}
</script>

<template>
  <div class="song-list-container glass-card rounded-2xl p-6">
    <div class="space-y-2">
      <div
        v-for="(song, index) in songs"
        :key="song.id"
        class="song-item group"
        @dblclick="playSong(song)"
      >
        <div
          class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <!-- 序号/播放按钮 -->
          <div class="w-8 h-8 flex items-center justify-center">
            <span v-if="song.id !== playerStore.currentSong?.id" class="text-sm text-gray-500">{{
              index + 1
            }}</span>
            <PlayIcon v-else class="h-5 w-5 text-red-500" />
          </div>

          <!-- 封面 -->
          <img
            :ref="setCoverRef"
            :src="song.cover"
            :alt="song.title"
            class="w-12 h-12 rounded-lg object-cover"
          />

          <!-- 歌曲信息 -->
          <div class="flex-1 min-w-0">
            <span class="text-gray-900 dark:text-white truncate">
              {{ song.title }}
            </span>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span class="truncate">
                <ArtistDivider v-if="song.artist" :artists="song.artist" />
              </span>
              <span>•</span>
              <span
                class="truncate hover:text-red-500"
                @click.stop="emitter.emit(EVENTS.ALBUM_CLICK, song.album)"
                >{{ song.album.title }}</span
              >
              <span>•</span>
              <span>{{ song.duration }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" @click="emitter.emit(EVENTS.USER_LIKE_MUSIC, song)">
              <HeartIcon
                class="w-4 h-4 transition-all duration-300"
                :class="[userStore.isSongLiked(song) ? 'fill-red-500 text-red-500 scale-110' : '']"
              />
            </Button>
            <Button @click="handleInsertSong(song)" variant="ghost" size="icon">
              <ListPlusIcon class="h-4 w-4" />
            </Button>
            <Button @click="handleAddSongToUserPlaylist(song)" variant="ghost" size="icon">
              <BookmarkPlus class="h-4 w-4" />
            </Button>

            <Button
              v-if="isUserCreatePlayList"
              variant="ghost"
              size="icon"
              @click.stop="askDeleteSong(song)"
            >
              <Trash2Icon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除二次确认。覆盖三个 CSS 变量而非用 class 上色：styles/utilities.css 的
         .bg-primary / .border-primary 与 shadcn 同名工具类撞车且带 !important，
         class 覆盖会被顶掉，只能改它们真正读取的变量。 -->
    <AlertDialog :open="isDeleteDialogOpen" @update:open="handleDeleteDialogOpenChange">
      <AlertDialogContent
        class="sm:max-w-sm glass-card absolute! glass-effect"
        style="
          --primary: var(--primary-color);
          --bg-primary: var(--primary-color);
          --border-primary: var(--primary-color);
        "
      >
        <AlertDialogHeader>
          <AlertDialogTitle>删除歌曲</AlertDialogTitle>
          <AlertDialogDescription>
            确定要从歌单中删除《{{ deleteTarget?.title }}》吗？此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction @click="confirmDeleteSong">删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<style scoped>
:deep(.artist-divider .artist-name),
:deep(.artist-divider .artist-separator) {
  font-size: 14px;
}
/* 歌曲列表 */
.song-item {
  user-select: none;
  transition: all 1s ease-in-out;
  cursor: pointer;
  border-radius: 10px;
}

/* 浅色模式 - 透明毛玻璃效果 */
.song-item:hover .p-3 {
  background: rgba(201, 201, 201, 0.5);

  /* backdrop-filter: blur(10px) saturate(200%) brightness(1.05);
  -webkit-backdrop-filter: blur(25px) saturate(200%) brightness(1.05); */
}

/* 暗色模式 - 透明毛玻璃效果 */
.dark .song-item:hover .p-3 {
  background: rgba(255, 255, 255, 0.06);

  /* backdrop-filter: blur(10px) saturate(180%) brightness(1.5);
  -webkit-backdrop-filter: blur(10px) saturate(180%) brightness(1.5); */
}
</style>
