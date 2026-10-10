<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { motion, useMotionValue } from 'motion-v'
import { X, ListMusic } from 'lucide-vue-next'
import { usePlayerStore } from '@/stores/playerStore'
import ArtistDivider from './musicComponents/artistDivider.vue'
import SongContextMenu from '../misc/SongContextMenu.vue'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import type { Song } from '@/types/player'

const props = defineProps<{
  visible: boolean
}>()

const playerStore = usePlayerStore()

// 直接使用 store 的响应式数据
const songs = computed(() => playerStore.playlist)
const currentSong = computed(() => playerStore.currentSong)

// 虚拟滚动配置
const ITEM_HEIGHT = 68
const BUFFER_COUNT = 5

const scrollRef = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(400)

const visibleRange = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER_COUNT)
  const visibleCount = Math.ceil(containerHeight.value / ITEM_HEIGHT) + 2 * BUFFER_COUNT
  const end = Math.min(songs.value.length, start + visibleCount)
  return { start, end }
})

const visibleItems = computed(() => {
  return songs.value.slice(visibleRange.value.start, visibleRange.value.end)
})

const totalHeight = computed(() => songs.value.length * ITEM_HEIGHT)
const offsetY = computed(() => visibleRange.value.start * ITEM_HEIGHT)

const onScroll = (e: Event) => {
  const target = e.target as HTMLDivElement
  scrollTop.value = target.scrollTop
  if (dragSongId.value !== null) {
    // 从真实位置重新同步浮点累加器：拖拽期间用户可能用滚轮滚，
    // 不同步的话下一帧自动滚动会把位置硬拽回累加器记的旧值
    scrollAcc = target.scrollTop
    // 滚轮滚动不会触发 pointermove，落点不跟着更新的话缺口会卡在旧位置
    dropAt.value = calcDropAt()
  }
}

// 滚动到当前播放歌曲
const scrollToCurrentSong = () => {
  // 拖拽期间不能被它把滚动位置拍走 —— 面板打开后 100ms 的那个定时器正好可能落在拖拽中间
  if (dragSongId.value !== null) return
  if (!scrollRef.value) return
  if (!currentSong.value) return

  const index = songs.value.findIndex((s) => s.id === currentSong.value?.id)
  if (index === -1) return

  const marginTop = 20
  const targetScrollTop = index * ITEM_HEIGHT - marginTop
  const maxScrollTop = totalHeight.value - containerHeight.value
  const clampedScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop))

  scrollRef.value.scrollTop = clampedScrollTop
  scrollTop.value = clampedScrollTop
}

onMounted(() => {
  if (scrollRef.value) {
    containerHeight.value = scrollRef.value.clientHeight
  }
  if (props.visible) {
    setTimeout(() => {
      nextTick(() => {
        scrollToCurrentSong()
      })
    }, 100)
  }
})

// 监听 visible 变化，自动滚动到当前歌曲
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        nextTick(() => {
          scrollToCurrentSong()
        })
      }, 100)
    }
  },
)

/* ================================ 拖拽排序 ================================
 *
 * 用 pointer events 手写，**不用 HTML5 DnD**。理由是这个列表虚拟滚动：被拖的那一行
 * 一旦滚出渲染窗口就会被 Vue 卸载，而源节点脱离 DOM 后浏览器不再派发 dragend
 * （Chrome / Firefox 的长期已知行为），拖拽状态就清不掉 —— 自动滚动的 rAF 会一直跑、
 * window 监听会一直挂着。pointer events 绑在 window 上完全不关心源节点还在不在。
 *
 * 范式照抄 src/components/misc/BouncingSlider.vue：pointerdown 绑元素、
 * pointermove / pointerup 绑 window、按下时缓存一次 rect。
 * ======================================================================== */

const DRAG_THRESHOLD_PX = 4 // 位移超过它才算拖拽，否则当成普通点击
const AUTOSCROLL_ZONE_PX = 44 // 距视口上下边缘多少像素内开始自动滚动
const AUTOSCROLL_MAX_STEP = 18 // 贴到边缘时每帧最多滚多少像素
const CLICK_SUPPRESS_MS = 400 // 拖拽结束后压掉 click / dblclick 的时间窗
const GHOST_OFFSET_X = -30 // 浮层相对光标的偏移，让它看起来像被「拎起来」而不是压在手心

/** 被拖的那首用 **id** 记，不按下标 —— 行是 :key="song.id"，滚出窗口就被卸载、
 *  滚回来是全新节点；下标在拖拽期间也可能已经指向别人 */
const dragSongId = ref<string | null>(null)
/** 插入位，0..n，**移除之前**的坐标 —— 与 playerStore.moveSong 的 `to` 同坐标系 */
const dropAt = ref<number | null>(null)
/**
 * 跟随光标的浮层位置（视口坐标，已含 GHOST_OFFSET_X 偏移）。
 *
 * ⚠️ **故意不是 ref** —— 为什么见 setGhostPos()。
 */
const ghostX = useMotionValue(0)
const ghostY = useMotionValue(0)
/** 松手那一帧临时关掉行过渡，见 settleAfterDrop() */
const isSettling = ref(false)

/** 被拖行的绝对下标。每次现算不缓存（拖拽期间列表内容会变，缓存的下标会指错人） */
const dragFromIndex = computed(() => {
  if (dragSongId.value === null) return null
  const i = songs.value.findIndex((s) => s.id === dragSongId.value)
  return i === -1 ? null : i
})

const draggedSong = computed(() =>
  dragFromIndex.value === null ? null : (songs.value[dragFromIndex.value] ?? null),
)

/** 重排期间还得用，不能是 ref —— 它们只服务于一次拖拽手势，不需要驱动渲染 */
let pendingSongId: string | null = null // pointerdown 记下的候选，越过阈值才转正
let activePointerId = -1
let startY = 0
let lastPointerY = 0
/** 视口矩形的 client 坐标。面板是 position: fixed，整个拖拽期间它不变，缓存一次即可 */
let vpRect: { top: number; bottom: number } | null = null
let maxScroll = 0
/** 自动滚动的**浮点**累加器 —— 为什么不能用 el.scrollTop 累加见 autoScrollTick() */
let scrollAcc = 0
let rafId = 0
let suppressClickUntil = 0

/**
 * 把「视口内的鼠标 Y + 当前滚动位置」换算成插入位。
 *
 * `.playlist-visible` 的 padding 只有横向，所以 spacer 坐标就是 `i * ITEM_HEIGHT`，
 * 直接除即可。返回 0..n，与 moveSong 的 `to` 同坐标系。
 */
const calcDropAt = (): number | null => {
  const el = scrollRef.value
  if (!el || !vpRect) return null

  const yInContent = lastPointerY - vpRect.top + el.scrollTop
  const row = Math.floor(yInContent / ITEM_HEIGHT)
  const inLowerHalf = yInContent - row * ITEM_HEIGHT >= ITEM_HEIGHT / 2
  // row 可能是 -1（指针在首行之上）或 >= n（在末行之下、甚至列表比视口短），一起夹掉
  return Math.max(0, Math.min(songs.value.length, row + (inLowerHalf ? 1 : 0)))
}

/**
 * 行为了让位而需要平移多少像素。
 *
 * 被拖的那一行自己隐藏（但仍占位），其它行按它落在 from 与 gap 的哪一侧整体挪一格，
 * 腾出的空位就是落点 —— 缺口跟着指针走，这就是拖拽中的过渡动画，
 * 也因此不需要再画一条插入线。
 */
const rowShift = (absIndex: number): number => {
  const from = dragFromIndex.value
  const to = dropAt.value
  if (from === null || to === null) return 0

  // gap = 被拖的项最终落在的下标（移除之后的坐标）
  const gap = to > from ? to - 1 : to
  if (gap === from) return 0 // 拖回原位 → 一行都不动
  if (absIndex > from && absIndex <= gap) return -ITEM_HEIGHT // 往上补位
  if (absIndex >= gap && absIndex < from) return ITEM_HEIGHT // 往下让位
  return 0
}

/** 不在拖拽时不输出 style，免得给每一行都挂一个 transform（会白建一层包含块） */
const rowStyle = (absIndex: number) => {
  const shift = rowShift(absIndex)
  return shift === 0 ? undefined : { transform: `translateY(${shift}px)` }
}

const stopAutoScroll = () => {
  if (rafId !== 0) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

/**
 * 自动滚动的一帧。
 *
 * 指针**静止**时不会触发 pointermove，所以这个循环必须由 rAF 自己驱动，
 * 并且每帧用最后已知的指针 Y 重算插入位（内容在动、指针没动，落点会变）。
 */
const autoScrollTick = () => {
  rafId = 0
  const el = scrollRef.value
  if (!el || !vpRect || dragSongId.value === null) return

  const distTop = lastPointerY - vpRect.top
  const distBottom = vpRect.bottom - lastPointerY

  // Math.min(1, ...) 不能省：指针拖到视口**上方**时 distTop 是负的，
  // 比值会大于 1，速度就超过上限了
  let delta = 0
  if (distTop < AUTOSCROLL_ZONE_PX) {
    delta = -AUTOSCROLL_MAX_STEP * Math.min(1, (AUTOSCROLL_ZONE_PX - distTop) / AUTOSCROLL_ZONE_PX)
  } else if (distBottom < AUTOSCROLL_ZONE_PX) {
    delta =
      AUTOSCROLL_MAX_STEP * Math.min(1, (AUTOSCROLL_ZONE_PX - distBottom) / AUTOSCROLL_ZONE_PX)
  }
  if (delta === 0) return // 指针已离开边缘区

  // 「到尽头就停」**不能**用「读回 el.scrollTop 看变没变」来判断：浏览器会把 scrollTop
  // 吸附到物理像素，+= 0.3 读回来还是整数，那样会在边缘区里就提前停表。
  // 改成用几何边界判断。留 1px 容差：scrollHeight / clientHeight 是取整过的，
  // 真正的末端可能就差半个像素，不留容差会在末端空转 rAF。
  if (delta < 0 && scrollAcc <= 0) return
  if (delta > 0 && scrollAcc >= maxScroll - 1) return

  scrollAcc = Math.max(0, Math.min(maxScroll, scrollAcc + delta))
  el.scrollTop = scrollAcc
  // scroll 事件是异步派发的，而 scrollTop.value 是 visibleRange / offsetY 的唯一输入 ——
  // 不补这一行，自动滚动时列表内容会比视口慢一帧，看起来「追不上」
  scrollTop.value = el.scrollTop

  dropAt.value = calcDropAt()
  rafId = requestAnimationFrame(autoScrollTick)
}

/** 指针在边缘区就开表，离开就停表 —— 只在「进入时启动」会让它回到中间后还在滚 */
const syncAutoScroll = (pointerY: number) => {
  if (!vpRect) return
  const inZone =
    pointerY - vpRect.top < AUTOSCROLL_ZONE_PX || vpRect.bottom - pointerY < AUTOSCROLL_ZONE_PX
  if (!inZone) {
    stopAutoScroll()
    return
  }
  if (rafId === 0) rafId = requestAnimationFrame(autoScrollTick)
}

/**
 * 把浮层挪到光标处。
 *
 * ⚠️ 这里**不能**用 Vue 的响应式值。曾经它就是 `ref({ x, y })`，代价是：
 * 浮层位置每次 pointermove 都变，而它是在**本组件的根渲染函数**里读的 ——
 * 同一个渲染函数里还有整个列表的 `v-for`。于是每动一下鼠标就重建整棵 vnode 树：
 * 约 20 行 × 每行一串 `SongContextMenu` → `ContextMenuRoot` → `MenuRoot` → `PopperRoot`
 * → `MenuAnchor`，再逐个 patch，外加每次几百个临时 vnode 对象（GC 压力）。
 * 实测结果：从列表顶部往下拖，拖得越远越卡；把这行注释掉卡顿立刻消失。
 *
 * motion value 是 `motion-dom` 的普通类（自带订阅者），**不是 Vue 的响应式对象** ——
 * 在模板里读它不建立依赖，所以 `set()` 只把结果写进 DOM，不惊动渲染。
 * 同目录 BouncingSlider.vue 的 `bounceX` 就是这个用法，它同样是在 window 的
 * pointermove 里逐次 set 的。
 *
 * 顺带一个好处：motion value 可以在元素**挂载之前**就设好，所以拖拽起步时
 * 浮层一出现就在光标位置，不会先闪一下 (0, 0)。
 */
const setGhostPos = (clientX: number, clientY: number) => {
  ghostX.set(clientX + GHOST_OFFSET_X)
  ghostY.set(clientY - ITEM_HEIGHT / 2)
}

const startDrag = (e: PointerEvent) => {
  const el = scrollRef.value
  if (!el || pendingSongId === null) return

  dragSongId.value = pendingSongId
  pendingSongId = null // 已转正；留着会让 handleRowPointerDown 的「残留」判据分不清
  const rect = el.getBoundingClientRect()
  vpRect = { top: rect.top, bottom: rect.bottom }
  maxScroll = el.scrollHeight - el.clientHeight
  scrollAcc = el.scrollTop
  lastPointerY = e.clientY
  setGhostPos(e.clientX, e.clientY)
  dropAt.value = calcDropAt()
}

const handleWindowPointerMove = (e: PointerEvent) => {
  if (e.pointerId !== activePointerId) return

  if (dragSongId.value === null) {
    if (Math.abs(e.clientY - startY) <= DRAG_THRESHOLD_PX) return
    startDrag(e)
  } else {
    lastPointerY = e.clientY
    setGhostPos(e.clientX, e.clientY)
    dropAt.value = calcDropAt()
  }

  syncAutoScroll(e.clientY)
}

const handleWindowPointerUp = (e: PointerEvent) => {
  if (e.pointerId !== activePointerId) return
  // 没越过阈值 → 只是点了一下/ 双击的第一次，别提交
  if (dragSongId.value === null) return finishDrag(false)

  // 快速甩动时最后一次 pointermove 可能被合并丢弃 → 用事件自身的坐标重算，
  // 否则落点会差一整行
  lastPointerY = e.clientY
  dropAt.value = calcDropAt()
  finishDrag(true)
}

const handleWindowPointerCancel = () => finishDrag(false)

/** 切到别的应用 / 指针移出浏览器窗口后松手 → 放弃，这不是用户意图的落点 */
const handleWindowBlur = (e: FocusEvent) => {
  // 只认「窗口本身」失焦。blur 不冒泡，但各浏览器对「元素失焦要不要通知 window」
  // 处理不一，加一道 target 校验免得拖拽被无辜取消
  if (e.target !== window) return
  finishDrag(false)
}

const cleanup = () => {
  stopAutoScroll()
  window.removeEventListener('pointermove', handleWindowPointerMove)
  window.removeEventListener('pointerup', handleWindowPointerUp)
  window.removeEventListener('pointercancel', handleWindowPointerCancel)
  window.removeEventListener('blur', handleWindowBlur)
  pendingSongId = null
  activePointerId = -1
  vpRect = null
  maxScroll = 0
  scrollAcc = 0
  dragSongId.value = null
  dropAt.value = null
}

/**
 * 松手那一刻临时关掉行的 transition。
 *
 * 为什么必须：moveSong 重排数组后，Vue 会把行的 DOM 节点**搬走**（keyed v-for 的
 * insertBefore），而同一次更新里每行的 transform 又从 ±ITEM_HEIGHT 归零。两者叠加
 * 再走 transition，行就会从「新槽位 ± 68」的位置滑过来 —— 明显错位。
 * 关掉这一帧的过渡，行就是直接就位；拖动过程中它们已经被摆到最终位置了，所以视觉零跳变。
 *
 * 两个 rAF 是因为第一次回调时样式重算还没发生，一帧不够稳。
 */
const settleAfterDrop = () => {
  isSettling.value = true
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isSettling.value = false
    })
  })
}

const finishDrag = (commit: boolean) => {
  const wasDragging = dragSongId.value !== null
  const from = dragFromIndex.value
  const to = dropAt.value
  cleanup()

  // ⚠️ 只有真的拖过才压 click。无条件压的话每次单击都会生效，
  //    双击切歌就废了（第二次点击会被压掉，拼不出 dblclick）
  if (wasDragging) suppressClickUntil = performance.now() + CLICK_SUPPRESS_MS
  if (!commit || !wasDragging || from === null || to === null) return

  settleAfterDrop()
  playerStore.moveSong(from, to)
}

const handleRowPointerDown = (e: PointerEvent, song: Song) => {
  // 只认鼠标主键。触摸 / 手写笔一律不接管：
  //  · 触摸端的竖向拖动会被浏览器判成「滚动列表」并抛 pointercancel，本来也拖不动；
  //    要让它成立就得给行加 touch-action: none，那会**彻底失去触摸滚动列表的能力**
  //    （给整行加是错的，正解是加拖拽手柄 —— 那是另一件事）。
  //  · reka 的 ContextMenuTrigger 对触摸 / 手写笔武装长按弹菜单，我们完全不碰触摸，
  //    就永远不会和它抢手势。
  if (e.button !== 0 || !e.isPrimary || e.pointerType !== 'mouse') return
  if (dragSongId.value !== null) return // 已经在拖了，忽略多出来的指针
  // 还留着 pendingSongId 说明上一次手势的 pointerup 丢在浏览器窗口外了（无 pointerup、
  // 浏览器也没失焦）。新的 pointerdown 就是那次手势已经结束的证明 —— 丢弃残留状态重来，
  // 否则之后所有拖拽都会被这条判据挡掉。
  if (pendingSongId !== null) cleanup()

  pendingSongId = song.id
  activePointerId = e.pointerId
  startY = e.clientY

  window.addEventListener('pointermove', handleWindowPointerMove)
  window.addEventListener('pointerup', handleWindowPointerUp)
  window.addEventListener('pointercancel', handleWindowPointerCancel)
  // 在 pointerdown 就挂上（而不是等拖拽真的起步）：
  // 指针跑到浏览器窗口外松手时 window 收不到 pointerup，只能靠 blur 兜底，
  // 否则拖拽状态会一直卡着、后续指针事件全被吞
  window.addEventListener('blur', handleWindowBlur)
}

/** click / dblclick 在 pointerup 之后才触发，拖完可能误触发切歌 —— 用时间窗压掉 */
const handleRowDblClick = (song: Song) => {
  if (performance.now() < suppressClickUntil) return
  emitter.emit(EVENTS.SWITCH_SONG, song)
}

// 面板会被 TheFooter 用 v-if 卸载（还带 Transition，会多活一会儿）。
// 不在这儿收尾的话：rAF 里的 getBoundingClientRect() 直接抛 TypeError，window 监听永久残留。
onBeforeUnmount(cleanup)
</script>

<template>
  <div class="playlist-panel glass-component" @click.stop>
    <!-- 头部 -->
    <div class="playlist-header">
      <div class="flex items-center gap-3">
        <ListMusic class="w-5 h-5 text-red-500" />
        <h2 class="playlist-title">正在播放</h2>
      </div>
      <button class="playlist-close-btn" @click="$emit('close')">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- 歌曲数量 -->
    <div class="playlist-count-bar">
      <span class="text-sm text-gray-500 dark:text-gray-400">共 {{ songs.length }} 首歌曲</span>
    </div>

    <!-- 虚拟滚动容器 -->
    <div ref="scrollRef" class="playlist-viewport custom-scrollbar" @scroll="onScroll">
      <div class="playlist-spacer" :style="{ height: `${totalHeight}px` }">
        <div
          class="playlist-visible"
          :class="{ 'is-settling': isSettling }"
          :style="{ transform: `translateY(${offsetY}px)` }"
        >
          <!--
            v-for 挂在菜单组件上而不是行 div 上：SongContextMenu 用触发器的 as-child
            把右键监听合到行上，渲染出来仍是每行一个 68px 的盒子，
            虚拟滚动的 ITEM_HEIGHT 不受影响。

            i 是**切片**下标，绝对下标必须加回 visibleRange.start —— 拖拽的位移
            是按绝对下标算的，用切片下标会让整个让位方向错乱。
          -->
          <SongContextMenu v-for="(song, i) in visibleItems" :key="song.id" :song="song">
            <div
              class="playlist-item"
              :class="{
                'playlist-item-active': currentSong?.id === song.id,
                'playlist-item-dragging': dragSongId === song.id,
              }"
              :style="rowStyle(visibleRange.start + i)"
              @pointerdown="handleRowPointerDown($event, song)"
              @dblclick="handleRowDblClick(song)"
            >
              <!-- draggable="false" 不能省：不设的话按下封面会启动**浏览器原生图片拖拽**，
                   它接管指针并抛 pointercancel，拖拽当场失效，屏幕上还会多一个原生拖影 -->
              <img :src="song.cover" :alt="song.title" class="playlist-cover" draggable="false" />
              <div class="playlist-info">
                <span class="playlist-song-title">{{ song.title }}</span>
                <!-- <span class="playlist-artist">{{ song.artist[0]?.name }}</span> -->
                <ArtistDivider :artists="song.artist" />
              </div>
              <span class="playlist-duration">{{ song.duration }}</span>
            </div>
          </SongContextMenu>
        </div>
      </div>
    </div>

    <!--
      跟随光标的拖拽浮层。被拖的那一行会随内容滚出视野，没有它就不知道自己在拖什么。

      ⚠️ 必须 Teleport 到 body：.playlist-panel 是 .glass-component，
      glass.css 里的 backdrop-filter 会让它成为 **fixed 后代的包含块**，再加上
      .playlist-panel { overflow: hidden }，渲染在面板内部的 position: fixed
      会被「相对面板定位 + 裁切」，浮层根本出不了面板。
    -->
    <Teleport to="body">
      <!--
        motion.div + motion value：位置更新直接落到 DOM，不触发本组件重新渲染。
        换成普通 div + `:style="{ transform: ... }"` 会让每次 pointermove 重建整个列表
        （含每一行的 ContextMenu 子树）—— 那正是之前拖拽卡顿的原因，细节见 setGhostPos()。
      -->
      <motion.div
        v-if="draggedSong"
        class="playlist-drag-ghost glass-component"
        :style="{ x: ghostX, y: ghostY }"
      >
        <img
          :src="draggedSong.cover"
          :alt="draggedSong.title"
          class="playlist-cover"
          draggable="false"
        />
        <div class="playlist-info">
          <span class="playlist-song-title">{{ draggedSong.title }}</span>
          <ArtistDivider :artists="draggedSong.artist" />
        </div>
      </motion.div>
    </Teleport>
  </div>
</template>

<style scoped>
:deep(.artist-divider .artist-name),
:deep(.artist-divider .artist-separator) {
  font-weight: 400;
}
.playlist-panel {
  z-index: 10000;
  position: fixed;
  top: 15vh;
  right: 0;
  width: 380px;
  max-height: 70vh;
  height: 70vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  margin: 10px;
  overflow: hidden;
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.dark .playlist-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.playlist-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.dark .playlist-title {
  color: #ffffff;
}

.playlist-close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.playlist-close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}

.dark .playlist-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.playlist-count-bar {
  padding: 12px 20px;
  flex-shrink: 0;
}

.dark .playlist-count-bar {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.playlist-viewport {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.playlist-spacer {
  position: relative;
  width: 100%;
}

.playlist-visible {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 12px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    /* 拖拽时其它行让位的滑动。注意：松手那一帧会被 .is-settling 临时关掉，
       原因见 settleAfterDrop() 的注释 */
    transform 0.15s ease;
  height: 68px;
  box-sizing: border-box;
  /* 拖拽由 pointerdown 接管，别让拖动标题文字变成选词 */
  user-select: none;
  -webkit-user-select: none;
}

/*
 * 松手那一帧禁用行过渡。
 * moveSong 重排数组后 Vue 会搬走行 DOM，同时各行的 transform 归零 —— 带着
 * transition 会让行从「新槽位 ± 68」滑过来，明显错位。
 */
.playlist-visible.is-settling .playlist-item {
  transition: none;
}

/*
 * 被拖的那一行：**必须仍然占位**（否则布局塌陷、后面的行会跳），但不画出来，
 * 把位置让给滑过来的邻居。拖拽中的样子由 .playlist-drag-ghost 代表。
 */
.playlist-item-dragging {
  opacity: 0;
}

.playlist-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .playlist-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.playlist-item-active {
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
}

.dark .playlist-item-active {
  background: color-mix(in srgb, var(--primary-color) 15%, transparent);
}

.playlist-item-active .playlist-song-title {
  color: var(--primary-color);
}

.playlist-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  /* 图片默认可被原生拖拽：不关掉的话，按下封面会启动浏览器自己的拖拽，
     它接管指针并抛 pointercancel —— 我们手写的拖拽当场失效 */
  -webkit-user-drag: none;
}

/*
 * 拖拽浮层（被 Teleport 到 <body>）。
 * 尺寸对齐一行：面板宽 380 − .playlist-visible 左右各 12 的 padding = 356，
 * 行高就是 ITEM_HEIGHT，内边距与行一致，这样「拎起来的那一块」看起来就是原来那一行。
 */
.playlist-drag-ghost {
  position: fixed;
  top: 0;
  left: 0;
  /* 面板 z-index: 10000、右键菜单 10001 —— 浮层要在两者之上 */
  z-index: 10002;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 356px;
  height: 68px;
  padding: 10px 12px;
  box-sizing: border-box;
  border-radius: 8px;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.playlist-song-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .playlist-song-title {
  color: #ffffff;
}

.playlist-artist {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.dark .playlist-artist {
  color: #aaa;
}

.playlist-duration {
  font-size: 12px;
  /* color: #999; */
  flex-shrink: 0;
}

.dark .playlist-duration {
  /* color: #888; */
}
</style>
