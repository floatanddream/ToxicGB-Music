# 音效调整（EQ 预设 + 变速）— 设计文档

- 日期：2026-09-19
- 状态：已批准
- 分支：developing

## 背景与目标

当前播放器的音频链路是裸 `<audio>` 元素（`MusicController.ts:18` `new Audio()`），可调的只有 `audio.volume` —— 一个整体增益旋钮。没有均衡器，没有变速。

目标：

1. **EQ 预设** —— 5 段均衡，几组固定曲线（低音增强 / 人声 / 摇滚…），不做用户自定义曲线。
2. **变速 + 保调开关** —— 0.5x–2.0x 倍速，可选是否保持音高。
3. **顺带修复音量滑块 bug** —— `TheFooter.vue` 的音量 UI 与实际音量不一致且不持久化。

不做（明确排除）：自定义多段 EQ、空间音效 / 环绕 / 混响、独立变调（不改速度只改音高）。

## 前置验证（已完成）

EQ 与空间音效必须走 Web Audio API，而 `createMediaElementSource()` 对**跨域且未使用 CORS** 的媒体资源会**输出静音**（不报错）。因此需先确认歌曲 CDN 是否返回 CORS 头，这是本方案的 go/no-go 前提。

实测（只读 HEAD 请求，未下载音频）：

| 检查项 | 结果 |
| --- | --- |
| `Access-Control-Allow-Origin` | `*` |
| `Access-Control-Allow-Methods` | `GET,POST,OPTIONS` |
| `Accept-Ranges` | `bytes` |
| 采样覆盖 | 5 首歌 × 2 个 CDN 节点（`m702` / `m801`），全部通过 |

**结论：技术前提成立，不需要后端代理。**

### 由此产生的硬约束

CDN 同时返回了 `Access-Control-Allow-Origin: *` 和 `Access-Control-Allow-Credentials: true`。两者按规范互斥 —— 带凭据的请求不允许用通配符，浏览器会拒绝。因此：

```typescript
audio.crossOrigin = 'anonymous'        // ✅ 凭据模式 same-origin，接受 *
// audio.crossOrigin = 'use-credentials'   // ❌ 会被拒绝 → 输出静音
```

另：`createMediaElementSource()` **每个 audio 元素一生只能调用一次**，重复调用抛 `InvalidStateError`。接线逻辑必须集中在一处、且幂等。

### 既有隐患（本次不处理）

歌曲 URL 是 `http://m702.music.126.net/...` —— **HTTP 而非 HTTPS**。本地 `localhost` 开发无碍，但若前端部署到 HTTPS 域名，浏览器会因混合内容直接屏蔽音频。此问题当前已存在，与本次改动无关。

## 已确认的需求决策

| 决策点 | 结论 |
| --- | --- |
| 代码组织 | 方案 A：音频图直接放进 `MusicController`（音频元素是私有的，只有其拥有者能碰） |
| EQ 表现 | 竖向 5 条 + 0 dB 参考线（横排"从左填充"在 ±dB 语义下易误读） |
| 频段划分 | 60 / 230 / 910 / 3.6k / 14k Hz，±12 dB，step 1 |
| 预设清单 | 原声 / 低音增强 / 人声 / 摇滚 / 古典 |
| 变速范围 | 0.5x–2.0x，step 0.05，`Switch` 控制保调 |
| 强调色 | `#fa233b`（跟随 footer，不用灰阶的 `--primary`） |
| 持久化写入时机 | `watchDebounced` 300ms，避免拖动时每帧写盘 |
| 对话框 | 毛玻璃 `Dialog`，必须带 `absolute!`（原因见下） |
| 音量 bug | 本次一并修复 |
| 全屏播放器未使用的 `volume` 解构 | 不动（属另一文件、另一件事） |

## 现状分析

### 音频链路

- `MusicController.ts:18` —— `this.audio = new Audio()`，未设 `crossOrigin`。
- `MusicController.ts:141` —— `this.audio.src = song.url!`，直接指向 CDN 绝对地址（跨域）。
- `MusicController.ts:168` —— `setVolume()` 走 `audio.volume`，范围 0–1。
- `playerStore.ts:7` —— `new MusicController()` 模块级单例。

### 音量 bug：三层互不相识

| 位置 | 值 | 是否驱动真实音量 |
| --- | --- | --- |
| `playerStore.ts:22` `volume` | `0.5` | ✅ `init()` 中 `player.setVolume(0.5)` |
| `TheFooter.vue:42` 局部 `volume` | `ref(70)` | ❌ 纯 UI，只喂 footer 自己的滑块 |
| `FullScreenPlayer.vue:22` | 解构了 store 的 `volume` | ❌ 全文件仅此一处出现，从未使用 |

结果：真实音量 50%，footer 滑块显示 70%。拖动有效（`handleVolume` 会调 action），但初始显示是假的，外部改动也不回流。

### `absolute!` 的必要性

`styles/glass.css:30-37`：

```css
.glass-container,
.glass-card,
.glass-effect {
  position: relative;   /* 无 !important */
  ...
}
```

`DialogContent.vue:37` 的默认类是 `fixed`。两者都是单类选择器，**特异度相同**，此时按源码顺序决胜 —— `glass.css` 在 Tailwind utilities 之后，于是 `.glass-container { position: relative }` **覆盖** `.fixed`。对话框会失去居中，退回文档流。

`absolute!`（Tailwind v4 尾部 `!` = `!important`）强行压过它。`DialogPortal` 已将节点 teleport 到 `body`，无定位祖先，故 `absolute` 相对初始包含块（视口）解析，行为等同于 `fixed`。

> **通用约束**：`.glass-container` 会覆盖 `position`。任何需要脱离文档流的毛玻璃容器都必须显式加 `absolute!` / `fixed!`。已在 `collectSongToPlaylistDialog.vue:76` 沿用此写法。

### 新装组件的适配点

- **`Slider` 的 `modelValue` 是 `number[]` 而非 `number`** —— 组件内 `v-for="(_, key) in modelValue"` 依赖数组渲染 thumb，传单值会崩。单值滑块也须包成数组。
- **`--primary` 是灰阶**（`tokens.css:54/115`：`oklch(0.205 0 0)` / `oklch(0.922 0 0)`，chroma 均为 0）。`Slider` 的填充与 `Switch` 的选中态都用 `bg-primary`，直接用会与 footer 的红色体系割裂。
- 项目既有两处红色不统一：`tokens.css:37` 的 `--primary-color: #e74c3c` 与 footer / PlaylistPanel / artistDivider 中写死的 `#fa233b`。本次跟随 footer 用 `#fa233b`。

## 设计

### 1. 常量 — `src/constants/audioEffects.ts`（新建）

```typescript
export interface EqBand {
  key: string
  label: string
  type: BiquadFilterType
  frequency: number
  Q: number
}

export const EQ_BANDS: readonly EqBand[] = [
  { key: 'low',     label: '60Hz',  type: 'lowshelf',  frequency: 60,    Q: 0.7 },
  { key: 'lowMid',  label: '230Hz', type: 'peaking',   frequency: 230,   Q: 1.0 },
  { key: 'mid',     label: '910Hz', type: 'peaking',   frequency: 910,   Q: 1.0 },
  { key: 'highMid', label: '3.6k',  type: 'peaking',   frequency: 3600,  Q: 1.0 },
  { key: 'high',    label: '14k',   type: 'highshelf', frequency: 14000, Q: 0.7 },
] as const

export interface EqPreset {
  id: string
  label: string
  gains: readonly number[]
}

export const EQ_PRESETS: readonly EqPreset[] = [
  { id: 'flat',      label: '原声',     gains: [0, 0, 0, 0, 0] },
  { id: 'bass',      label: '低音增强', gains: [6, 4, 0, -1, 0] },
  { id: 'vocal',     label: '人声',     gains: [-2, 0, 3, 3, 1] },
  { id: 'rock',      label: '摇滚',     gains: [4, 2, -1, 2, 3] },
  { id: 'classical', label: '古典',     gains: [0, 0, 0, 1, 4] },
] as const

export const EQ_GAIN_MIN = -12
export const EQ_GAIN_MAX = 12
export const PLAYBACK_RATE_MIN = 0.5
export const PLAYBACK_RATE_MAX = 2
```

`gains` 数组长度必须等于 `EQ_BANDS.length`（当前 5）。这是两者之间唯一的耦合点，改频段数时两处必须同步。

### 2. `MusicController` — `src/core/player/MusicController.ts`

新增私有字段：

```typescript
private ctx: AudioContext | null = null
private filters: BiquadFilterNode[] = []
private eqGains: number[] = EQ_BANDS.map(() => 0)
```

新增 `ensureGraph()` —— **幂等**，只在首次 `play()` 中同步调用：

```typescript
private ensureGraph() {
  if (this.ctx) {
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return
  }
  try {
    this.ctx = new AudioContext()
    let node: AudioNode = this.ctx.createMediaElementSource(this.audio)
    this.filters = EQ_BANDS.map((band, i) => {
      const f = this.ctx!.createBiquadFilter()
      f.type = band.type
      f.frequency.value = band.frequency
      f.Q.value = band.Q
      f.gain.value = this.eqGains[i]!    // 回放已保存的增益
      node.connect(f)
      node = f
      return f
    })
    node.connect(this.ctx.destination)
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  } catch {
    this.ctx = null    // 降级：无音效，但不影响播放
    this.filters = []
  }
}
```

`play()` **保持同步**，只是先建图：

```typescript
play() {
  this.ensureGraph()
  this.audio.play()
}
```

> ⚠️ **时序约束**：`play()` 绝不能改成 `async` 然后 `await ctx.resume()` 再 `audio.play()`。自动播放策略要求 `audio.play()` 发生在用户手势的同步路径上，一旦 `await` 就掉进微任务、手势令牌可能失效，**首次播放会无声**。反过来，在用户手势中 `new AudioContext()` 本身就是 `running` 状态，`resume()` 近乎空操作。所以顺序必须是「同步建图 → 立刻 play」。

> 关于 catch 分支：若 `createMediaElementSource` 已成功、但后续步骤抛错，音频元素已被永久绑定到该 context，无法重新接线。此时置 `ctx = null` 使下一次 `ensureGraph()` 重试 —— 重试会在 `createMediaElementSource` 处抛 `InvalidStateError`，被同一个 catch 接住，结果仍是 `ctx = null`。**降级路径是收敛的，不会死循环，播放始终正常。**

新增公开方法：

```typescript
setEqGains(gains: number[]) {
  this.eqGains = [...gains]
  this.filters.forEach((f, i) => {
    if (this.eqGains[i] !== undefined) f.gain.value = this.eqGains[i]!
  })
}

setPlaybackRate(rate: number) {
  // 必须同时设 defaultPlaybackRate：媒体加载算法会把 playbackRate 重置为 defaultPlaybackRate，
  // 只设前者会导致「一换歌倍速就丢」
  this.audio.defaultPlaybackRate = rate
  this.audio.playbackRate = rate
}

setPreservesPitch(enabled: boolean) {
  const a = this.audio as HTMLAudioElement & {
    webkitPreservesPitch?: boolean
    mozPreservesPitch?: boolean
  }
  if ('preservesPitch' in a) a.preservesPitch = enabled
  else if ('webkitPreservesPitch' in a) a.webkitPreservesPitch = enabled
  else if ('mozPreservesPitch' in a) a.mozPreservesPitch = enabled
}
```

> ⚠️ `load()` 中的 `this.audio.load()` 会按 HTML 规范把 `playbackRate` 重置回 `defaultPlaybackRate`。因此 `setPlaybackRate` 必须**同时写两个属性**，否则换歌后倍速丢失。此项列入验证清单。

**现有方法签名一个都不改。**

### 3. `playerStore` — `src/stores/playerStore.ts`

新增状态：

```typescript
const eqPresetId = ref<string>('flat')
const eqGains = ref<number[]>(EQ_BANDS.map(() => 0))
const playbackRate = ref<number>(1)
const preservesPitch = ref<boolean>(true)
```

新增 action：

```typescript
const setEqPreset = (id: string) => {
  const preset = EQ_PRESETS.find((p) => p.id === id)
  if (!preset) return
  eqPresetId.value = id
  eqGains.value = [...preset.gains]
  player.setEqGains(eqGains.value)
}

const setBandGain = (index: number, gain: number) => {
  const clamped = Math.max(EQ_GAIN_MIN, Math.min(EQ_GAIN_MAX, gain))
  const next = [...eqGains.value]
  next[index] = clamped
  eqGains.value = next
  eqPresetId.value = ''            // 手动改动后脱离预设，预设按钮全部取消高亮
  player.setEqGains(next)
}

const setPlaybackRate = (rate: number) => {
  const clamped = Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAX, rate))
  playbackRate.value = clamped
  player.setPlaybackRate(clamped)
}

const setPreservesPitch = (enabled: boolean) => {
  preservesPitch.value = enabled
  player.setPreservesPitch(enabled)
}
```

全部在 `return` 中导出。

### 4. 持久化

单一 localStorage key `player_settings`，音量与音效共用 —— 两者是同一层设置，分两套机制只会重复劳动。

```typescript
const SETTINGS_KEY = 'player_settings'

const persistSettings = () => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      volume: volume.value,
      eqPresetId: eqPresetId.value,
      eqGains: eqGains.value,
      playbackRate: playbackRate.value,
      preservesPitch: preservesPitch.value,
    }))
  } catch {
    // localStorage 不可用（隐私模式 / 配额）时静默忽略，不影响播放
  }
}

watchDebounced(
  () => ({
    volume: volume.value,
    eqPresetId: eqPresetId.value,
    eqGains: [...eqGains.value],
    playbackRate: playbackRate.value,
    preservesPitch: preservesPitch.value,
  }),
  persistSettings,
  { debounce: 300 },
)
```

`watchDebounced` 来自 `@vueuse/core`（已是项目依赖）。

**读取**放在 `init()` 最前面 —— 必须在 `player.setVolume(volume.value)` 之前：

```typescript
const loadSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return
    const s = JSON.parse(raw)

    if (typeof s.volume === 'number' && s.volume >= 0 && s.volume <= 1) {
      volume.value = s.volume
    }
    if (Array.isArray(s.eqGains) &&
        s.eqGains.length === EQ_BANDS.length &&
        s.eqGains.every((g: unknown) => typeof g === 'number' && Number.isFinite(g))) {
      eqGains.value = s.eqGains
    }
    if (typeof s.eqPresetId === 'string') {
      eqPresetId.value = s.eqPresetId
    }
    if (typeof s.playbackRate === 'number' &&
        s.playbackRate >= PLAYBACK_RATE_MIN && s.playbackRate <= PLAYBACK_RATE_MAX) {
      playbackRate.value = s.playbackRate
    }
    if (typeof s.preservesPitch === 'boolean') {
      preservesPitch.value = s.preservesPitch
    }
  } catch {
    // 坏数据 / 旧版本结构 → 整体忽略，走默认值
  }
}
```

**逐字段校验是必需的**：localStorage 中可能存在损坏 JSON 或旧版本结构（例如频段数变更后 `eqGains` 长度不匹配）。一个坏 JSON 不允许把播放器搞挂。

`init()` 中在 `player.setVolume(volume.value)` 之后追加：

```typescript
player.setEqGains(eqGains.value)
player.setPlaybackRate(playbackRate.value)
player.setPreservesPitch(preservesPitch.value)
```

### 5. 音量 bug 修复 — `src/components/layout/TheFooter.vue`

```typescript
// 改：解构补上 volume
const { currentSong, currentTime, duration, playing, volume } = storeToRefs(playerStore)

// 删：局部 ref
// const volume = ref(70)

// 新增：store 存 0–1，滑块要 0–100，双向桥接
const volumePercent = computed({
  get: () => Math.round(volume.value * 100),
  set: (v: number) => playerStore.setVolume(v),
})
```

同时：

- 删除 `handleVolume` 函数与模板上的 `@input="handleVolume"`（`v-model` + computed setter 已覆盖）。
- 模板 `:style="{ width: `${volume}%` }"` → `${volumePercent}%`。
- 模板 `v-model="volume"` → `v-model="volumePercent"`。

`computed` 已在第 2 行 import（`import { ref, computed } from 'vue'`），无需新增。`ref` 仍被 `isPlaylistOpen` 使用，import 保留。

> **真实音量不变**：改后仍以 50% 出声，只是 footer 不再显示错误的 70%。不会出现「修完音量突然变了」。

### 6. 音效对话框 — `src/components/common/AudioEffectDialog.vue`（新建）

与 `PlaylistPanel.vue` 同级（两者都是 footer 的附属面板）。

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/playerStore'
import { EQ_BANDS, EQ_PRESETS, EQ_GAIN_MIN, EQ_GAIN_MAX,
         PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX } from '@/constants/audioEffects'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const open = defineModel<boolean>('open', { default: false })

const playerStore = usePlayerStore()
const { eqPresetId, eqGains, playbackRate, preservesPitch } = storeToRefs(playerStore)
</script>
```

模板骨架：

```vue
<Dialog v-model:open="open">
  <DialogContent class="absolute! glass-container z-500 max-w-md rounded-2xl overflow-hidden
    [&_[data-slot=slider-range]]:bg-[#fa233b]
    [&_[data-slot=slider-thumb]]:border-[#fa233b]
    [&_[data-slot=switch][data-state=checked]]:bg-[#fa233b]">
    <DialogHeader>
      <DialogTitle>音效设置</DialogTitle>
      <DialogDescription class="sr-only">调整均衡器与播放速度</DialogDescription>
    </DialogHeader>
    <!-- EQ 预设区 / EQ 频段区 / 变速区 -->
  </DialogContent>
</Dialog>
```

类名顺序照 `collectSongToPlaylistDialog.vue:76`。

**EQ 预设区**：`Button` 横向排列渲染 `EQ_PRESETS`，选中态用 `variant="default"`、未选中用 `variant="secondary"`（判据 `eqPresetId === preset.id`），点击调 `playerStore.setEqPreset(preset.id)`。手动拖动频段后 `eqPresetId` 被置空，所有预设按钮统一回到未选中态。

**EQ 频段区**：5 条竖向 `Slider`，`orientation="vertical"`，每条绑定单一频段。竖向高度由组件内 `data-[orientation=vertical]:min-h-44` 提供，外层容器给足高度即可。

```vue
<div class="relative flex justify-between gap-2">
  <!-- 0 dB 参考线：横跨全部 5 条，位于滑块区垂直中点 -->
  <div class="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-border" />

  <div v-for="(band, i) in EQ_BANDS" :key="band.key" class="flex flex-col items-center gap-2">
    <Slider
      orientation="vertical"
      :model-value="[eqGains[i] ?? 0]"
      :min="EQ_GAIN_MIN"
      :max="EQ_GAIN_MAX"
      :step="1"
      @update:model-value="(v: number[]) => playerStore.setBandGain(i, v[0] ?? 0)"
    />
    <span class="text-xs text-muted-foreground">{{ band.label }}</span>
  </div>
</div>
```

0 dB 参考线是**一条**横跨 5 条滑块的横线（不是每条各一条），位置在滑块区的垂直中点 —— 即 `(-12 + 12) / 2 = 0 dB` 对应的位置。频段标签在滑块下方，不影响参考线定位。

变速区：

```vue
<Slider
  :model-value="[playbackRate]"
  :min="PLAYBACK_RATE_MIN"
  :max="PLAYBACK_RATE_MAX"
  :step="0.05"
  @update:model-value="(v: number[]) => playerStore.setPlaybackRate(v[0] ?? 1)"
/>

<Switch
  :model-value="preservesPitch"
  @update:model-value="playerStore.setPreservesPitch"
/>
```

统一用 `:model-value` + `@update:model-value` 而非 `v-model`，以显式走 store 的 action（action 内还要推给 `MusicController`）。直接 `v-model` 绑 `storeToRefs` 的 ref 会绕过 action。

每个频段在滑块旁显示数值（如 `+6.0 dB`）—— 仅凭位置判断 ±dB 容易误读。

### 7. Footer 入口 — `src/components/layout/TheFooter.vue`

在 `.volume-section` 内、音量图标**左侧**插入：

```vue
<BouncingIconButton
  size="h-9 w-9"
  hover-bg="hover:bg-black/5 dark:hover:bg-white/10"
  :pressed-scale="0.8"
  custom-class="icon-btn"
  @click="isEffectOpen = true"
>
  <SlidersHorizontal :size="18" />
</BouncingIconButton>
```

配套 `const isEffectOpen = ref(false)`，并在 `<Teleport to="body">` 区块内挂 `<AudioEffectDialog v-model:open="isEffectOpen" />`。图标 `SlidersHorizontal` 取自既有的 `lucide-vue-next`。

**只加不改** —— 现有 7 个控件的结构与样式不动。

## 降级与错误处理

| 场景 | 行为 |
| --- | --- |
| 浏览器无 `AudioContext` | `ensureGraph()` 的 try/catch 接住，`ctx` 保持 null，**播放正常**，EQ 静默失效 |
| `createMediaElementSource` 抛错 | 同上，降级为无音效 |
| 用户未碰过音效 | 全 0 dB 透传，**听感与改动前完全一致** |
| localStorage 损坏 / 结构过期 | 逐字段校验失败即忽略该字段，整体回退默认值 |
| localStorage 不可用 | 写入侧 try/catch 静默忽略 |

**一条铁律：音效永远是增强，任何失败都不允许让播放挂掉。**

## 验证

项目无测试框架（仅有 `type-check` / `lint` / `build`），验证以手动为主。

1. `pnpm type-check` 通过。
2. `pnpm build` 通过。
3. **首次播放有声** —— 验证 AudioContext 时序未致哑（**最高风险项**）。
4. **不做任何操作时听感与改动前一致** —— 验证全 0 dB 透传。
5. 切换各预设能听出差异；切回「原声」恢复。
6. 手动拖动某一频段 → 预设高亮取消；数值显示与听感一致。
7. 调到 2.0x → **换下一首，倍速仍在** —— 验证 `defaultPlaybackRate` 未被 `load()` 冲掉。
8. 保调开 / 关在 0.5x 下对比明显。
9. 刷新页面 → 音量、预设、倍速全部恢复。
10. footer 音量滑块显示值与真实音量一致（初始 50%），全屏播放器不受影响。
11. 全屏播放器、歌词背景动画正常。

## 影响面 / 风险

改动文件：

| 文件 | 改动 |
| --- | --- |
| `src/constants/audioEffects.ts` | 新建 |
| `src/core/player/MusicController.ts` | 新增字段 + `ensureGraph` / `setEqGains` / `setPlaybackRate` / `setPreservesPitch`；`play()` 内加一行 |
| `src/stores/playerStore.ts` | 新增 4 个状态 + 4 个 action + 持久化 |
| `src/components/common/AudioEffectDialog.vue` | 新建 |
| `src/components/layout/TheFooter.vue` | 新增音效按钮；音量改用 store |

不触碰：`api/`、`MusicService.ts`、`router/`、`FullScreenPlayer.vue`、事件总线。

### 风险点

- **首次播放静音**（`play()` 的同步性）—— 见「设计 2」的时序约束与验证第 3 项。
- **换歌后倍速丢失**（`load()` 重置 `playbackRate`）—— 见「设计 2」与验证第 7 项。
- **`crossOrigin` 必须为 `anonymous`** —— 用 `use-credentials` 会因 `*` + `Allow-Credentials` 冲突被拒。
- `createMediaElementSource` 仅可调用一次 —— 由 `ensureGraph()` 的 `if (this.ctx) return` 保证。

### 已知遗留（不在本次范围）

- `FullScreenPlayer.vue:22` 解构了 store 的 `volume` 但从未使用 —— 另一文件、另一件事，按最小影响面不动。
- 红色不统一：`tokens.css:37` 的 `--primary-color: #e74c3c` 与 footer 等处写死的 `#fa233b`。
- 歌曲 URL 为 HTTP，HTTPS 部署下会被混合内容策略屏蔽（既有隐患）。
- `@lucide/vue` 已随 shadcn 引入但 `src/` 中零引用，项目仍统一使用 `lucide-vue-next`。

## 文档更新

实施完成后需同步 `CLAUDE.md`，其中多处已与代码不符：

- **「已知问题 #4」失效** —— `core/player/player.ts` **文件不存在**，import 大小写问题已不存在。真实单例在 `stores/playerStore.ts:7`，导入路径大小写正确，该条目应删除。
- 样式文件路径过期 —— 文中引用的 `src/style.css`、`src/styles/dark-mode.css` 已不存在，现为 `src/styles/` 下的 `tokens.css` / `glass.css` / `base.css` / `buttons.css` / `animations.css` / `utilities.css` / `index.css`。
- `src/components/ui/` 现为 18 个（新增 `slider` / `switch`）。
- 需新增：音效常量文件、`MusicController` 的音频图与新增方法、`player_settings` 持久化 key。
