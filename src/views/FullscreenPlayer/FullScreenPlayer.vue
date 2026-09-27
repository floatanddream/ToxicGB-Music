<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { storeToRefs } from 'pinia'
import type { Song } from '@/types/player'
import { X } from 'lucide-vue-next'
import SongControl from './components/SongControl.vue'
import AlbumCover from './components/AlbumCover.vue'
import UpNextQueue from './components/UpNextQueue.vue'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import { type LyricLine } from '@applemusic-like-lyrics/lyric'
import { getSongLyric, getTTMLLyric } from '@/api/lyric'
import { LyricPlayer } from '@applemusic-like-lyrics/vue'
import '@applemusic-like-lyrics/core/style.css'
import { extractLeagcyLyrics, extractTTMLLyrics } from '@/utils/misc'

const playerStore = usePlayerStore()
const lyricData = shallowRef<LyricLine[]>([])
const { currentSong, playing, currentTime, duration, playlist, currentIndex, mode, volume } =
  storeToRefs(playerStore)

/**
 * 给 `LyricPlayer` 的进度，整数毫秒。
 *
 * store 里存的是浮点「秒」（`audio.currentTime`），而这个 prop 的文档明确要求
 * **整数毫秒**（amll 官方 demo 也是 `Math.round(currentTime * 1000)`）。
 * 实测核心库不强制取整，但按它声明的契约来更稳妥。
 */
const lyricCurrentTime = computed(() => Math.round(currentTime.value * 1000))

// Esc监听器
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}

const handleSeek = (time: number) => {
  playerStore.seek(time / 1000)
}

const handleClose = () => {
  emitter.emit(EVENTS.TOGGLE_FULLSCREEN, false)
}

const upNextSongs = computed(() => {
  const songs = playlist.value
  const upNext: Song[] = []
  let idx = currentIndex.value + 1
  while (upNext.length < 3 && idx < songs.length) {
    const song = songs[idx]
    if (song) {
      upNext.push(song)
    }
    idx++
  }
  return upNext
})

const handleSwitchSong = (song: Song) => {
  playerStore.switchSong(song)
}

/**
 * 自增序号，用于丢弃迟到的响应。
 * 快速切歌时「先发后到」的旧请求会覆盖新歌的歌词 —— 靠它拦掉。
 */
let lyricRequestSeq = 0

/**
 * 取歌词。两种来源**各到各显示**，不是等齐了再显示：
 *
 * 1. 普通歌词（LRC/YRC，走自家后端）—— 到了立刻显示
 * 2. TTML（外部源，通常慢得多，还可能没有）—— 到了且非空就**升级替换**
 *
 * 原来的实现是 `await Promise.all([...])`：两个请求确实是并行发的，但**两个都回来
 * 之前什么都不赋值**。于是快的那份被慢的那份拖住 —— TTML 慢或没有时，打开全屏播放器
 * 会有一段时间一条歌词都不显示。现在把「等待」拆开，就不存在这个空窗了。
 */
const fetchLyric = async (songId: string) => {
  const seq = ++lyricRequestSeq
  /** 已经换歌 / 已有更新的请求 → 本次结果作废 */
  const isStale = () => seq !== lyricRequestSeq

  /**
   * 是否已经用上 TTML。**TTML 一旦生效就不许普通歌词再覆盖它** ——
   * 两个请求是并行的，普通歌词完全可能后到。
   */
  let ttmlApplied = false

  const legacy = (async () => {
    try {
      const res = await getSongLyric(songId)
      if (isStale() || ttmlApplied) return
      lyricData.value = extractLeagcyLyrics(res)
    } catch (err) {
      console.warn('普通歌词获取失败:', err)
    }
  })()

  const ttml = (async () => {
    try {
      const res = await getTTMLLyric(songId)
      if (isStale()) return
      // 拿不到（404 / 这首歌没有 TTML）→ 什么都不做，保留已经显示出来的普通歌词
      const lines = res ? extractTTMLLyrics(res) : []
      if (lines.length === 0) return
      ttmlApplied = true
      lyricData.value = lines
    } catch (err) {
      console.warn('TTML 歌词获取失败，保留普通歌词:', err)
    }
  })()

  await Promise.all([legacy, ttml])
}
watch(
  () => playerStore.currentSong?.id,
  (songId) => {
    if (songId !== undefined) fetchLyric(songId)
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // 播放器可能在「已经在放歌」时才被打开 —— 这时 watch 不会触发，得自己拉一次
  const songId = playerStore.currentSong?.id
  if (songId !== undefined) fetchLyric(songId)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="fullscreen-player glass-component">
    <!-- Left Panel: Album Cover -->
    <div class="left-panel">
      <AlbumCover
        :cover="currentSong?.cover || 'https://picsum.photos/400/400?random=1'"
        :title="currentSong?.title || 'Album Cover'"
        :playing="playing"
      />
      <SongControl
        :duration="duration"
        :current-time="currentTime"
        :is-playing="playing"
        @seek="handleSeek"
      />
    </div>

    <!-- Right Panel: Song Info & Queue -->
    <div class="right-panel">
      <UpNextQueue :songs="upNextSongs" @switch-song="handleSwitchSong" v-if="false" />
      <LyricPlayer
        @line-click="
          (e) => {
            handleSeek(e.line?.lyricLine?.startTime)
          }
        "
        class="lyric-player"
        :lyric-lines="lyricData"
        :current-time="lyricCurrentTime"
        :playing="playerStore.playing && playerStore.isFullScreen"
        :align-position="0.3"
      />
    </div>

    <!-- Close Button -->
    <button class="close-btn fixed" @click="handleClose">
      <X :size="24" />
    </button>
  </div>
</template>

<style scoped>
.fullscreen-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: grid;
  grid-template-columns: 4fr 6fr;
  grid-template-rows: 1fr auto;
  color: #fff;
}

/* Left Panel */
.left-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
}

/* Right Panel */
.right-panel {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* padding: 60px 40px; */
  /* overflow-y: hidden; */
}

.lyric-player {
  /* transform: translateY(-20vh); */
  height: 100vh;
  /* overflow-y: hidden; */
}
</style>
