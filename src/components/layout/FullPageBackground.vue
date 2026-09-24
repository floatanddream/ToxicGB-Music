<script setup lang="ts">
/**
 * 全站固定背景层。两种渲染二选一：
 *   1. MV —— 歌曲有 MV 且 `background.enableMvBackground` 打开时
 *   2. 流体 mesh 渐变 —— 默认，也是 MV 不可用时的回退
 *
 * 定位契约（改动前先看这条）：这层是 `position: fixed` + `z-index: 1`，
 * 且必须是 `.layout-container` 的**第一个子元素**。`.main` 的 z-index 同为 1，
 * 靠 DOM 顺序排在它之后才盖在它上面 —— 换位置会让正文被背景遮住。
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { BackgroundRender } from '@applemusic-like-lyrics/vue'
import { MeshGradientRenderer } from '@applemusic-like-lyrics/core'
import { usePlayerStore } from '@/stores/playerStore'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const playerStore = usePlayerStore()
const settings = useSettingsStore()
const userStore = useUserStore()

const { currentSong, playing, currentTime, playbackRate } = storeToRefs(playerStore)

// 正在播放时用当前曲封面，否则退到用户头像
const imageUrl = computed(() => {
  return playing.value ? currentSong.value?.cover : userStore.user?.avatarUrl
})

/* ---------------- MV 背景 ---------------- */

/** 纠偏阈值（秒）。只在漂移超过它时才 seek —— 太小会导致每 250ms 都 seek，画面持续抖。 */
const DRIFT_SECONDS = 0.3
/** 等 canplay 的上限（毫秒）。超时即判定 MV 不可用，回退流体背景。 */
const CANPLAY_TIMEOUT_MS = 3000

const videoRef = ref<HTMLVideoElement | null>(null)

/** 想用 MV：开关打开 + 当前曲拿到了地址 */
const wantMv = computed(
  () => settings.background.enableMvBackground && Boolean(currentSong.value?.mvUrl),
)
/** 真的换成 MV：还要等它 canplay。见下面「为什么分两个状态」。 */
const mvReady = ref(false)

let canplayTimer: ReturnType<typeof setTimeout> | undefined

const clearCanplayTimer = () => {
  if (canplayTimer !== undefined) {
    clearTimeout(canplayTimer)
    canplayTimer = undefined
  }
}

const handleCanPlay = () => {
  clearCanplayTimer()
  mvReady.value = true
  // 参数不会随 src 变化自动保留，挂载后补一次
  if (videoRef.value) videoRef.value.playbackRate = playbackRate.value
  syncVideo() // 立刻对齐一次，别等下一次 timeupdate
}

/** 加载出错 / 超时：回退流体背景 */
const fallBackToMesh = () => {
  clearCanplayTimer()
  mvReady.value = false
  console.warn('[FullPageBackground] MV 播不出来，回退流体背景:', currentSong.value?.mvUrl)
}

onBeforeUnmount(clearCanplayTimer)

/**
 * 换歌 / 换地址 / 开关变化 → 重新进入「准备中」。
 *
 * 为什么监听 mvUrl 本身而不是只监听 `wantMv` 那个布尔：**超时失败后 wantMv 已经是
 * true**，若下一首歌同样有 MV，布尔不变、watch 不触发，就再也没机会重试了 ——
 * 会永久停在流体背景上。带上 mvUrl 才能每次都重新计时。
 */
watch(
  [wantMv, () => currentSong.value?.mvUrl],
  ([want]) => {
    clearCanplayTimer()
    // v-show 会把它藏起来，但换 src 前先停掉 —— 脱离视口的 <video> 在部分浏览器里仍会继续播
    videoRef.value?.pause()
    mvReady.value = false
    if (want) canplayTimer = setTimeout(fallBackToMesh, CANPLAY_TIMEOUT_MS)
  },
  { immediate: true },
)

/**
 * 同步：**以歌曲为基准，MV 单向跟随**。
 *
 * 绝不能让 MV 的时钟参与进来 —— 反过来会把播放进度污染掉。
 */
const syncVideo = () => {
  const v = videoRef.value
  if (!v) return

  const dur = v.duration
  if (!Number.isFinite(dur)) return // 元数据还没到

  // ① MV 短于歌曲：播到尾部就停住，不循环。
  //    这条**必须**排在补播之前 —— ended 之后调用 play() 会从头重播，
  //    漏了它 MV 短于歌曲时会一直循环。
  if (currentTime.value >= dur) {
    if (!v.paused) v.pause()
    return
  }

  // ② 歌曲暂停 → MV 暂停
  if (!playing.value) {
    if (!v.paused) v.pause()
    return
  }

  // ③ 漂移超标才纠偏。同速同起点时漂移接近 0，正常播放一次都不会触发。
  if (Math.abs(v.currentTime - currentTime.value) > DRIFT_SECONDS) {
    v.currentTime = currentTime.value
  }

  // ④ 补播。自动播放策略可能拒绝（静默降级，不影响音频）
  if (v.paused) void v.play().catch(() => {})
}

// 「歌曲回到 0:00」（单曲循环 / 拖回开头 / 上一首回绕）不需要额外分支：
// currentTime 重新小于 dur，③ 会把 video 拽回开头、④ 再补播。
watch([currentTime, playing], syncVideo)

// 变速：MV 同速。否则 2x 时 MV 会被不停往前拽，画面持续跳帧。
watch(playbackRate, (rate) => {
  const v = videoRef.value
  if (v) v.playbackRate = rate
})
</script>

<template>
  <div class="full-page-background">
    <!--
      MV。用 v-if 而不是合进 v-show：没地址时根本不该建这个元素，
      否则会拿着 undefined 的 src 去加载。
      藏在 v-show 里是为了让它**保持挂载并继续加载** —— 只有 canplay 到了
      才真的换到画面上（这就是「等能播再切」，避免 mesh 卸了、首帧还没到）。
    -->
    <video
      v-if="wantMv"
      v-show="mvReady"
      ref="videoRef"
      class="mv-video"
      :src="currentSong?.mvUrl"
      muted
      playsinline
      preload="auto"
      @loadedmetadata="syncVideo"
      @canplay="handleCanPlay"
      @error="fallBackToMesh"
    ></video>

    <BackgroundRender
      v-if="!mvReady"
      :renderer="MeshGradientRenderer"
      :fps="90"
      :render-scale="1"
      :album="imageUrl"
    />
  </div>
</template>

<style scoped>
.full-page-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.dark .full-page-background {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--primary-color) 10%, transparent) 0%,
    color-mix(in srgb, var(--primary-dark) 10%, transparent) 100%
  );
}

/*
 * MV 铺满背景层。
 * 不设 crossOrigin —— 歌曲的 <audio> 设它是为了接 Web Audio（EQ / 变调），
 * 而这里不接音频图，设了反而要求 CDN 返回 CORS 头，白白多一个失败面。
 */
.mv-video {
  transform: scale(1.08); /* 轻微放大，避免边缘黑边 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
