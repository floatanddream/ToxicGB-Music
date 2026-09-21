# 当前播放列表持久化 — 设计文档

- 日期：2026-09-21
- 状态：设计已批准（本文档待复核）
- 分支：developing

## 背景与目标

当前播放列表只活在内存里：`playerStore` 的 `playlist` / `currentIndex` / `mode` / `randomQueue` 全是 `ref`，刷新即清零。用户听歌时误触 F5，队列和「上次在听哪首」一起丢失。

目标：刷新后恢复**队列本身**与**播到第几首**，让用户能接着听。

## 已确认的需求决策

| 问题 | 决定 |
| --- | --- |
| 刷新后自动续播？ | **否**。恢复为「暂停在原位」，用户点 ▶ 继续 |
| 播放进度？ | **不持久化**，一律从 0:00 开始 |
| 队列里的歌存什么？ | **完整元数据，剔除 `url`** |
| 随机队列的洗牌顺序？ | **存**，刷新后「上一首 / 下一首」接得上原来的序列 |
| 全屏播放器开关？ | **不存**，刷新一律回主界面 |
| 持久化逻辑放哪？ | **`playerStore`**，与现有 `persistSettings` / `loadSettings` 并列 |

自动续播被否掉，同时绕开了一个已知陷阱：无用户手势时 `MusicController.play()` 里的 `ensureGraph()` 会建出 `suspended` 状态的 `AudioContext`，症状是「UI 显示在播放但没声音、不报错」（`CLAUDE.md` 已记录）。不自动播放就不会踩。

## 不做（明确排除）

- 不新增「清空播放列表」入口，不加持久化开关（YAGNI）
- 不动 `player_settings`（音量 / EQ / 变速 / 变调）—— 两个 key 完全独立
- 不给 `<audio>` 补 `error` 监听（`CLAUDE.md` 已记录的存量缺口，独立需求）
- 不做多标签页同步（见「已知限制」）

## 数据结构

新开一个 key **`player_queue`**，不复用 `player_settings` —— 两件事不该互相拖累，一份队列数据损坏不应把音量 / EQ 一起带走。

```jsonc
{
  "v": 1,                                 // 结构版本号
  "playlist": [ /* Song 全字段，剔除 url */ ],
  "currentIndex": 12,
  "mode": "loop",
  "randomQueue": ["id1", "id2", "..."],
  "randomIndex": 3
}
```

三个刻意的选择：

- **不存 `currentSong`**，恢复时由 `playlist[currentIndex]` 推出。两份真相会不一致，一份不会。
- **不存 `url`**。`Song.url` 是带时效的 CDN 直链，`MusicService.getSong()` 的职责就是「HEAD 探活 → 失效则重新 `/song/url/v1`」；存了它，刷新后 `audio.src` 会指向过期直链，症状是「点播放没反应」。且 `MusicService` 内的 `cache` 是模块级 `Map`，刷新即清空。
- **不存 `currentTime` / `isFullScreen`**（见需求决策表）。

`v` 的作用与 `loadSettings` 里 `eqGains.length !== EQ_BANDS.length` 一致：结构一变，旧数据**整体拒收**，而不是部分字段悄悄错位。

`mode === 'random'` 之外 `randomQueue` 无意义，但仍然照存 —— 用户可能在随机模式下刷新，也可能切回顺序后又切回随机。多存几十字节换掉一个特判分支。

## 写入时机

一个 `watchDebounced` 快照 watcher，`debounce: 300`，与现有 `persistSettings` 完全同款：

```ts
watchDebounced(
  () => ({
    playlist: [...playlist.value],      // 展开以逐项读，跟踪增删与整表替换
    currentIndex: currentIndex.value,
    mode: mode.value,
    randomQueue: [...randomQueue.value],
    randomIndex: randomIndex.value,
  }),
  persistQueue,
  { debounce: 300 },
)
```

因为进度不存了，写入点只剩「换歌 / 换队列 / 换模式」这类低频事件，**不需要 `beforeunload` 兜底**，也不需要给 `timeupdate` 做节流。

副作用：`preloadNextSong()` 会给队列里的歌补 `url`（`playlist.value[i] = songWithUrl`），这会额外触发一次 watcher。代价是一次冗余写入（序列化时本就会剔除 `url`），可接受。

## 恢复流程

挂进现有的 `playerStore.init()`（`main.ts` 中在 `app.mount()` 之前调用），分同步、异步两段。

### 同步段：恢复状态，界面立即到位

读出快照，校验通过后直接落 `playlist` / `currentIndex` / `mode` / `randomQueue` / `randomIndex`。

这一步落地后，`PlaylistPanel`（`playerStore.playlist`）、`TheFooter`（`currentSong` / `mode`）、`LayoutContainer`（歌词背景取 `currentSong.cover`）、`Menu`（右键菜单取 `currentSong`）全部自动跟上，**不需要通知任何人**。

**一个会连带触发的副作用**：`playerStore` 里已有 `watch(currentIndex, () => preloadNextSong())`。写 `currentIndex` 会激活它，于是刷新时会额外预取「接下来 2 首」。这是现有行为（每次换歌都会做），本次不特意规避 —— 恢复后紧接着播放的概率很高，预取这几首本来就要用。后果见下方「已知代价」。

### 异步段：预先把当前曲装进 `<audio>`

`MusicController.play()` **必须保持同步** —— 自动播放策略要求 `audio.play()` 落在用户手势的同步路径上，一旦 `await` 就掉进微任务、手势令牌可能失效（`play()` 里已有注释说明）。所以不能等用户点 ▶ 时才去解析 URL，必须提前装载。

```ts
const restoreQueueCurrentSong = async () => {
  const song = currentSong.value
  if (song === null) return
  const restoredId = song.id
  try {
    const fullSong = await getSong(song)
    if (currentSong.value?.id !== restoredId) return   // 用户在 await 期间换了歌 → 放弃
    playlist.value[currentIndex.value] = fullSong
    currentSong.value = fullSong
    player.loadSong(fullSong)                          // 只 load，不 play
  } catch (err) {
    if (currentSong.value?.id === restoredId) currentSong.value = null
    console.warn('[playerStore] 恢复上次的歌曲失败，队列已保留:', err)
  }
}
```

为此给 `MusicController` 加一个公开方法 `loadSong(song)`（3 行）：现有 `load()` 是 private，`playSong()` 是 `load + play`，缺一个「只装弹不开枪」的档位。改完 `playSong(song) { this.loadSong(song); this.play() }`，行为不变。

**预加载是刻意的**，不只是为了「点了就有声」：它同时把 `MusicService` 的 `cache` 填上，用户点 ▶ 时 `getSong()` 直接命中缓存，不会再有等待。

**已知代价**：刷新后即使用户不点播放，浏览器也会开始拉音频流 —— 当前曲（异步段）加上 `preloadNextSong()` 预取的接下来 2 首，共 3 首。

### 竞态保护

异步段在 `await` 前后校验 `currentSong.id` 未变。没有这一行，用户在恢复的 ~200ms 窗口内点了另一首歌，会被迟到的恢复结果覆盖掉。

## 错误处理与边界

沿用 `loadSettings` 立下的原则 —— **一条坏数据不许把播放器搞挂**。因此「校验不过就整体拒收」，而不是部分过滤：

| 情况 | 处理 |
| --- | --- |
| JSON 解析失败 / `v` 不是 1 | 整体忽略，走空播放器 |
| `playlist` 不是数组 / 为空 / 有项缺 `id` | 整体忽略 |
| `currentIndex` 不是整数或越界 `[0, playlist.length)` | 整体忽略 |
| `mode` 不是 `'loop'` / `'single'` / `'random'` | 整体忽略 |
| `localStorage` 为空 | 什么都不做，与改动前一致 |
| `setItem` 抛 `QuotaExceededError` | `try/catch` + `console.warn` 一次，不重试 |

**为什么是整体拒收而不是过滤掉坏项**：过滤会让 `currentIndex` 静默错位到另一首歌上 —— 恢复出一个「看起来正常、其实播错歌」的状态，比什么都不恢复更难排查。这与 `loadSettings` 里 `eqGains` / `eqPresetId`「一起生效、一起放弃」是同一个理由。

**异步段 `getSong()` 失败时（VIP / 下架 / 网络抖动）**：**保留 `playlist`，把 `currentSong` 置 `null`** + `console.warn`。

不能留着 `currentSong` 不动 —— 那会得到一个界面显示着一首歌、`audio.src` 却是空的状态，用户点 ▶ **静默无反应**（连报错都没有，因为 `play()` 调的是一个没有源的 `<audio>`）。置 `null` 后 `currentIndex` 保留，`next()` / `prev()` 仍从这个位置往后走，队列面板也还在，用户自己点一首即可恢复。**不加 toast**，与项目现有播放失败的风格保持一致。

不清除已写入的快照 —— watcher 只跟踪队列 / 索引 / 模式，这几项在失败路径上都没变，所以不会触发重写。下次刷新还会再试一次，网络抖动这类瞬时失败能自愈。

## 验收清单

1. 「播放全部」放几首 → 刷新 → 队列面板还是那些歌、底部还是那一首、mode 不变、显示 0:00 且**暂停**
2. 随机模式下刷新 → 随机顺序与刷新前一致；点「下一首」接的是原来的洗牌序列，不是重洗的
3. 恢复后点 ▶ → **正常出声**（证明 URL 重新解析成功）
4. 恢复后不点播放 → **不应有任何声音**
5. 刷新后看 `localStorage.player_queue` → **不含 `url` 字段**
6. 手工把 `player_queue` 改成非法 JSON → 刷新不报错，播放器是空的
7. 清掉 `localStorage.player_queue` → 刷新后行为与改动前完全一致

## 涉及文件

| 文件 | 改动 |
| --- | --- |
| `src/stores/playerStore.ts` | 新增 `persistQueue()` / `loadQueue()` / 异步恢复段 / 一个 watcher（约 +55 行） |
| `src/core/player/MusicController.ts` | 新增公开方法 `loadSong(song)`，`playSong()` 改为调用它（约 +3 行） |

## 已知限制

1. **多标签页**：两个标签页同时开着，后写的覆盖先写的；先开的那个不会感知（不监听 `storage` 事件）。
2. **300ms 写入窗口**：`debounce: 300` 意味着「换队列后 300ms 内刷新」会丢掉这次变更。为消除它需要加 `pagehide` 监听器，权衡后不做。
3. **配额**：按约 900B/首估算，5MB 可容纳约 5000 首，实际歌单到不了，故不做截断降级。
