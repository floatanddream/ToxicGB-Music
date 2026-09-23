# MV 背景（可开关）— 设计文档

- 日期：2026-09-23
- 状态：设计已批准（本文档待复核）
- 分支：developing
- 原始需求：`docs/prompt/20260923-song-mv-background.md`

## 背景与目标

当前全站背景是 `FullPageBackground.vue` 里的一个 90fps mesh 渐变（`@applemusic-like-lyrics`），固定播放、与歌曲无关。

目标：**歌曲有 MV 时，用 MV 当背景**（跟随歌曲播放/暂停/进度）；没有 MV 时回退流体背景。用一个设置开关控制，默认关闭。

## 前置发现（影响实现的既有事实）

### 1. `request.ts` 的 `afterResponse` hook 是死代码

ky **2.0** 把 `afterResponse` 的签名从 `(request, options, response, state)` 改成了单个对象 `({ request, options, response, retryCount })`。而 `src/utils/request.ts:53` 仍是旧签名，于是 `response` 实参是 `undefined`：

```js
async (request, options, response, state) => {
  try { data = await response.clone().json() }   // response 是 undefined → 抛 TypeError
  catch { return response }                      // 被这条吞掉，返回 undefined
  if (!data.success) throw new Error(...)        // 永远到不了
```

hook 返回 `undefined` 时，ky 判定「不是 Response 实例」→ 回退用**原始响应**。

**净效果**：401 自动刷新、`业务错误` 检查、`useResponse` 响应拦截器全都不执行，请求原样透传。**app 拿到的一直是裸 Netease 载荷。**

⚠️ **不要「修正」这个签名。** 一旦修好，`if (!data.success) throw` 会立刻对每个请求生效，而这个后端没有 `success` 字段（`/auth/refresh` 也是 404），app 会全线挂掉。属独立议题，不在本次范围。

### 2. 接口字段（已对 `http://localhost:3000` 实测）

| 接口 | 实测载荷 | 本设计读取 |
| --- | --- | --- |
| `/song/detail?ids=` | `{songs:[…], privileges, code}` | `songs[0].mv`（number，`0` = 无 MV） |
| `/mv/url?id=` | `{code, data:{id, url, r, size, md5, expi, …}}` | `data.url` |

实测样例：`/song/detail?ids=347230`（Beyond《海阔天空》）→ `mv = 376199`；`/mv/url?id=376199` → `data.url` 为 mp4 直链，`data.r = 480`，`data.size = 33536696`（**33 MB**）。

**两个与文档不符之处**：文档称 `/mv/url` 默认分辨率 1080，实测返回 480；MV 直链是 **HTTP 而非 HTTPS**（与歌曲 URL 同一既有问题 —— 部署到 HTTPS 域名会被混合内容策略拦掉）。

## 已确认的需求决策

| 问题 | 决定 |
| --- | --- |
| 开关键名与默认值 | `background.enableMvBackground`，默认 `false` |
| 开关存哪 | **新建 `stores/settings.ts`**，用 `background` 命名空间（该 store 以后收纳全部设置） |
| MV 数据存哪 | `currentSong` 上（`mvid` / `mvUrl`），按原始需求 |
| `mvid` 何时拉 | **只在开关打开时拉**（默认关 → 零额外请求） |
| 歌曲回到 0:00 时 | **MV 也从头重播** |
| 变速播放时 | **MV 同速**（`video.playbackRate` 跟随歌曲） |
| 流体背景 ↔ MV 切换 | **等 `canplay` 再切**，3 秒超时兜底 |
| 同步逻辑放哪 | `FullPageBackground.vue` 组内自治（不改 `MusicController`） |
| 拿不到 MV / 加载失败 | 静默回退流体背景 + `console.warn`，不弹 toast |

## 不做（明确排除）

- 不做设置界面（原始需求说明「现在界面并无设置的 ui」）
- 不改 `MusicController`（它是纯音频控制器，不引入视频职责）
- 不动 `request.ts` 的死 hook（见前置发现）
- 不处理 MV 直链过期 / `<video>` 无 `error` 监听链路（与歌曲 URL 同一既有缺口）
- 不合并 `player_settings` 与新的 `app_settings` 两套持久化

## 架构与数据流

```
settings.background.enableMvBackground 变化  或  currentSong 变化
              ↓
      resolveMv()（playerStore）
              ├─ mvid 未查过 → GET /song/detail → 记下（含 0）
              └─ mvid 非 0   → GET /mv/url      → 写 currentSong.mvUrl
              ↓
      FullPageBackground 读 currentSong.mvUrl
              ├─ 有值 → 设 video.src，等 canplay → 渲染 video（卸载 mesh）
              └─ 无值 → 渲染 mesh
```

### 新增/改动文件

| 文件 | 改动 |
| --- | --- |
| `api/song.ts` | 加 `getSongMvId(id): Promise<number>` |
| `api/mv.ts`（新） | `getMvUrl(mvId): Promise<string \| undefined>` |
| `types/player.ts` | `Song` 加 `mvid?: number`、`mvUrl?: string` |
| `stores/settings.ts`（新） | `background.enableMvBackground` + `app_settings` 持久化 |
| `stores/playerStore.ts` | 加 `resolveMv()` + 一个 watch；`persistQueue` 快照再剔除 `mvUrl` |
| `components/layout/FullPageBackground.vue` | video 元素 + 同步逻辑 + 与 mesh 二选一 |

字段放 `player.Song` 而非基类 `MusicTypes.Song` —— 与既有的 `url` 同一分工：**它们都是「播放时才解析出来的产物」**，不是歌曲固有属性。基类那份有 19 个视图在用。

### 两个刻意的设计

1. **`mvid` 的 `undefined` 与 `0` 语义不同**：`undefined` = 还没查过；`0` = 查过了、这首歌没有 MV。混用会让每次换回这首歌都重查一次 `/song/detail`。
2. **两次 `await` 之后都比对 `currentSong` 的**对象引用**，变了就整个丢弃。用引用而非 id —— id 相等时对象可能已经换了（用户重新点了同一首歌），迟到的结果会覆盖用户的操作。（这是恢复队列那轮踩过的坑。）

## 同步算法

四个 watch + 一个守卫函数：

| 监听 | 动作 |
| --- | --- |
| `currentSong` | 换 `src`（取新歌的 `mvUrl`），重置 video |
| `playing` | play / pause |
| `currentTime` | 纠偏（见下） |
| `playbackRate` | `video.playbackRate` 跟随 |

核心同步函数，每次 `currentTime` 更新时跑：

```
const dur = video.duration
if (!Number.isFinite(dur)) return            // 元数据还没到
if (songTime >= dur) { 停住; return }         // ① MV 短于歌曲：播到尾部停住，不循环
if (!playing)        { pause; return }        // ② 歌曲暂停 → MV 暂停
if (|video.currentTime - songTime| > 0.3)     // ③ 纠偏（阈值 0.3s）
     video.currentTime = songTime
if (video.paused)    void video.play().catch(…)  // ④ 补播，被自动播放策略拒绝则静默降级
```

- **① 必须在 ④ 之前。** `ended` 之后调用 `video.play()` 会**从头重播** —— 漏了这条判断，MV 短于歌曲时会一直循环。
- **「歌曲重头 → MV 也重头」不需要额外分支**：歌曲回到 0 时 `songTime` 重新小于 `dur`，③ 把 video 拽回开头、④ 再补播。
- **阈值 0.3s 是刻意的**：只在漂移超标时才 seek。两者同速同起点时漂移接近 0，正常播放一次都不触发 ③；阈值过小会导致每 250ms 都 seek，画面持续抖动。

## 切换过渡

引入一个「准备中」状态：

```
currentSong.mvUrl 有值 → 设 src，等 canplay
   ├─ canplay 到达（或 3 秒超时）→ 卸载 mesh、渲染 video
   └─ 拿不到地址 / 加载出错 / 超时 → 保持 mesh（静默回退）
```

**3 秒超时是必须的** —— 没有它，CDN 慢或不通时界面会永远卡在 mesh 上「假装在准备」。

### 两个硬性技术约束

- **video 必须 `muted`** —— 否则 MV 音轨与歌曲音频叠成双重声音。它同时是自动播放能被放行的前提。
- **video 不设 `crossOrigin`** —— 歌曲的 `<audio>` 设 `crossOrigin='anonymous'` 是为了接 Web Audio（EQ / 变调）；video 不接音频图，设了反而要求 CDN 返回 CORS 头，白白多一个失败面。

## 错误与降级

所有失败路径收敛到同一句话：**回退流体背景 + `console.warn` + 不弹 toast**（与项目现有播放失败的风格一致）。

| 情况 | 表现 |
| --- | --- |
| `/song/detail` 报错 / 超时 | 保持流体背景，`mvid` **不写 0**，下次换回来重试 |
| `mvid === 0`（这首歌没 MV） | 保持流体背景，写 0 避免重查 |
| `/mv/url` 报错或返回空 | 保持流体背景，`console.warn` |
| video 加载出错 / 3 秒没 `canplay` | 卸载 video，切回流体背景 |

`resolveMv()` 内部用 `try/catch` 包住两次 fetch —— 失败绝不能冒出未处理的 Promise 拒绝。

**第 1 条与第 2 条的区分是刻意的**：接口失败不能记成 0，否则一次网络抖动会让这首歌永远不再查 MV。

## 持久化交互

`playerStore.persistQueue()` 写的是 `player_queue` 快照（上一轮「当前播放列表持久化」的产物）。快照里的 `playlist` 项与 `currentSong` 是同一批对象，因此：

- **`mvUrl` 必须剔除** —— 它与 `url` 同类，是带时效的 CDN 直链，存了刷新恢复后会拿到死链，症状是「MV 背景黑屏、没有任何提示」
- **`mvid` 保留** —— 稳定的 id，恢复后靠它重新解析，能省掉一次 `/song/detail`

## 验收清单

1. 打开开关 → 播放有 MV 的歌 → 背景切到 MV，且**没有第二路声音**
2. 暂停 / 播放歌曲 → MV 跟着停 / 播
3. 拖动进度条 → MV 跟着跳（允许 ~0.3s 误差）
4. MV 短于歌曲 → 播到尾部**停住**，不循环
5. 单曲循环 → 歌曲重头时 MV 也从 0 重播
6. 切到没有 MV 的歌 → 回到流体背景
7. 变速 2x → MV 同步加速，不抖动
8. 关掉开关 → 立刻回流体背景，且**不再发** MV 相关请求
9. 刷新页面 → 有 MV 的歌恢复后背景仍是 MV（前提：开关是开的）
10. 让某首有 MV 的歌拿不到地址（或断网）→ 保持流体背景，控制台有 warn，页面不崩

开关没有 UI，测试时用：

```js
localStorage.setItem('app_settings', JSON.stringify({ background: { enableMvBackground: true } }))
```

## 已知限制

1. **MV 体积**：实测 480p 的 MV 为 **33 MB**。当背景播放一首歌就是几十 MB 流量（原始需求未提，后续想省可传 `r=240`）。
2. **HTTP 混合内容**：MV 直链是 `http://`，部署到 HTTPS 域名会被浏览器拦掉（与歌曲 URL 同一既有问题）。
3. **地址过期**：MV 直链带时效，长时间播放后会失效；`<video>` 无 `error` 监听，症状是画面卡住且无提示。与歌曲 URL 同类的既有缺口。
4. **同步精度**：纠偏基于 `timeupdate`（约 4 次/秒），不是逐帧对齐。阈值 0.3s 内不做纠正。
5. **多标签页**：与本项目其他持久化一样，不做 `storage` 事件同步。
