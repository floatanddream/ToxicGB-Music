<script setup lang="ts">
import { SkipBack, Pause, Play, SkipForward, Fullscreen, ListPlus } from 'lucide-vue-next'
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

const handleCollectCurrentSong = () => {
  
  playerStore.currentSong ? emitter.emit(EVENTS.USER_COLLECT_SONG,playerStore.currentSong) : 
  emitter.emit(MESSAGE_TYPE.TOAST_ERROR,'当前无正在播放歌曲')
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

       <ContextMenuItem @click="handleCollectCurrentSong">
        <ListPlus class="size-4" />
        <span>将当前播放歌曲收藏</span>
      </ContextMenuItem>

    </ContextMenuContent>

  </ContextMenu>
</template>