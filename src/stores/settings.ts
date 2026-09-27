import { defineStore } from 'pinia'
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

const SETTINGS_KEY = 'app_settings'

/**
 * 应用设置。
 *
 * 用 `background` **命名空间**而不是把键平铺在 store 根上 —— 这个 store 以后要
 * 收纳全部设置，平铺迟早撞名。键名沿用既定的 `background.enableMvBackground`。
 *
 * 与 playerStore 里的 `player_settings` 是**两套**：那边是播放器运行参数
 * （音量 / EQ / 变速 / 变调），这边是应用级偏好。暂不合并 —— 合并要动那四项的
 * 持久化，属独立需求。
 *
 * 目前没有设置界面，改值只能走 store 或 DevTools，所以持久化是必需的：
 * 不落盘的话一刷新就回到默认值，这个开关根本没法测。
 */
export const useSettingsStore = defineStore('settings', () => {
  const background = ref({
    /**
     * 歌曲有 MV 时用 MV 当背景，没有则回退流体背景。默认关。
     * 关着时不会发任何 MV 相关请求 —— 见 `playerStore.resolveMv()`。
     */
    enableMvBackground: false,
  })

  /** 歌词显示。与 background 一样暂时没有设置界面，改值走 store / DevTools。 */
  const lyrics = ref({
    /** 翻译（常规副行）。默认开 */
    showTranslation: true,
    /**
     * 罗马音 / 音译（**更小更淡的第三行**）。默认关 ——
     * 日文 / 韩文歌「原文 + 翻译 + 罗马音」叠三行实测太挤。
     *
     * 关着时是「干脆不填那些字段」，而不是「填了但不显示」：amll 没有这类显示开关
     * （它的全部 props 里与显隐有关的只有 `hidePassedLines`），详见 `utils/misc.ts`。
     */
    showRomanization: false,
  })

  const persist = () => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ background: background.value, lyrics: lyrics.value }),
      )
    } catch {
      // localStorage 不可用（隐私模式 / 配额）时静默忽略，不影响其余功能
    }
  }

  /** 逐字段校验后再落值：坏数据 / 旧版本结构不许把设置搞挂 */
  const load = () => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (!raw) return

      const s = JSON.parse(raw)

      if (typeof s?.background?.enableMvBackground === 'boolean') {
        background.value.enableMvBackground = s.background.enableMvBackground
      }
      if (typeof s?.lyrics?.showTranslation === 'boolean') {
        lyrics.value.showTranslation = s.lyrics.showTranslation
      }
      if (typeof s?.lyrics?.showRomanization === 'boolean') {
        lyrics.value.showRomanization = s.lyrics.showRomanization
      }
    } catch {
      // 坏 JSON → 保留默认值
    }
  }

  load()

  // 必须 deep —— 这两个都是对象，改其中的字段不会换掉 .value 的引用，
  // 浅监听收不到通知。
  watchDebounced([background, lyrics], persist, { debounce: 300, deep: true })

  return { background, lyrics }
})
