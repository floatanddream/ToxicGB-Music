# 当前播放列表持久化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 刷新页面后恢复当前播放队列与「播到第几首」，暂停在原位，用户点 ▶ 继续。

**Architecture:** 在 `playerStore` 里加一份「队列快照」持久化，与现有的 `persistSettings` / `loadSettings` 并列，新开 `localStorage` key `player_queue`。写入用一个 `watchDebounced` 快照 watcher；读取挂在 `init()` 里，同步恢复状态、异步预装当前曲。

**Tech Stack:** Vue 3 `<script setup lang="ts">` / Pinia（Composition API store）/ TypeScript / `@vueuse/core` 的 `watchDebounced`。

---

## Global Constraints

- **本仓库没有测试基建**（`package.json` 的 `scripts` 只有 `dev`/`devHost`/`build`/`preview`/`build-only`/`type-check`/`format`，`devDependencies` 里没有 vitest / jest / cypress / playwright）。**不要新增测试框架** —— 那属于扩大范围。每个任务的验证 = `pnpm type-check`（对比基线）+ 用户在浏览器里手工验。
- **禁止启动任何服务实例**（前端 / 后端 / 小程序），只能由人类完成。计划里**不要**出现 `pnpm dev` 之类的命令；浏览器验证步骤一律写成交给用户的指令。
- **提交需要用户明确批准**。本计划里每个任务的「提交」步骤都是**请求**，不是自动执行。
- **`pnpm type-check` 有 25 条既存错误**（基线见 `.superpowers/sdd/typecheck-baseline.txt`），全部与本次改动无关。验收标准是「**不新增**错误」，不是「零错误」。
- **不要改拼写错误**：`SCROOL_TOP`、`TOAST_SUSSESS`、`extractLeagcyLyrics` 在代码库里刻意沿用。
- 提交信息格式：`type(scope): 中文简述`，正文中文，结尾加 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`。
- `tsconfig` 关键项：`strict: true`、`noUncheckedIndexedAccess: true`、`exactOptionalPropertyTypes` **关闭**。

---

## Task 1: 写入侧 —— 把队列快照写进 localStorage

这一任务只写不读。做完之后刷新页面队列仍然会丢（Task 2 才接恢复），但 `localStorage.player_queue` 里能看到正确的快照，这是一个独立可验的交付物。

**Files:**
- Modify: `src/stores/playerStore.ts`（插入 key 常量 + `persistQueue()`，约在 line 117 `loadSettings` 结束后；挂 watcher 约在 line 464）

**Interfaces:**
- Consumes: store 内已有的 `playlist` / `currentIndex` / `mode` / `randomQueue` / `randomIndex` 五个 ref，以及已 import 的 `watchDebounced`
- Produces: `QUEUE_KEY: 'player_queue'`、`QUEUE_SCHEMA_VERSION: 1`、`persistQueue(): void` —— Task 2 的 `loadQueue()` 必须用同名常量读同一个 key

- [ ] **Step 1: 插入 key 常量与 `persistQueue()`**

在 `src/stores/playerStore.ts` 中，找到 `loadSettings` 函数的结束（`};`）与紧随其后的 `/* ---------------- 初始化 ---------------- */` 注释，**在两者之间**插入：

```ts
/* ---------------- 队列快照持久化 ---------------- */
const QUEUE_KEY = 'player_queue'
const QUEUE_SCHEMA_VERSION = 1

/**
 * 把当前队列写进 localStorage。
 *
 * 与 player_settings 分开存、分开校验：一份队列数据损坏不应把音量 / EQ 一起带走。
 *
 * url 必须剔除 —— Song.url 是带时效的 CDN 直链，存下来刷新后会指向过期地址
 * （症状：点音频没反应）。恢复时由 MusicService.getSong() 重新解析。
 * `url: undefined` 这个写法依赖 JSON.stringify 会直接丢掉值为 undefined 的键。
 */
const persistQueue = () => {
  try {
    localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify({
        v: QUEUE_SCHEMA_VERSION,
        playlist: playlist.value.map((song) => ({ ...song, url: undefined })),
        currentIndex: currentIndex.value,
        mode: mode.value,
        randomQueue: randomQueue.value,
        randomIndex: randomIndex.value,
      }),
    )
  } catch (err) {
    // 不影响播放，但必须留痕。这里与上面 persistSettings 的静默 catch 不同 ——
    // 「队列悄悄不再持久化」是查不出来的，而防抖已经把日志频率压到最低。
    console.warn('[playerStore] 队列快照写入失败，本次不持久化:', err)
  }
}
```

- [ ] **Step 2: 挂上 watcher**

在 `src/stores/playerStore.ts` 中，找到现有的 `watchDebounced(... persistSettings ...)` 调用（在 `watch(currentIndex, () => preloadNextSong())` 之后），**紧随其后**插入：

```ts
// 队列快照比播放设置变化少得多（换歌 / 换队列 / 换模式），但 preloadNextSong()
// 会给队列里的歌补 url，也会触发它 —— 300ms 的防抖正好把这类冗余写入吃掉。
watchDebounced(
  () => ({
    // 展开以逐项读，否则 playlist 内部的增删不会被追踪到
    playlist: [...playlist.value],
    currentIndex: currentIndex.value,
    mode: mode.value,
    randomQueue: [...randomQueue.value],
    randomIndex: randomIndex.value,
  }),
  persistQueue,
  { debounce: 300 },
)
```

- [ ] **Step 3: 类型检查**

Run:
```bash
pnpm type-check 2>&1 | grep -c "error TS"
```
Expected: `25`（与基线一致）

Run:
```bash
pnpm type-check 2>&1 | grep -E "playerStore|MusicController" || echo "OK: 无新增错误"
```
Expected: `OK: 无新增错误`

- [ ] **Step 4: 浏览器验证（交给用户执行）**

前提：队列为空时不会写入任何东西（快照初始为空数组也会写，属正常）。请用户：

1. 随便「播放全部」一个歌单，等 1 秒
2. F12 → Application → Local Storage → 找 `player_queue`
3. 确认：有 `v` / `playlist` / `currentIndex` / `mode` / `randomQueue` / `randomIndex` 六个字段；`playlist` 长度与歌单首数一致；`currentIndex` 是 0
4. **重点**：在 `playlist[0]` 里搜 `url` —— 应当**搜不到**该字段
5. 点「下一首」再等 1 秒 → `currentIndex` 应变成 1

- [ ] **Step 5: 请求提交**

```bash
git add src/stores/playerStore.ts
git commit -F - <<'EOF'
feat(playerStore): 队列快照写入 localStorage

按设计文档 2026-09-21-player-queue-persistence-design.md 的第一半：
只写不读，刷新后仍会丢队列，恢复在下一个提交接上。

- 新 key player_queue，与 player_settings 分开存、分开校验
- 快照剔除 url（带时效的 CDN 直链，存了会让刷新后的 audio.src 失效）
- watchDebounced 300ms，与 persistSettings 同款
EOF
```

**先取得用户批准再执行这一步。**

---

## Task 2: 读取侧 —— 恢复队列并在点 ▶ 前备好音源

**Files:**
- Modify: `src/core/player/MusicController.ts`（`playSong` 在 line 270-273）
- Modify: `src/stores/playerStore.ts`（`loadQueue` / `loadRestoredCurrentSong` 插在 `persistQueue` 之后；`init()` 在 line 120-155）

**Interfaces:**
- Consumes: Task 1 的 `QUEUE_KEY` / `QUEUE_SCHEMA_VERSION` / `persistQueue()`
- Produces: `MusicController.loadSong(song: Song): void`（公开方法，只装载不播放）、`playerStore.loadQueue(): void`、`playerStore.loadRestoredCurrentSong(): Promise<void>`

- [ ] **Step 1: `MusicController` 增加 `loadSong()`**

在 `src/core/player/MusicController.ts` 中，把现有的：

```ts
  playSong(song: Song) {
    this.load(song)
    this.play()
  }
```

替换为：

```ts
  /**
   * 只装载、不播放。
   *
   * 用途：刷新后把上次的歌曲预先灌进 <audio>，这样用户点 ▶ 时
   * MusicController.play() 不必变成 async —— 自动播放策略要求 audio.play()
   * 落在用户手势的同步路径上，而解析 URL 是异步的，塞不进那条路径。
   */
  loadSong(song: Song) {
    this.load(song)
  }

  playSong(song: Song) {
    this.loadSong(song)
    this.play()
  }
```

- [ ] **Step 2: `playerStore` 增加 `loadQueue()`**

在 `src/stores/playerStore.ts` 中，**紧随 Task 1 插入的 `persistQueue` 之后**插入：

```ts
/**
 * 从 localStorage 恢复队列快照。
 *
 * 校验不过就**整体放弃**，不做部分过滤 —— 过滤会让 currentIndex 静默错位到
 * 另一首歌上，得到一个「看起来正常、其实播错歌」的状态，比什么都不恢复更难
 * 排查。这与 loadSettings 里 eqGains / eqPresetId「一起生效、一起放弃」同源。
 */
const loadQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return

    const s = JSON.parse(raw)

    if (s?.v !== QUEUE_SCHEMA_VERSION) return

    const list = s.playlist
    if (!Array.isArray(list) || list.length === 0) return
    if (!list.every((item) => item && typeof item.id === 'string')) return
    if (!Number.isInteger(s.currentIndex) || s.currentIndex < 0 || s.currentIndex >= list.length) {
      return
    }
    if (s.mode !== 'loop' && s.mode !== 'single' && s.mode !== 'random') return

    playlist.value = list
    currentIndex.value = s.currentIndex
    currentSong.value = list[s.currentIndex] ?? null
    mode.value = s.mode
    randomQueue.value = Array.isArray(s.randomQueue) ? s.randomQueue : []
    randomIndex.value = Number.isInteger(s.randomIndex) ? s.randomIndex : 0
  } catch {
    // 坏 JSON / 旧版本结构 → 整体忽略，走空播放器
  }
}
```

- [ ] **Step 3: `playerStore` 增加 `loadRestoredCurrentSong()`**

**紧随 `loadQueue` 之后**插入：

```ts
/**
 * 把恢复出来的当前曲预先装进 <audio>（只 load 不 play）。
 *
 * 不能等用户点 ▶ 再去解析 URL：MusicController.play() 必须保持同步，
 * 而 getSong() 是异步的。提前装载顺带把 MusicService 的 cache 填上，
 * 用户点 ▶ 时直接命中缓存，不会有等待。
 */
const loadRestoredCurrentSong = async () => {
  const song = currentSong.value
  if (song === null) return

  const restoredId = song.id

  try {
    const fullSong = await getSong(song)

    // await 期间用户可能已经点了别的歌 → 放弃，不要用迟到的结果覆盖用户的操作
    if (currentSong.value?.id !== restoredId) return

    playlist.value[currentIndex.value] = fullSong
    currentSong.value = fullSong
    player.loadSong(fullSong)
  } catch (err) {
    // 恢复失败（VIP / 下架 / 网络抖动）：保留队列，但把 currentSong 置空。
    // 不能留着它 —— 界面显示着一首歌、audio.src 却是空的，用户点 ▶ 会静默无反应。
    // 不清快照：失败路径上 watcher 跟踪的几项都没变，不会触发重写，下次刷新会再试。
    if (currentSong.value?.id === restoredId) currentSong.value = null
    console.warn('[playerStore] 恢复上次的歌曲失败，队列已保留:', err)
  }
}
```

- [ ] **Step 4: 接进 `init()`**

在 `src/stores/playerStore.ts` 的 `init()` 中，做两处修改。

第一处 —— 在 `loadSettings()` 调用之后**紧接着**加一行：

```ts
  const init = () => {
    loadSettings()
    loadQueue() // 恢复上次的队列与当前曲（同步，界面立即到位）

    player.setVolume(volume.value)
```

第二处 —— 在 `init()` 的**末尾**（`player.on('ended', ...)` 注册之后、`}` 之前）加一行：

```ts
    player.on('ended', () => {
      handleEnded()
    })

    // 预装当前曲。不 await —— init() 保持同步，不能拖住 app.mount()
    void loadRestoredCurrentSong()
  }
```

- [ ] **Step 5: 类型检查**

Run:
```bash
pnpm type-check 2>&1 | grep -c "error TS"
```
Expected: `25`

Run:
```bash
pnpm type-check 2>&1 | grep -E "playerStore|MusicController" || echo "OK: 无新增错误"
```
Expected: `OK: 无新增错误`

- [ ] **Step 6: 浏览器验证（交给用户执行）**

请用户逐条过一遍设计文档的验收清单：

1. 「播放全部」放几首 → 刷新 → 队列面板还是那些歌、底部还是那一首、mode 不变、显示 0:00 且**暂停**
2. 随机模式下刷新 → 随机顺序与刷新前一致；点「下一首」接的是原来的洗牌序列
3. 恢复后点 ▶ → **正常出声**（证明 URL 重新解析成功）
4. 恢复后不点播放 → **不应有任何声音**
5. 刷新后看 `localStorage.player_queue` → **不含 `url` 字段**
6. 手工把 `player_queue` 改成非法 JSON → 刷新不报错，播放器是空的
7. 清掉 `localStorage.player_queue` → 刷新后行为与改动前完全一致
8. 回归：手动双击一首歌播放（不走恢复路径）→ 行为与改动前一致

- [ ] **Step 7: 请求提交**

```bash
git add src/core/player/MusicController.ts src/stores/playerStore.ts
git commit -F - <<'EOF'
feat(playerStore): 刷新后恢复播放队列

- MusicController 新增公开方法 loadSong()：只装载不播放。
  playSong() 改为调用它，行为不变。
- playerStore 新增 loadQueue()：读 player_queue，校验不过整体放弃
- playerStore 新增 loadRestoredCurrentSong()：异步预装当前曲，失败则
  保留队列并把 currentSong 置空（避免「界面有歌、点播放静默无反应」）
- init() 里同步恢复状态、末尾 void 触发预装
EOF
```

**先取得用户批准再执行这一步。**

---

## Task 3: 更新 CLAUDE.md

**用户确认浏览器验收通过之后**再做这一步。

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: Task 1 / Task 2 的实际实现
- Produces: 无代码产出

- [ ] **Step 1: 补 `MusicController` 的方法清单**

在 `CLAUDE.md` 的「播放器架构 → MusicController」小节里，找到 `**HTML5 Audio 封装**（`new Audio()`）：` 开头的那一行方法列表，把 `loadSong(song)` 加进去，并紧跟一句说明：

```markdown
> `loadSong(song)` 是「只装载不播放」的档位，`playSong(song)` = `loadSong + play`。
> 它存在的理由是 `play()` 必须保持同步（见下方四条约束的第 1 条），
> 而刷新后恢复队列时解析 URL 是异步的，只能提前装载。
```

- [ ] **Step 2: 补 playerStore 的持久化说明**

在 `CLAUDE.md` 的「播放器架构 → playerStore」小节里，「预加载」那句（`**预加载**：`watch(currentIndex, () => preloadNextSong())` 在 store 内注册。`）之后，插入：

```markdown
**持久化**：两个互不相干的 `localStorage` key ——
`player_settings`（音量 / EQ / 变速 / 变调）与 `player_queue`（队列快照）。
分开存、分开校验，一份坏了不牵连另一份。

`player_queue` 快照内容是 `{ v, playlist, currentIndex, mode, randomQueue, randomIndex }`：

- **剔除 `url`** —— CDN 直链带时效，存了刷新后会失效
- **不存 `currentTime`** —— 一律从 0:00 开始
- **不自动播放** —— 恢复为「暂停在原位」，从而绕开无手势时
  `ensureGraph()` 建出 `suspended` AudioContext 的已知陷阱
- 校验不过**整体放弃**，不做部分过滤（否则 `currentIndex` 会静默错位到别的歌）
```

- [ ] **Step 3: 记录两条已知限制**

在 `CLAUDE.md` 的「音效调整」小节末尾的「残留风险」列表之后，新增：

```markdown
### 队列持久化的已知限制

1. **多标签页不同步**：两个标签页同时开着，后写的覆盖先写的，先开的那个不会感知
   （不监听 `storage` 事件）。
2. **300ms 写入窗口**：`debounce: 300` 意味着「换队列后 300ms 内刷新」会丢掉这次
   变更。消除它需要加 `pagehide` 监听器，权衡后不做。
3. **刷新会预取 3 首**：当前曲（异步恢复）+ `preloadNextSong()` 预取的接下来 2 首。
```

- [ ] **Step 4: 请求提交**

```bash
git add CLAUDE.md
git commit -m "docs: 补充队列持久化说明与已知限制"
```

**先取得用户批准再执行这一步。**

---

## 验证方式说明（替代单元测试）

本仓库无测试基建，因此每个任务的验证由两部分组成：

| 手段 | 覆盖什么 | 谁执行 |
| --- | --- | --- |
| `pnpm type-check` 对比 25 条基线 | 类型层面无回归 | Agent |
| 设计文档的验收清单 | 运行时行为 | 用户（浏览器） |

计划中**没有**「运行测试套件」这类步骤，因为不存在可运行的测试套件。不新增测试框架的理由见 Global Constraints。
