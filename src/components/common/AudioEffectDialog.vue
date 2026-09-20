<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/playerStore'
import {
  EQ_BANDS,
  EQ_PRESETS,
  EQ_GAIN_MIN,
  EQ_GAIN_MAX,
  PLAYBACK_RATE_MIN,
  PLAYBACK_RATE_MAX,
  PITCH_MIN,
  PITCH_MAX,
} from '@/constants/audioEffects'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const open = defineModel<boolean>('open', { default: false })

const playerStore = usePlayerStore()
const { eqPresetId, eqGains, playbackRate, preservesPitch, pitchSemitones } =
  storeToRefs(playerStore)

// eqPresetId 为 '' 表示「用户手动调过频段、已脱离预设」。Select 遇到空串会
// 渲染成空白，转成 undefined 才能让它显示 placeholder。
const presetValue = computed(() => eqPresetId.value || undefined)

const handlePresetChange = (value: unknown) => {
  if (typeof value === 'string') playerStore.setEqPreset(value)
}
</script>

<template>
  <Dialog v-model:open="open">
    <!--
      absolute! 不是可选项：.glass-container（styles/glass.css:33）声明了
      position: relative 且没有 !important，与 DialogContent 默认的 fixed
      同特异度、按源码顺序胜出，会吃掉居中定位。加 absolute! 强行压过它。
    -->
    <!--
      为什么覆盖的是 --bg-primary / --border-primary，而不是用 class 覆盖颜色：
      styles/utilities.css 定义了
        .bg-primary    { background-color: var(--bg-primary)    !important }
        .border-primary{ border-color:     var(--border-primary)!important }
      它们与 shadcn 的同名工具类撞车，且带 !important —— 任何 class 覆盖都会被顶掉。
      只有改这两个变量、让那两条 !important 规则自己解析成强调色才有效。
      ⚠️ 本面板内它们被「借用」作强调色，与 --bg-primary 原本的「页面底色」语义不同。
    -->
    <DialogContent
      class="absolute! glass-container z-500 max-w-md rounded-2xl overflow-hidden"
      style="--primary: var(--primary-color); --bg-primary: var(--primary-color); --border-primary: var(--primary-color)"
    >
      <DialogHeader>
        <DialogTitle>音效设置</DialogTitle>
        <DialogDescription class="sr-only">调整均衡器与播放速度</DialogDescription>
      </DialogHeader>

      <!-- 均衡器 -->
      <div class="mt-4">
        <p class="text-sm text-muted-foreground mb-3">均衡器预设</p>
        <Select :model-value="presetValue" @update:model-value="handlePresetChange">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="自定义" />
          </SelectTrigger>
          <!--
            SelectContent 默认是 z-50，而本对话框是 z-500 —— 不抬高层级的话，
            下拉菜单会被对话框自己盖住。
          -->
          <SelectContent class="z-600">
            <SelectItem v-for="preset in EQ_PRESETS" :key="preset.id" :value="preset.id">
              {{ preset.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- 频段：每列自带 0 dB 参考线，避免跨列对齐的魔法偏移 -->
        <div class="mt-5 flex justify-around gap-3">
          <div
            v-for="(band, i) in EQ_BANDS"
            :key="band.key"
            class="flex flex-col items-center gap-2"
          >
            <div class="relative h-44">
              <div class="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border" />
              <Slider
                orientation="vertical"
                class="h-full"
                :model-value="[eqGains[i] ?? 0]"
                :min="EQ_GAIN_MIN"
                :max="EQ_GAIN_MAX"
                :step="1"
                @update:model-value="
                  (v: number[] | undefined) => playerStore.setBandGain(i, v?.[0] ?? 0)
                "
              />
            </div>
            <span class="text-xs text-muted-foreground">{{ band.label }}</span>
            <span class="text-xs tabular-nums text-muted-foreground">
              {{ (eqGains[i] ?? 0) > 0 ? '+' : '' }}{{ (eqGains[i] ?? 0).toFixed(1) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 变速 -->
      <div class="mt-6">
        <p class="text-sm text-muted-foreground mb-3">播放速度</p>
        <div class="flex items-center gap-3">
          <Slider
            class="flex-1"
            :model-value="[playbackRate]"
            :min="PLAYBACK_RATE_MIN"
            :max="PLAYBACK_RATE_MAX"
            :step="0.05"
            @update:model-value="
              (v: number[] | undefined) => playerStore.setPlaybackRate(v?.[0] ?? 1)
            "
          />
          <span class="w-14 text-right text-sm tabular-nums"> {{ playbackRate.toFixed(2) }}x </span>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <span class="text-sm">保持音高</span>
          <Switch
            :model-value="preservesPitch"
            @update:model-value="playerStore.setPreservesPitch"
          />
        </div>
      </div>

      <!-- 音调 -->
      <div class="mt-6">
        <p class="text-sm text-muted-foreground mb-3">音调（不改变速度）</p>
        <div class="flex items-center gap-3">
          <Slider
            class="flex-1"
            :model-value="[pitchSemitones]"
            :min="PITCH_MIN"
            :max="PITCH_MAX"
            :step="1"
            @update:model-value="
              (v: number[] | undefined) => playerStore.setPitchSemitones(v?.[0] ?? 0)
            "
          />
          <span class="w-14 text-right text-sm tabular-nums">
            {{ pitchSemitones > 0 ? '+' : '' }}{{ pitchSemitones }}
          </span>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
