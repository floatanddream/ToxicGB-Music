<script setup lang="ts">
/**
 * 全站固定背景层。
 *
 * 从 LayoutContainer.vue 抽出来的 —— 原先它混在根布局的模板与样式里，
 * 后续要在这里做更多开发（多套渲染器 / 手动切换 / 跟随主题等），
 * 单独成文件才能独立演进而不动根布局。
 *
 * 定位契约（改动前先看这条）：这层是 `position: fixed` + `z-index: 1`，
 * 且是 `.layout-container` 的**第一个子元素**。`.main` 的 z-index 同为 1，
 * 靠 DOM 顺序排在它之后才盖在它上面 —— 换位置会让正文被背景遮住。
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { BackgroundRender } from '@applemusic-like-lyrics/vue'
import { MeshGradientRenderer } from '@applemusic-like-lyrics/core'
import { usePlayerStore } from '@/stores/playerStore'
import { useUserStore } from '@/stores/user'

const playerStore = usePlayerStore()
const userStore = useUserStore()
const { currentSong, playing } = storeToRefs(playerStore)

// 正在播放时用当前曲封面，否则退到用户头像
const imageUrl = computed(() => {
  return playing.value ? currentSong.value?.cover : userStore.user?.avatarUrl
})
</script>

<template>
  <div class="full-page-background">
    <!-- <video
        src="https://upos-sz-mirrorali.bilivideo.com/upgcxcode/10/06/41421180610/41421180610-1-16.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&og=ali&trid=e241aa7a5ad44310afed77b16fa200bu&mid=11960987&nbs=1&gen=playurlv3&os=alibv&platform=pc&oi=1903541808&deadline=1790137558&upsig=599f5ce92cb324acab8d48a33d62c9a0&uparams=e,uipk,og,trid,mid,nbs,gen,os,platform,oi,deadline&bvc=vod&nettype=0&bw=460307&lrs=-1&dl=0&f=u_0_0&qn_dyeid=e39996cd5f9ec3d000079fce6ab338b6&agrr=0&buvid=1A8533ED-58EF-73EA-F74F-DEDEDDF5281840892infoc&build=0&orderid=0,3"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          z-index: -1;
        "
      ></video> -->
    <BackgroundRender
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
</style>
