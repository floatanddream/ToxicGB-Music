<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Heart, Plus, Loader2 } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import type { Playlist, Song } from '@/types/musicTypes'
import request from '@/utils/request'
import emitter from '@/utils/eventBus'
import { MESSAGE_TYPE } from '@/constants/messages'
import { EVENTS } from '@/constants/events'
import { modifyPlaylistTracks } from '@/api/playlist'

const userStore = useUserStore()
const { userCreatePlaylist, isLogin } = storeToRefs(userStore)

const open = ref(false)
const currentSong = ref<Song | null>(null)
const loading = ref(false)
const addingPlaylist = ref<Playlist | null>(null)

const handleCollectSong = (song: unknown) => {
  currentSong.value = song as Song
  open.value = true
}


onMounted(() => {
  emitter.on(EVENTS.USER_COLLECT_SONG, handleCollectSong)
})

onUnmounted(() => {
  emitter.off(EVENTS.USER_COLLECT_SONG, handleCollectSong)
})

const addSongToPlaylist = async (playlist : Playlist) => {
  if (!isLogin.value) {
    emitter.emit(MESSAGE_TYPE.TOAST_WARNING, '请先登录')
    open.value = false
    return
  }

  loading.value = true
  addingPlaylist.value = playlist;

  try {
    console.log('歌单名字', playlist.title, '歌曲名字', currentSong.value?.title)
    const res = await modifyPlaylistTracks(playlist.id,currentSong.value?.id!,'add')

    if (res.body?.code === 200 || res.body?.code === '200') {
      emitter.emit(MESSAGE_TYPE.TOAST_SUSSESS, '已收藏到歌单')
      open.value = false
    } else {
      emitter.emit(MESSAGE_TYPE.TOAST_ERROR, res.body?.message || '收藏失败')
    }
  } catch (err: any) {
    emitter.emit(MESSAGE_TYPE.TOAST_ERROR, err?.body?.message || '收藏失败')
  } finally {
    loading.value = false
    addingPlaylist.value = null
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="change-container absolute! glass-container max-w-md p-8 rounded-2xl z-500 overflow-hidden ">
      <DialogHeader>
        <DialogTitle>收藏歌曲《{{ currentSong?.title }}》到歌单</DialogTitle>
        <DialogDescription class="sr-only">选择要收藏的歌单</DialogDescription>
      </DialogHeader>
      <ScrollArea class="max-h-150 mt-4">
        <div v-if="userCreatePlaylist.length > 0" class="space-y-2">
          <button
            v-for="playlist in userCreatePlaylist"
            :key="playlist.id"
            class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
            :disabled="loading"
            @click="addSongToPlaylist(playlist)"
          >
            <img
              :src="playlist.cover"
              :alt="playlist.title"
              class="size-10 rounded object-cover"
            />
            <span class="flex-1 text-left text-sm truncate">{{ playlist.title }}</span>
            <Loader2
              v-if="loading && addingPlaylist!.id === playlist.id"
              class="size-4 animate-spin"
            />
          </button>
        </div>
        <div v-else class="py-8 text-center text-muted-foreground text-sm">
          还没有创建的歌单
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>