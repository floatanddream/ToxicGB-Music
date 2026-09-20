# 音效调整（EQ 预设 + 变速）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为播放器加上 5 段均衡器预设与变速播放（含保调开关），并修复 Footer 音量滑块与真实音量脱钩的 bug。

**Architecture:** 在 `MusicController` 内一次性搭好 Web Audio 音频图（`MediaElementSource → BiquadFilter×5 → destination`），节点图成员变量私有，仅通过 `setEqGains` / `setPlaybackRate` / `setPreservesPitch` 暴露。`playerStore` 持有音效状态并负责持久化，`AudioEffectDialog` 只读写 store、永不接触 Web Audio。

**Tech Stack:** Vue 3.5 + TypeScript + Pinia + reka-ui（shadcn 风格 `Slider` / `Switch` / `Dialog`）+ Web Audio API + @vueuse/core

**设计文档：** `docs/superpowers/specs/2026-09-19-audio-effects-design.md`

## Global Constraints

- **本项目无测试框架。** 可用命令仅 `pnpm dev` / `pnpm build` / `pnpm type-check` / `pnpm format` / `pnpm preview` / `pnpm lint`。**不要引入 vitest / jest 或任何测试依赖。** 每个任务的自动化验证一律是 `pnpm type-check`，其余为手动浏览器验证，观察项已写死。
- ⚠️ **`pnpm type-check` 的基线不是干净的**：截至 2026-09-19，仓库存在 **25 个既存 TypeScript 错误**，全部位于与本次改动无关的文件（`utils/request.ts`、`main.ts`、`core/player/MusicService.ts`、`api/album.ts`、`views/Album/index.vue`、`views/FullscreenPlayer/FullScreenPlayer.vue`、`views/Home/components/carousel.vue`、`components/common/NavigationMenu.vue`、`components/common/Auth/QRCodeLoginForm.vue`）。
  - **验收标准不是"零错误"，而是"不新增错误"**：改动后错误数仍为 25，且本计划涉及的文件（`TheFooter.vue` / `MusicController.ts` / `playerStore.ts` / `audioEffects.ts` / `AudioEffectDialog.vue`）**一个错误都不能出现在清单里**。
  - 基线清单已固化在 `.superpowers/sdd/typecheck-baseline.txt`。比对方法：
    ```bash
    pnpm type-check 2>&1 | grep -E "^src/.*error TS" | sort > /tmp/now.txt
    diff .superpowers/sdd/typecheck-baseline.txt /tmp/now.txt
    ```
    预期：无输出（完全相同）。
  - **不要试图修复这 25 个既存错误** —— 它们不属于本次范围。
- ⚠️ **`pnpm build` 当前就是失败的**：`package.json` 中 `"build": "run-p type-check \"build-only {@}\" --"` 会并行执行 type-check，而 type-check 因上述 25 个既存错误返回非零，导致 `pnpm build` 整体失败。**Task 5 的构建验收改用 `pnpm build-only`（即 `vite build`）**，它才是"代码能否打包"的真实信号。
- **本次执行全程不提交。** 用户裁定：所有改动只留在工作区，待全部任务完成、用户验证通过后统一提交。**每个任务末尾的 "请求批准并提交" 步骤一律跳过** —— 不要执行 `git commit`，也不要执行 `git add`。因无 commit，任务审查的 diff 由控制者用文件快照生成。
- **不得启动服务。** 项目约定：Agent 不得以任何理由启动前端 / 后端服务，`pnpm dev` 只能由人类执行。需要跑起来观察时，请用户启动。
- **不得用 Hack 方式操作数据库。** 不涉及。
- **文件删除需先过问用户。** 本计划无删除操作。
- **拼写错误沿用旧写法**：`SCROOL_TOP` / `TOAST_SUSSESS` / `extractLeagcyLyrics` 不要"顺手修正"。
- **`crossOrigin` 必须是 `'anonymous'`**，绝不能用 `'use-credentials'`。
- **红强调色统一用 `#fa233b`**（跟随 footer），不用灰阶的 `--primary`。
- **EQ 频段数固定 5**，`EQ_BANDS.length` 与每个 preset 的 `gains` 长度必须相等。
- 现有方法签名一律不改，只新增。

---

### Task 1: 修复 Footer 音量滑块与 store 脱钩

**Files:**
- Modify: `src/components/layout/TheFooter.vue`

**Interfaces:**
- Consumes: `playerStore.volume`（`Ref<number>`，0–1，已存在于 `stores/playerStore.ts:22`）、`playerStore.setVolume(v: number)`（入参 0–100，已存在于 `stores/playerStore.ts:239`）
- Produces: 组件内 `volumePercent` computed（不对外导出）

**背景：** 当前 `TheFooter.vue:42` 有个局部的 `const volume = ref(70)`，只喂 footer 自己的滑块，与 store 的 `volume`（真实值 0.5）完全脱钩。表现为：真实音量 50%，滑块显示 70%。本任务只修复绑定关系，**不改持久化**（持久化在 Task 3）。

- [ ] **Step 1: 补上 store 的 volume 解构，新增双向桥接 computed**

打开 `src/components/layout/TheFooter.vue`，找到第 15 行：

```typescript
const { currentSong, currentTime, duration, playing } = storeToRefs(playerStore)
```

改为：

```typescript
const { currentSong, currentTime, duration, playing, volume } = storeToRefs(playerStore)
```

- [ ] **Step 2: 删除组件内的 handleVolume 函数**

删除第 32–35 行整段：

```typescript
const handleVolume = (e: Event) => {
  const target = e.target as HTMLInputElement
  playerStore.setVolume(Number(target.value))
}
```

- [ ] **Step 3: 删除局部 volume ref，新增 volumePercent computed**

删除第 42 行：

```typescript
const volume = ref(70)
```

在 `isPlaylistOpen` 声明之后（原第 16 行附近）插入：

```typescript
// store 存 0-1，滑块要 0-100，双向桥接
const volumePercent = computed({
  get: () => Math.round(volume.value * 100),
  // 原生 range 的 v-model 传字符串（Vue 的 castToNumber 只对 type="number" / .number 生效），此处显式转换
  set: (v: number | string) => playerStore.setVolume(Number(v)),
})
```

> `computed` 已在第 2 行 import（`import { ref, computed } from 'vue'`），无需新增。`ref` 仍被 `isPlaylistOpen` 使用，import 不可删。

- [ ] **Step 4: 模板改用 volumePercent**

第 135 行：

```vue
<div class="volume-fill" :style="{ width: `${volume}%` }"></div>
```

改为：

```vue
<div class="volume-fill" :style="{ width: `${volumePercent}%` }"></div>
```

第 136–144 行的 `<input>`：

```vue
<input
  type="range"
  class="volume-input"
  min="0"
  max="100"
  v-model="volume"
  @input="handleVolume"
/>
```

改为（去掉 `@input`，`v-model` 由 computed setter 接管）：

```vue
<input
  type="range"
  class="volume-input"
  min="0"
  max="100"
  v-model="volumePercent"
/>
```

- [ ] **Step 5: 类型检查**

```bash
pnpm type-check 2>&1 | grep -E "^src/.*error TS" | sort > /tmp/now.txt
diff .superpowers/sdd/typecheck-baseline.txt /tmp/now.txt
```

Expected: `diff` **无输出** —— 错误清单与基线完全一致（仍为 25 条既存错误），且 `TheFooter.vue` 不出现在其中。若 `TheFooter.vue` 出现在输出里，说明引入了新错误；若报 `volume` 未定义，说明 Step 1 的解构没改；若报 `handleVolume` 未定义，说明 Step 2 漏删。

- [ ] **Step 6: 手动验证（需用户启动 `pnpm dev`）**

浏览器打开应用，**不要播放任何歌曲**，观察 footer 右侧音量条：

- 预期：填充宽度 **50%**（不是 70%）。
- 拖动滑块到 80% → 播放一首歌 → 音量明显大于默认。刷新页面 → 滑回 50%（**这是预期的**，持久化要到 Task 3 才有）。
- 打开全屏播放器 → 不报错，播放正常。

- [ ] **Step 7: 请求批准并提交**

**先向用户请求批准**，获准后执行：

```bash
git add src/components/layout/TheFooter.vue
git commit -m "fix(Footer): 音量滑块接回 store，修复显示值与真实音量脱钩"
```

---

### Task 2: 音频常量 + MusicController 音频图

**Files:**
- Create: `src/constants/audioEffects.ts`
- Modify: `src/core/player/MusicController.ts`

**Interfaces:**
- Consumes: 无（本任务是音频管线的根部）
- Produces:
  - `@/constants/audioEffects` 导出：`EqBand`、`EqPreset`（类型）；`EQ_BANDS: readonly EqBand[]`、`EQ_PRESETS: readonly EqPreset[]`、`EQ_GAIN_MIN: number`、`EQ_GAIN_MAX: number`、`PLAYBACK_RATE_MIN: number`、`PLAYBACK_RATE_MAX: number`
  - `MusicController` 新增方法：`setEqGains(gains: number[]): void`、`setPlaybackRate(rate: number): void`、`setPreservesPitch(enabled: boolean): void`

**这是本计划风险最高的任务** —— 音频一旦接线错误，表现为"完全没声音"而非报错。务必执行 Step 5 的手动验证。

- [ ] **Step 1: 新建常量文件**

创建 `src/constants/audioEffects.ts`：

```typescript
export interface EqBand {
  key: string
  label: string
  type: BiquadFilterType
  frequency: number
  Q: number
}

export interface EqPreset {
  id: string
  label: string
  gains: readonly number[]
}

export const EQ_BANDS: readonly EqBand[] = [
  { key: 'low',     label: '60Hz',  type: 'lowshelf',  frequency: 60,    Q: 0.7 },
  { key: 'lowMid',  label: '230Hz', type: 'peaking',   frequency: 230,   Q: 1.0 },
  { key: 'mid',     label: '910Hz', type: 'peaking',   frequency: 910,   Q: 1.0 },
  { key: 'highMid', label: '3.6k',  type: 'peaking',   frequency: 3600,  Q: 1.0 },
  { key: 'high',    label: '14k',   type: 'highshelf', frequency: 14000, Q: 0.7 },
] as const

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

> `EQ_PRESETS` 中每个 `gains` 的长度**必须**等于 `EQ_BANDS.length`（当前 5）。这是两者唯一的耦合点，改频段数时两处必须同步。

- [ ] **Step 2: 给 MusicController 加字段与 import**

打开 `src/core/player/MusicController.ts`，把第 1 行的 import 改为：

```typescript
import type { Song } from '@/types/player'
import { EQ_BANDS } from '@/constants/audioEffects'
```

在类内 `private mediaSessionHandlers` 之后（第 15 行附近）新增：

```typescript
  private ctx: AudioContext | null = null
  private filters: BiquadFilterNode[] = []
  private eqGains: number[] = EQ_BANDS.map(() => 0)
```

**同时修改构造函数**（这一步不可省略，否则整个音频图输出静音）：

```typescript
  constructor() {
    this.audio = new Audio();
    // 必须在首次设置 src 之前指定：Web Audio 的 MediaElementAudioSourceNode
    // 对「跨域且未经 CORS 批准」的媒体资源会强制输出静音（不报错）。
    // 用 'anonymous' 而非 'use-credentials' —— CDN 返回的是
    // Access-Control-Allow-Origin: *，与带凭据模式互斥，后者会被浏览器拒绝。
    this.audio.crossOrigin = 'anonymous'
    this.initEvents()
    this.initMediaSession()
  }
```

- [ ] **Step 3: 新增 ensureGraph 与三个 setter，并改 play()**

在 `/* ---------------- 播放控制 ---------------- */` 分区内、`private load(song: Song)` 之前插入：

```typescript
  /**
   * 搭建 Web Audio 音频图。幂等 —— 只会在首次调用时真正建图。
   *
   * 注意：createMediaElementSource 对每个 audio 元素一生只能调用一次，
   * 因此整条接线必须集中在此处，且靠 this.ctx 判空保证不重复执行。
   */
  private ensureGraph() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }

    try {
      this.ctx = new AudioContext()

      let node: AudioNode = this.ctx.createMediaElementSource(this.audio)

      this.filters = EQ_BANDS.map((band, i) => {
        const filter = this.ctx!.createBiquadFilter()
        filter.type = band.type
        filter.frequency.value = band.frequency
        filter.Q.value = band.Q
        filter.gain.value = this.eqGains[i] ?? 0 // 回放已保存的增益
        node.connect(filter)
        node = filter
        return filter
      })

      node.connect(this.ctx.destination)

      if (this.ctx.state === 'suspended') void this.ctx.resume()
    } catch (err) {
      // 降级：无音效，但不影响播放。
      // 必须留痕 —— 音频图失败的症状是「静音且不报错」，
      // 没有这条日志就无法区分「图没建成」与「图建成但没声音」。
      console.warn('[MusicController] Web Audio 音频图搭建失败，已降级为无音效播放:', err)
      this.ctx = null
      this.filters = []
    }
  }
```

把现有的 `play()`（第 152–154 行）改为：

```typescript
  play() {
    // 必须保持同步，不能改成 async + await ctx.resume()：
    // 自动播放策略要求 audio.play() 发生在用户手势的同步路径上，
    // 一旦 await 就掉进微任务、手势令牌可能失效，首次播放会无声。
    this.ensureGraph()
    this.audio.play()
  }
```

在 `setVolume` 之后（第 170 行附近）新增三个方法：

```typescript
  setEqGains(gains: number[]) {
    this.eqGains = [...gains]
    this.filters.forEach((filter, i) => {
      const gain = this.eqGains[i]
      if (gain !== undefined) filter.gain.value = gain
    })
  }

  setPlaybackRate(rate: number) {
    // 两个都要写：媒体加载算法（load()）会把 playbackRate 重置为 defaultPlaybackRate。
    // 只写 playbackRate 而不写 defaultPlaybackRate，换歌时倍速会被重置回 1。
    this.audio.defaultPlaybackRate = rate
    this.audio.playbackRate = rate
  }

  setPreservesPitch(enabled: boolean) {
    const audio = this.audio as HTMLAudioElement & {
      webkitPreservesPitch?: boolean
      mozPreservesPitch?: boolean
    }
    if ('preservesPitch' in audio) audio.preservesPitch = enabled
    else if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = enabled
    else if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = enabled
  }
```

- [ ] **Step 4: 类型检查**

```bash
pnpm type-check 2>&1 | grep -E "^src/.*error TS" | sort > /tmp/now.txt
diff .superpowers/sdd/typecheck-baseline.txt /tmp/now.txt
```

Expected: `diff` **无输出**。若 `MusicController.ts` 或 `audioEffects.ts` 出现在输出里，说明引入了新错误。

若报 `Property 'preservesPitch' does not exist on type ...`，说明 Step 3 里的类型断言写漏了。若报 `Cannot find module '@/constants/audioEffects'`，检查 Step 1 的文件路径。

- [ ] **Step 5: 手动验证 —— 最高风险项（需用户启动 `pnpm dev`）**

**这一步必须做，不能跳过。** 音频接线的典型失败模式是"静音且不报错"。

浏览器打开应用，播放任意一首歌：

1. **有声音** —— 若无声，打开 DevTools Console 看有无 `InvalidStateError` / `NotAllowedError`。无声即接线失败，**停下来排查**，不要继续。
2. 音量与改动前无差别（此时全 0 dB，链路应完全透传）。
3. 切歌、拖动进度条、上一首 / 下一首 —— 全部正常。
4. Console 无红色报错。

- [ ] **Step 6: 请求批准并提交**

**先向用户请求批准**，获准后执行：

```bash
git add src/constants/audioEffects.ts src/core/player/MusicController.ts
git commit -m "feat(player): 接入 Web Audio 音频图，新增 EQ / 变速 / 保调控制方法"
```

---

### Task 3: playerStore 音效状态与持久化

**Files:**
- Modify: `src/stores/playerStore.ts`

**Interfaces:**
- Consumes: Task 2 的 `EQ_BANDS` / `EQ_PRESETS` / `EQ_GAIN_MIN` / `EQ_GAIN_MAX` / `PLAYBACK_RATE_MIN` / `PLAYBACK_RATE_MAX`，以及 `MusicController` 的 `setEqGains` / `setPlaybackRate` / `setPreservesPitch`
- Produces: store 上的 `eqPresetId: Ref<string>`、`eqGains: Ref<number[]>`、`playbackRate: Ref<number>`、`preservesPitch: Ref<boolean>`；actions `setEqPreset(id: string): void`、`setBandGain(index: number, gain: number): void`、`setPlaybackRate(rate: number): void`、`setPreservesPitch(enabled: boolean): void`

- [ ] **Step 1: 加 import**

`src/stores/playerStore.ts` 第 5 行：

```typescript
import { ref, watch } from 'vue';
```

改为：

```typescript
import { ref, watch } from 'vue';
import { watchDebounced } from '@vueuse/core';
import {
  EQ_BANDS,
  EQ_PRESETS,
  EQ_GAIN_MIN,
  EQ_GAIN_MAX,
  PLAYBACK_RATE_MIN,
  PLAYBACK_RATE_MAX,
} from '@/constants/audioEffects';
```

- [ ] **Step 2: 新增状态**

在第 22 行 `const volume = ref<number>(0.5);` 之后新增：

```typescript
  // 音效
  const eqPresetId = ref<string>('flat');
  const eqGains = ref<number[]>(EQ_BANDS.map(() => 0));
  const playbackRate = ref<number>(1);
  const preservesPitch = ref<boolean>(true);
```

- [ ] **Step 3: 新增持久化读写**

在 `/* ---------------- 初始化 ---------------- */` 之前插入：

```typescript
  /* ---------------- 设置持久化 ---------------- */
  const SETTINGS_KEY = 'player_settings';

  const persistSettings = () => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          volume: volume.value,
          eqPresetId: eqPresetId.value,
          eqGains: eqGains.value,
          playbackRate: playbackRate.value,
          preservesPitch: preservesPitch.value,
        }),
      );
    } catch {
      // localStorage 不可用（隐私模式 / 配额）时静默忽略，不影响播放
    }
  };

  /**
   * 逐字段校验后再落值。
   * localStorage 中可能存在损坏 JSON 或旧版本结构（例如频段数变更后
   * eqGains 长度不匹配），一个坏数据不允许把播放器搞挂。
   */
  const loadSettings = () => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;

      const s = JSON.parse(raw);

      if (typeof s.volume === 'number' && s.volume >= 0 && s.volume <= 1) {
        volume.value = s.volume;
      }
      if (
        Array.isArray(s.eqGains) &&
        s.eqGains.length === EQ_BANDS.length &&
        s.eqGains.every((g: unknown) => typeof g === 'number' && Number.isFinite(g))
      ) {
        eqGains.value = s.eqGains;
      }
      if (typeof s.eqPresetId === 'string') {
        eqPresetId.value = s.eqPresetId;
      }
      if (
        typeof s.playbackRate === 'number' &&
        s.playbackRate >= PLAYBACK_RATE_MIN &&
        s.playbackRate <= PLAYBACK_RATE_MAX
      ) {
        playbackRate.value = s.playbackRate;
      }
      if (typeof s.preservesPitch === 'boolean') {
        preservesPitch.value = s.preservesPitch;
      }
    } catch {
      // 坏数据 / 旧版本结构 → 整体忽略，走默认值
    }
  };
```

- [ ] **Step 4: 在 init() 里接上读写**

把 `init()`（第 29 行起）开头改为：

```typescript
  const init = () => {
    loadSettings();

    player.setVolume(volume.value);
    player.setEqGains(eqGains.value);
    player.setPlaybackRate(playbackRate.value);
    player.setPreservesPitch(preservesPitch.value);
```

> `loadSettings()` **必须在** `player.setVolume(volume.value)` 之前 —— 否则会把刚读出来的音量又覆盖成默认值。`init()` 原有的其余内容（MediaSession handlers、player.on 监听）保持不变。

在文件末尾的 `watch(currentIndex, ...)` 之后追加：

```typescript
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
  );
```

- [ ] **Step 5: 新增四个 action**

在 `setVolume`（第 239 行附近）之后新增：

```typescript
  /* ---------------- 音效 ---------------- */
  const setEqPreset = (id: string) => {
    const preset = EQ_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    eqPresetId.value = id;
    eqGains.value = [...preset.gains];
    player.setEqGains(eqGains.value);
  };

  const setBandGain = (index: number, gain: number) => {
    // 越界 index 会让数组膨胀，持久化后又被 loadSettings 的长度校验整体拒绝，
    // 症状是「下次进入页面整个 EQ 静默回退默认值」—— 直接拦掉。
    if (index < 0 || index >= EQ_BANDS.length) return;
    const clamped = Math.max(EQ_GAIN_MIN, Math.min(EQ_GAIN_MAX, gain));
    const next = [...eqGains.value];
    next[index] = clamped;
    eqGains.value = next;
    eqPresetId.value = ''; // 手动改动后脱离预设，所有预设按钮取消高亮
    player.setEqGains(next);
  };

  const setPlaybackRate = (rate: number) => {
    const clamped = Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAX, rate));
    playbackRate.value = clamped;
    player.setPlaybackRate(clamped);
  };

  const setPreservesPitch = (enabled: boolean) => {
    preservesPitch.value = enabled;
    player.setPreservesPitch(enabled);
  };
```

- [ ] **Step 6: 导出新增的状态与 action**

在 `return { ... }` 中：

- 状态区（`volume,` 一行附近）新增 `eqPresetId,` `eqGains,` `playbackRate,` `preservesPitch,`
- action 区（`setVolume,` 一行附近）新增 `setEqPreset,` `setBandGain,` `setPlaybackRate,` `setPreservesPitch,`

- [ ] **Step 7: 类型检查**

```bash
pnpm type-check 2>&1 | grep -E "^src/.*error TS" | sort > /tmp/now.txt
diff .superpowers/sdd/typecheck-baseline.txt /tmp/now.txt
```

Expected: `diff` **无输出**。

- [ ] **Step 8: 手动验证持久化（需用户启动 `pnpm dev`）**

此时还没有 UI，用 localStorage 直接验证整条链路：

1. 浏览器打开应用 → DevTools → Application → Local Storage → 找 `player_settings`。
   - 预期：**暂时还没有**（要等你改点什么才会写入）。
2. 拖动 footer 音量条到任意位置，等 1 秒。
   - 预期：`player_settings` 出现，`volume` 是 0–1 的小数。
3. 刷新页面。
   - 预期：音量保持在上一步的位置（**Task 1 里"刷新回 50%"的行为到此结束**）。
4. **验证 EQ 链路**：在 Console 执行
   ```javascript
   localStorage.setItem('player_settings', JSON.stringify({
     volume: 0.5, eqPresetId: 'bass', eqGains: [6,4,0,-1,0],
     playbackRate: 1, preservesPitch: true
   }))
   ```
   刷新页面 → 播放一首歌。
   - 预期：**低音明显增强**。这说明「读取持久化 → `setEqGains` → `ensureGraph` 回放增益」整条链路通了。
   - 若听不出差别，说明 `ensureGraph` 里的 `filter.gain.value = this.eqGains[i]` 回放逻辑有问题。
5. **验证变速链路**：Console 执行
   ```javascript
   localStorage.setItem('player_settings', JSON.stringify({
     volume: 0.5, eqPresetId: 'flat', eqGains: [0,0,0,0,0],
     playbackRate: 2, preservesPitch: true
   }))
   ```
   刷新 → 播放 → 预期 **2 倍速且音高不变**。再点"下一首" → **倍速仍在**（验证 `defaultPlaybackRate` 没被 `load()` 冲掉）。

- [ ] **Step 9: 请求批准并提交**

**先向用户请求批准**，获准后执行：

```bash
git add src/stores/playerStore.ts
git commit -m "feat(playerStore): EQ / 变速状态与 action，新增 player_settings 持久化"
```

---

### Task 4: AudioEffectDialog + Footer 入口

**Files:**
- Create: `src/components/common/AudioEffectDialog.vue`
- Modify: `src/components/layout/TheFooter.vue`

**Interfaces:**
- Consumes: Task 3 的 store 状态（`eqPresetId` / `eqGains` / `playbackRate` / `preservesPitch`）与 actions（`setEqPreset` / `setBandGain` / `setPlaybackRate` / `setPreservesPitch`）；Task 2 的常量
- Produces: `AudioEffectDialog.vue`，通过 `v-model:open` 受控

- [ ] **Step 1: 新建对话框组件**

创建 `src/components/common/AudioEffectDialog.vue`：

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/playerStore'
import {
  EQ_BANDS,
  EQ_PRESETS,
  EQ_GAIN_MIN,
  EQ_GAIN_MAX,
  PLAYBACK_RATE_MIN,
  PLAYBACK_RATE_MAX,
} from '@/constants/audioEffects'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const open = defineModel<boolean>('open', { default: false })

const playerStore = usePlayerStore()
const { eqPresetId, eqGains, playbackRate, preservesPitch } = storeToRefs(playerStore)
</script>

<template>
  <Dialog v-model:open="open">
    <!--
      absolute! 不是可选项：.glass-container（styles/glass.css:33）声明了
      position: relative 且没有 !important，与 DialogContent 默认的 fixed
      同特异度、按源码顺序胜出，会吃掉居中定位。加 absolute! 强行压过它。
    -->
    <DialogContent
      class="absolute! glass-container z-500 max-w-md rounded-2xl overflow-hidden [&_[data-slot=slider-range]]:bg-[#fa233b] [&_[data-slot=slider-thumb]]:border-[#fa233b] [&_[data-slot=switch][data-state=checked]]:bg-[#fa233b]"
    >
      <DialogHeader>
        <DialogTitle>音效设置</DialogTitle>
        <DialogDescription class="sr-only">调整均衡器与播放速度</DialogDescription>
      </DialogHeader>

      <!-- 均衡器 -->
      <div class="mt-4">
        <p class="text-sm text-muted-foreground mb-3">均衡器预设</p>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="preset in EQ_PRESETS"
            :key="preset.id"
            size="sm"
            :variant="eqPresetId === preset.id ? 'default' : 'secondary'"
            @click="playerStore.setEqPreset(preset.id)"
          >
            {{ preset.label }}
          </Button>
        </div>

        <!-- 频段：每列自带 0 dB 参考线，避免跨列对齐的魔法偏移 -->
        <div class="mt-5 flex justify-around gap-3">
          <div
            v-for="(band, i) in EQ_BANDS"
            :key="band.key"
            class="flex flex-col items-center gap-2"
          >
            <div class="relative h-44">
              <div
                class="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border"
              />
              <Slider
                orientation="vertical"
                class="h-full"
                :model-value="[eqGains[i] ?? 0]"
                :min="EQ_GAIN_MIN"
                :max="EQ_GAIN_MAX"
                :step="1"
                @update:model-value="(v: number[]) => playerStore.setBandGain(i, v[0] ?? 0)"
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
            @update:model-value="(v: number[]) => playerStore.setPlaybackRate(v[0] ?? 1)"
          />
          <span class="w-14 text-right text-sm tabular-nums">
            {{ playbackRate.toFixed(2) }}x
          </span>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <span class="text-sm">保持音高</span>
          <Switch
            :model-value="preservesPitch"
            @update:model-value="playerStore.setPreservesPitch"
          />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
```

> **提示**：`Slider` 的 `modelValue` 是 `number[]` 而非 `number` —— 组件内部靠 `v-for="(_, key) in modelValue"` 渲染 thumb，传单个数字会崩。单值滑块也必须包成数组。统一用 `:model-value` + `@update:model-value` 而非 `v-model`，是为了显式走 store 的 action。

- [ ] **Step 2: Footer 加音效按钮**

> ⚠️ **行号可能已经漂移**：Task 1 也改了 `TheFooter.vue`。本步骤及其后给出的行号是**改动前**的行号。**请按代码片段定位，不要按行号跳转。**

打开 `src/components/layout/TheFooter.vue`。

第 4 行的图标 import：

```typescript
import { FastForward, Pause, Play, Rewind, ListMusic, Maximize2 } from 'lucide-vue-next'
```

改为（追加 `SlidersHorizontal`）：

```typescript
import { FastForward, Pause, Play, Rewind, ListMusic, Maximize2, SlidersHorizontal } from 'lucide-vue-next'
```

第 11 行的组件 import 之后新增：

```typescript
import AudioEffectDialog from '@/components/common/AudioEffectDialog.vue'
```

`isPlaylistOpen` 声明之后新增：

```typescript
const isEffectOpen = ref(false)
```

- [ ] **Step 3: Footer 模板插入按钮**

在 `.volume-section` 内、**第一个** `BouncingIconButton`（喇叭图标，第 111 行起）之前插入：

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

- [ ] **Step 4: 挂载对话框**

在 `<Teleport to="body">` 区块内、现有 `PlaylistPanel` 的 `</Transition>` 之后（第 195 行附近）插入：

```vue
      <AudioEffectDialog v-model:open="isEffectOpen" />
```

- [ ] **Step 5: 类型检查**

```bash
pnpm type-check 2>&1 | grep -E "^src/.*error TS" | sort > /tmp/now.txt
diff .superpowers/sdd/typecheck-baseline.txt /tmp/now.txt
```

Expected: `diff` **无输出**。

- [ ] **Step 6: 手动验证（需用户启动 `pnpm dev`）**

1. 播放一首歌 → footer 音量条左侧出现音效图标 → 点击 → 弹出**居中**的毛玻璃对话框。
   - 若对话框跑到屏幕左上角，说明 `absolute!` 丢了。
2. 依次点各预设 → 听感明显变化；"低音增强"低音变厚，"人声"中频突出。
3. 切回「原声」→ 回到未处理的声音。
4. 手动拖某一频段的竖向滑块 → **预设按钮全部取消高亮**（`eqPresetId` 被置空）→ 数值标签同步变化。
5. 竖向滑块的填充是**红色** `#fa233b`，不是灰黑（验证 `--primary` 覆盖生效）。
6. 0 dB 参考线在滑块正中间 —— 拖到中间时数值应显示 `0.0`。
7. 变速滑块拖到 2.0x → 关掉「保持音高」→ 声音变快且变尖（花栗鼠）；打开 → 变快但音高不变。开关本身也是红色。
8. **换下一首 → 倍速仍在**。
9. 刷新页面 → 全部设置保持。
10. 关闭对话框（右上角 ✕ 或 Esc）→ 播放不受影响。
11. 亮色 / 暗色主题下对话框都清晰可读。

- [ ] **Step 7: 请求批准并提交**

**先向用户请求批准**，获准后执行：

```bash
git add src/components/common/AudioEffectDialog.vue src/components/layout/TheFooter.vue
git commit -m "feat(AudioEffect): 音效设置对话框 + Footer 入口按钮"
```

---

### Task 5: 音调（变调）滑块 —— 速度不变，只挪音高

**追加需求（用户在 Task 4 完成后提出）。**

**Files:**
- Create: `src/core/player/pitchShifterProcessor.js`
- Modify: `src/constants/audioEffects.ts`
- Modify: `src/core/player/MusicController.ts`
- Modify: `src/stores/playerStore.ts`
- Modify: `src/components/common/AudioEffectDialog.vue`

**Interfaces:**
- Consumes: Task 2 的 `ensureGraph()` / 滤波器链；Task 3 的 store 结构；Task 4 的对话框
- Produces: `PITCH_MIN` / `PITCH_MAX` / `PITCH_DEFAULT` 常量；`MusicController.setPitchSemitones(semitones: number): void`；store 的 `pitchSemitones: Ref<number>` 与 `setPitchSemitones(semitones: number): void`

**⚠️ 本节已于 2026-09-19 修订（用户实测反馈驱动）。**

**初版方案及其失败：** 最初用自写的颗粒式 AudioWorklet（双读头 Hann 窗交叉淡化）。用户实测报告两个问题：

1. **音调回到 0 后出现「电音／金属感」** —— `ratio = 1` 时 `phaseStep` 恒为 0，相位冻结，两个读头退化成两个固定延迟抽头、按常数增益相加，即**梳状滤波器**。（初版修法是 `pitch === 0` 时整体直通。）
2. **音调非 0 时出现「搓衣板」般的粗糙感** —— 颗粒边界处两个读头读到的是**不相关**的波形，Hann 窗只能平滑**振幅**、管不了**相位**，交叉区叠加产生周期性起伏。这是朴素颗粒法的固有短板，**只能靠 WSOLA 根治**。

**现方案：`@soundtouchjs/audio-worklet`**（SoundTouch 的 AudioWorklet 移植，即 WSOLA 算法；Olli Parviainen 的 SoundTouch 是 sox / Foobar2000 等使用多年的成熟实现）。选择换库而不是继续盲调自写 DSP 的理由：**Agent 无法试听**，手写实时 DSP 每改一版都需要人工听感验收一次，迭代成本远高于引入一个成熟依赖。

自写版本已备份至 `.superpowers/sdd/pitchShifterProcessor.handrolled.bak.js`（该目录被 gitignore），并从 `src/` 移除。

**为什么仍然必须懒插入：** `ensureGraph()` 要保持**同步**（自动播放的手势约束），而 `SoundTouchNode.register()` 是**异步**的。更关键的是 —— **SoundTouch 即使在 0 半音下也有 50–125ms 的内部 WSOLA 缓冲延迟**，若常驻链路会让音频与进度条 / 歌词整体错位。因此：

- **音调 = 0 → 节点不在链路里**，逐样本与原声一致，零延迟
- **音调 ≠ 0 → 插入节点**并设 `pitchSemitones`

**已知遗留：** 音调 ≠ 0 时存在 50–125ms 延迟，歌词可能略有错位。这是 WSOLA 换取音质的固有代价，如需缓解可后续调 `setStretchParameters({ sequenceMs: ... })`（降低延迟会牺牲音质）。

- [ ] **Step 1: 改用 `@soundtouchjs/audio-worklet`（自写 worklet 已废弃）**

**本步已修订：不再新建 `src/core/player/pitchShifterProcessor.js`。** 改为安装依赖：

```bash
pnpm add @soundtouchjs/audio-worklet
```

该包 `exports` 提供两个入口：

| 入口 | 用途 |
| --- | --- |
| `@soundtouchjs/audio-worklet` | 导出 `SoundTouchNode`（继承 `AudioWorkletNode`） |
| `@soundtouchjs/audio-worklet/processor` | worklet 处理器脚本，73 KB —— 远超 Vite 4 KB 内联阈值，会作为独立资源产出 |

`SoundTouchNode` 的 API（节选）：

```typescript
static register(context: BaseAudioContext, processorUrl: string | URL): Promise<void>
constructor({ context, outputChannelCount }: { context: BaseAudioContext, outputChannelCount?: 1 | 2 })
get pitch(): AudioParam              // 倍率，1.0 = 原调
get pitchSemitones(): AudioParam     // 半音，-24 ~ 24
get playbackRate(): AudioParam       // 源的倍速镜像（本任务恒为 1，见下）
setStretchParameters(params): void   // WSOLA 时序，本任务用默认值
```

> ⚠️ **以下初版自写 worklet 代码已废弃 —— 仅留作记录与对照，不要实现。** 其备份在 `.superpowers/sdd/pitchShifterProcessor.handrolled.bak.js`。保留原因：它记录了「朴素颗粒法为何失败」，对后续调优有参考价值。

```javascript
// 颗粒式变调器：双读头交叉淡化。
//
// 原理：读指针相对写指针以 ratio = 2^(semitones/12) 的速度移动，
// 两个读头相位相差半周期、各用 Hann 窗加权 —— Hann 窗相差半周期时和恒为 1，
// 因此两个读头拼接处无缝隙。
//
// 读指针相对写指针的速度 = 1 - d(delay)/dsample，
// 取 delay = GRAIN_SIZE * (1 - phase) 时该式化为 ratio，故相位推进步长为
// phaseStep = (ratio - 1) / GRAIN_SIZE。

const BUFFER_SIZE = 8192
const GRAIN_SIZE = 2048

class PitchShifterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'pitch',
        defaultValue: 0,
        minValue: -12,
        maxValue: 12,
        automationRate: 'k-rate',
      },
    ]
  }

  constructor() {
    super()
    this.buffers = []
    this.writeIndex = 0
    this.phase = 0
  }

  _ensureChannels(count) {
    while (this.buffers.length < count) {
      this.buffers.push(new Float32Array(BUFFER_SIZE))
    }
  }

  _read(buffer, delay) {
    const pos = this.writeIndex - delay
    const wrapped = ((pos % BUFFER_SIZE) + BUFFER_SIZE) % BUFFER_SIZE
    const i0 = Math.floor(wrapped)
    const i1 = (i0 + 1) % BUFFER_SIZE
    const frac = wrapped - i0
    return buffer[i0] * (1 - frac) + buffer[i1] * frac
  }

  process(inputs, outputs, params) {
    const input = inputs[0]
    const output = outputs[0]

    // 无输入（暂停 / 播放结束）时保持节点存活，输出缓冲保持静音
    if (!input || input.length === 0) return true

    this._ensureChannels(input.length)

    const frames = output[0].length
    const ratio = Math.pow(2, params.pitch[0] / 12)
    const phaseStep = (ratio - 1) / GRAIN_SIZE

    for (let i = 0; i < frames; i++) {
      for (let c = 0; c < input.length; c++) {
        this.buffers[c][this.writeIndex] = input[c][i]
      }

      const phaseA = this.phase
      const phaseB = (this.phase + 0.5) % 1
      const gainA = 0.5 * (1 - Math.cos(2 * Math.PI * phaseA))
      const gainB = 0.5 * (1 - Math.cos(2 * Math.PI * phaseB))

      for (let c = 0; c < output.length; c++) {
        const buffer = this.buffers[c] || this.buffers[0]
        output[c][i] =
          gainA * this._read(buffer, GRAIN_SIZE * (1 - phaseA)) +
          gainB * this._read(buffer, GRAIN_SIZE * (1 - phaseB))
      }

      this.writeIndex = (this.writeIndex + 1) % BUFFER_SIZE
      this.phase += phaseStep
      // 环绕回 [0, 1)：phaseStep 为负时 Math.floor 同样正确
      this.phase -= Math.floor(this.phase)
    }

    return true
  }
}

registerProcessor('pitch-shifter', PitchShifterProcessor)
```

- [ ] **Step 2: 常量**

在 `src/constants/audioEffects.ts` 末尾追加：

```typescript
export const PITCH_MIN = -12
export const PITCH_MAX = 12
export const PITCH_DEFAULT = 0
```

- [ ] **Step 3: MusicController 接入**

在 `MusicController.ts` 顶部 import 区追加：

```typescript
import { SoundTouchNode } from '@soundtouchjs/audio-worklet'
// ?url 让 Vite 输出 worklet 脚本的原样 URL，不做模块转换
import soundTouchProcessorUrl from '@soundtouchjs/audio-worklet/processor?url'
```

同时**删除**原来的 `import pitchShifterUrl from './pitchShifterProcessor.js?url'`。

在类内字段区追加：

```typescript
  private pitchNode: SoundTouchNode | null = null
  private pitchReady = false
  private pitchSemitones = 0
```

在 `ensureGraph()` 的 `node.connect(this.ctx.destination)` **之后**追加（把 worklet 模块注册提前预热；失败只降级，不影响播放）：

```typescript
      this.loadPitchWorklet()
```

在类内新增三个私有方法：

```typescript
  /** 预热 SoundTouch worklet 模块。失败只降级为「无变调」，不影响播放。 */
  private loadPitchWorklet() {
    if (!this.ctx || this.pitchReady) return
    SoundTouchNode.register(this.ctx, soundTouchProcessorUrl)
      .then(() => {
        this.pitchReady = true
        // 若此时已有非 0 音调（例如从 localStorage 恢复），立即补插节点
        if (this.pitchSemitones !== 0) this.attachPitchNode()
      })
      .catch((err) => {
        console.warn('[MusicController] 变调 worklet 注册失败，音调调节不可用:', err)
      })
  }

  /**
   * 把链路改接为 ...filters → pitchNode → destination。
   *
   * 懒插入不只是省资源 —— SoundTouch 即使在 0 半音下也有 50–125ms 的
   * WSOLA 内部缓冲延迟，常驻链路会让音频与进度条 / 歌词整体错位。
   */
  private attachPitchNode() {
    if (this.pitchNode || !this.ctx || !this.pitchReady) return
    const tail = this.filters[this.filters.length - 1]
    if (!tail) return
    try {
      const node = new SoundTouchNode({ context: this.ctx, outputChannelCount: 2 })
      node.pitchSemitones.value = this.pitchSemitones
      tail.disconnect()
      tail.connect(node)
      node.connect(this.ctx.destination)
      this.pitchNode = node
    } catch (err) {
      console.warn('[MusicController] 变调节点插入失败，音调调节不可用:', err)
      this.pitchNode = null
      // 插节点中途失败会让 tail 处于「已 disconnect 但未接回」的状态 —— 必须恢复，
      // 否则整条链路断掉、直接没声音。
      try {
        tail.disconnect()
      } catch {
        /* tail 可能已断开，忽略 */
      }
      tail.connect(this.ctx.destination)
    }
  }

  /** 把节点摘出链路，恢复为 ...filters → destination（0 音调下逐样本与原声一致）。 */
  private detachPitchNode() {
    if (!this.pitchNode || !this.ctx) return
    const tail = this.filters[this.filters.length - 1]
    try {
      this.pitchNode.disconnect()
      this.pitchNode = null
      if (tail) {
        tail.disconnect()
        tail.connect(this.ctx.destination)
      }
    } catch (err) {
      console.warn('[MusicController] 变调节点移除失败:', err)
    }
  }
```

在 `setPreservesPitch` 之后新增公开方法：

```typescript
  setPitchSemitones(semitones: number) {
    this.pitchSemitones = semitones
    if (semitones === 0) {
      // 必须整体摘掉节点，而不是把参数设成 0：
      // SoundTouch 在 0 半音下仍有 50–125ms 的 WSOLA 缓冲延迟，留在链路里
      // 会让音频与进度条 / 歌词错位。摘掉才能保证 0 音调下逐样本与原声一致。
      this.detachPitchNode()
      return
    }
    this.attachPitchNode()
    this.pitchNode?.pitchSemitones.setValueAtTime(semitones, this.ctx!.currentTime)
  }
```

> ⚠️ `attachPitchNode()` / `detachPitchNode()` 都会 `tail.disconnect()` 再重新接线，造成一次极短的不连续。因为只在音调跨过 0 时发生、且此时用户刚刚操作滑块，可接受 —— 这是「0 音调零延迟」换来的代价。
>
> ⚠️ **`attachPitchNode()` 的 catch 分支必须把 `tail` 接回 `destination`。** `tail.disconnect()` 已执行而 `tail.connect(node)` 抛错时，链路会断掉、**整个播放哑掉且不报错**。这是本任务唯一能让播放全哑的路径，务必保留该恢复逻辑。

- [ ] **Step 4: store 状态与 action**

`src/stores/playerStore.ts`：

1. import 追加 `PITCH_MIN` / `PITCH_MAX` / `PITCH_DEFAULT`
2. 状态区追加：

```typescript
  const pitchSemitones = ref<number>(PITCH_DEFAULT);
```

3. `persistSettings` 的对象里追加 `pitchSemitones: pitchSemitones.value,`
4. `loadSettings` 里追加校验（放在 `preservesPitch` 之后）：

```typescript
      if (
        typeof s.pitchSemitones === 'number' &&
        s.pitchSemitones >= PITCH_MIN &&
        s.pitchSemitones <= PITCH_MAX
      ) {
        pitchSemitones.value = s.pitchSemitones;
      }
```

5. `init()` 里追加 `player.setPitchSemitones(pitchSemitones.value);`
6. `watchDebounced` 的 getter 里追加 `pitchSemitones: pitchSemitones.value,`
7. 音效 action 区追加：

```typescript
  const setPitchSemitones = (semitones: number) => {
    const clamped = Math.max(PITCH_MIN, Math.min(PITCH_MAX, semitones));
    pitchSemitones.value = clamped;
    player.setPitchSemitones(clamped);
  };
```

8. `return { ... }` 的状态区与 action 区分别追加 `pitchSemitones,` 与 `setPitchSemitones,`

> ⚠️ 持久化字段从 5 个变 6 个。`persistSettings` / `loadSettings` / `watchDebounced` getter **三处都要改**，漏掉 getter 会导致该字段静默不持久化。

- [ ] **Step 5: 对话框加音调滑块**

`src/components/common/AudioEffectDialog.vue`：

1. import 追加 `PITCH_MIN` / `PITCH_MAX`
2. `storeToRefs` 解构追加 `pitchSemitones`
3. 在「变速」区块**之后**、`</DialogContent>` 之前插入：

```vue
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
            @update:model-value="(v: number[] | undefined) => playerStore.setPitchSemitones(v?.[0] ?? 0)"
          />
          <span class="w-14 text-right text-sm tabular-nums">
            {{ pitchSemitones > 0 ? '+' : '' }}{{ pitchSemitones }}
          </span>
        </div>
      </div>
```

> `@update:model-value` 的载荷类型必须是 `number[] | undefined` —— reka-ui 的 `SliderRootEmits` 就是可空的，写成 `number[]` 会报 TS2322。

- [ ] **Step 6: 类型检查**

```bash
pnpm type-check 2>&1 | grep -E "^src/.*error TS" | sort > /tmp/now.txt
diff .superpowers/sdd/typecheck-baseline.txt /tmp/now.txt
```

Expected: `diff` **无输出**。

- [ ] **Step 7: 手动验证（需用户启动 `pnpm dev`）**

1. 播放一首歌 → 打开音效对话框 → 把「音调（不改变速度）」拖到 `+4`。
   - 预期：**音高升高，但速度完全不变**。这是与变速滑块最本质的区别。
2. 拖回 `0` → 恢复原声。
3. 拖到 `-4` → 音高降低、速度不变。
4. 速度保持 `1.00x`，分别配合音调 `+4` / `-4` —— 两者互不干扰。
5. 刷新页面 → 音调恢复。
6. Console 无红色报错。（若出现 `[MusicController] 变调 worklet 加载失败`，说明 `?url` 的 worklet 路径在 Vite 下没走通，停下来排查。）
7. **全程不要碰音调滑块** → 听感应与改动前完全一致，且 Console 里不应出现任何 worklet 相关日志（验证懒插入没引入额外节点）。

---

### Task 6: 全量构建校验 + 更新 CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: Task 1–5 的全部改动
- Produces: 无代码接口

- [ ] **Step 1: 全量构建**

⚠️ **不要跑 `pnpm build`** —— 它经 `run-p` 并行触发 `vue-tsc`，会因 25 个既存错误必然失败，与本计划无关。跑真正的打包步骤：

```bash
pnpm build-only
```

Expected: `vite build` 成功产出（`✓ built in ...`），无错误。

若 `build-only` 失败，把完整输出贴给用户，**不要**自行改代码绕过。

再跑一次基线比对，确认没有新增类型错误：

```bash
pnpm type-check 2>&1 | grep -E "^src/.*error TS" | sort > /tmp/now.txt
diff .superpowers/sdd/typecheck-baseline.txt /tmp/now.txt
```

Expected: `diff` **无输出**。

- [ ] **Step 2: 更新 CLAUDE.md 的 `src/` 结构树**

在 `## 项目结构` 的目录树中：

- `constants/` 一节追加一行：
  ```
  │   ├── audioEffects.ts             # EQ 频段定义 + 预设曲线 + 变速范围
  ```
- `core/player/` 一节，把 `MusicController.ts` 的说明改为：
  ```
  │   ├── MusicController.ts           # HTML5 Audio + MediaSession + Web Audio 音频图（EQ）
  ```
- `components/common/` 追加一行 `AudioEffectDialog.vue`（音效设置对话框）。
- `src/components/ui/` 的组件列表追加 `slider`、`switch`。

- [ ] **Step 3: 删除失效的「已知问题 #4」**

`## ⚠️ 已知问题` 中的第 4 条整段删除：

```
### 4. `core/player/player.ts` import 大小写
...
```

**理由**：`src/core/player/player.ts` **这个文件根本不存在**。真实单例在 `stores/playerStore.ts:7` 的 `const player = new MusicController()`，且导入路径大小写正确（`@/core/player/MusicController`）。该条目描述的 bug 已不复存在。

删除后，把原第 5、6 条重新编号为 4、5。

- [ ] **Step 4: 修正过期的样式文件路径**

CLAUDE.md 中所有 `src/style.css` 与 `src/styles/dark-mode.css` 的引用都已失效 —— 这两个文件不存在了。现行结构是 `src/styles/` 下的：

```
tokens.css      # 设计令牌（含 shadcn oklch 调色板 --primary 等，及 --primary-color: #e74c3c）
glass.css       # 毛玻璃类（.glass / .glass-container / .glass-card / .glass-effect / .glass-component）
base.css / buttons.css / animations.css / utilities.css / index.css
```

在 `## 主题系统` 章节开头补一段说明当前文件结构，并保留原有关于"`oklch` 仅在 tokens.css、其余用 hex/rgba"的告诫。

**同时新增一条告诫**：

> ⚠️ `.glass-container` / `.glass-card` / `.glass-effect` 在 `glass.css` 中声明了 `position: relative`（无 `!important`），会覆盖 Tailwind 的同特异度工具类（如 `fixed`）。任何需要脱离文档流的毛玻璃容器，必须显式写 `absolute!` / `fixed!`。

- [ ] **Step 5: 补充音效功能说明**

在 `## 特色功能` 章节新增一节：

```markdown
### 音效调整 (`components/common/AudioEffectDialog.vue`)

- **EQ 预设**：5 段（60 / 230 / 910 / 3.6k / 14k Hz），预设曲线定义在 `constants/audioEffects.ts`
- **变速**：0.5x–2.0x + 「保持音高」开关（`preservesPitch`）
- **音频图**：`MusicController.ensureGraph()` 懒建于首次 `play()`，链路为
  `MediaElementSource → BiquadFilter ×5 → destination`
- **持久化**：`localStorage['player_settings']`（含 volume / eqPresetId / eqGains / playbackRate / preservesPitch）

⚠️ **两条约束**：
1. `ensureGraph()` 只能在 `play()` 中**同步**调用，不可 `await` —— 自动播放策略要求 `audio.play()`
   落在用户手势的同步路径上，否则首次播放无声。
2. `setPlaybackRate()` 必须**同时**写 `audio.defaultPlaybackRate` 与 `audio.playbackRate` ——
   媒体加载算法会把后者重置为前者，只写一个会导致换歌后倍速丢失。
```

- [ ] **Step 6: 提交**

**先向用户请求批准**，获准后执行：

```bash
git add CLAUDE.md
git commit -m "docs: 更新 CLAUDE.md（音效功能、glass position 陷阱、清理失效条目）"
```

---

## 完成标准

全部 5 个任务完成后，应满足：

- [ ] `pnpm build-only` 成功；`pnpm type-check` 相对基线（25 条既存错误）**无新增错误**，且本计划涉及的文件一个都不出现在错误清单里
- [ ] 不播放任何歌时，footer 音量条显示 **50%**（与真实音量一致）
- [ ] 首次播放有声（音频图接线正确）
- [ ] 不碰音效时听感与改动前完全一致（全 0 dB 透传）
- [ ] 5 个预设听感可分辨，切回「原声」可还原
- [ ] 手动拖动频段后预设高亮取消
- [ ] 2.0x 换歌后倍速仍在
- [ ] 刷新页面后全部设置保持
- [ ] 全屏播放器、歌词背景动画不受影响
