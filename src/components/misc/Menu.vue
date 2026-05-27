<script setup lang="ts">
import { SkipBack, Pause, Play, SkipForward, Fullscreen, ListPlus, DiscAlbum, UserCircle2Icon } from 'lucide-vue-next'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { usePlayerStore } from '@/stores/playerStore'
import { storeToRefs } from 'pinia'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import { MESSAGE_TYPE } from '@/constants/messages'
import { type Artist } from '@/types/musicTypes'

const playerStore = usePlayerStore()
const { playing } = storeToRefs(playerStore)

const handlePlayPause = () => {
  playerStore.toggle()
}

const handlePrev = () => {
  playerStore.prev()
}

const handleNext = () => {
  playerStore.next()
}

const handleClickPlayer = () => {
  playerStore.setFullPlayer(!playerStore.isFullScreen)
}

const handleClickAlbum = () => {
  emitter.emit(EVENTS.ALBUM_CLICK, playerStore.currentSong?.album)
}

const handleCollectCurrentSong = () => {
  playerStore.currentSong ? emitter.emit(EVENTS.USER_COLLECT_SONG,playerStore.currentSong) : 
  emitter.emit(MESSAGE_TYPE.TOAST_ERROR,'当前无正在播放歌曲')
}

const handleClickArtist = (artist : Artist) => {
  emitter.emit(EVENTS.ARTIST_CLICK, artist)
}

</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem @click="handlePrev">
        <SkipBack class="size-4" />
        <span>上一首</span>
      </ContextMenuItem>
      <ContextMenuItem @click="handlePlayPause">
        <Play v-if="!playing" class="size-4" />
        <Pause v-else class="size-4" />
        <span>{{ playing ? '暂停' : '播放' }}</span>
      </ContextMenuItem>
      <ContextMenuItem @click="handleNext">
        <SkipForward class="size-4" />
        <span>下一首</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem @click="handleClickPlayer">
        <Fullscreen class="size-4" />
        <span>打开播放器</span>
      </ContextMenuItem>

       <ContextMenuSeparator />

       <ContextMenuItem v-if="playerStore.currentSong" @click="handleClickAlbum">
        <DiscAlbum class="size-4" />
        <span>查看歌曲专辑《{{ playerStore.currentSong?.album.title }}》</span>
      </ContextMenuItem>

      <ContextMenuItem v-if="playerStore.currentSong" 
      v-for="artist in playerStore.currentSong?.artist" 
      @click="handleClickArtist(artist)">
        <UserCircle2Icon class="size-4" />
        <span>查看歌曲歌手:{{ artist.name }}</span>
      </ContextMenuItem>

       <ContextMenuItem v-if="playerStore.currentSong" @click="handleCollectCurrentSong">
        <ListPlus class="size-4" />
        <span>将当前播放歌曲收藏</span>
      </ContextMenuItem>

      

    </ContextMenuContent>

  </ContextMenu>
</template>