# 维度 3 — 类型安全与抽象

> **结论**：项目里 TypeScript 几乎是"装饰性的"——`any` 泛滥、断言堆叠、抽象层级混乱。`tsconfig` 的 `strict` 即使开着也没起到类型网的作用。

---

## 🔴 严重

### TS-1. `MusicController` 事件系统完全擦除类型

**位置**：`src/core/player/MusicController.ts:2, 13, 118-137`

**现象**：
```ts
type EventCallback = (...args: any[]) => void
private events: Map<string, EventCallback[]> = new Map()
on(event: string, cb: EventCallback) { ... }
emit(event: string, ...args: any[]) { ... }
```

事件名是裸 `string`，载荷是 `any[]`。`timeupdate`/`loaded`/`songchange` 的载荷形状在编译期完全不可知。

**实际代价**：改 timeupdate 的载荷（比如加 `{current, duration}`）不会在编译期暴露，运行时出现 `NaN` 或 undefined 字段。

---

### TS-2. mitt 实例无泛型，所有处理器都先 `as` 强转

**位置**：
- `src/utils/eventBus.ts:3` —— `mitt()` 无类型
- `src/utils/eventBusHandler/clickEventHandler.ts:10-44`
- `src/utils/eventBusHandler/playEventHandler.ts:9-25`
- `src/utils/eventBusHandler/userEventHandler.ts:11-13`
- `src/utils/eventBusHandler/toastEventHandler.ts:7-18`

**现象**：所有处理器签名都是 `(e: unknown) => void`，函数体第一句就是 `const x = e as Artist`。

**实际代价**：组件误发事件或传错对象时编译器无法阻止；错误的栈远离真正的发错位置（要在导航/播放器方法内部才爆炸）。

---

### TS-3. `dataTransformer.ts` 输入全是 `any`，没有运行时校验

**位置**：`src/utils/dataTransformer.ts:6, 39, 72-75, 116, 166, 190, 221`

**现象**：
- `transformToArtist(rawArtist: any)`
- `transformAlbums(rawAlbums: MusicTypes.RawAlbum, ...)` ← 唯一一个类型化的入参，但内部又 `rawAlbums.artists.map(transformToArtist)` 而 `transformToArtist` 又是 `any`
- `transformPlaylistDetail(rawPlaylist: any)`
- `transformAlbumDetail(rawData: any)`
- `transformCommentListResponse(rawData: any)`

**实际代价**：后端字段缺失/改名/返回 `null` 时，transform 直接读 `undefined.x.y` 或生成结构残缺的领域对象。问题通常到模板渲染时才暴露。

---

### TS-4. API 层完全没有返回类型

**位置**：`src/api/playlist.ts:3-58`、`src/api/*.ts`

**现象**：
```ts
export async function getPlaylistDetail(playlistId: string) {
  return await request.get(`/playlist/detail?id=${playlistId}`, { sendCookie: true })
}
```
`request.get` 没声明泛型，返回 `Promise<any>`。

**实际代价**：调用方可随意访问不存在的 `result.playlist.tracks` 字段而通过类型检查；分页/详情接口响应结构不一致时，错误延迟到模板或 transformer 运行时。`data?.result?.artists ?? []` 的大量可选链是症状而非治疗。

---

## 🟡 中等

### TS-5. 同一"User"概念有 4 个 interface

**位置**：
- `src/types/musicTypes.ts:38-45` —— `User`（精简展示）
- `src/types/user.ts:13-53` —— `User`（完整 Netease profile 45 字段）
- `src/types/user.ts:4-10` —— `UserInfo`（登录账户 UI）
- `src/types/musicTypes.ts:48-55` —— `RawUserProfile`（原始 API）
- `src/types/comment.ts:24-45` —— `CommentUser`（评论中的用户）
- `src/types/comment.ts:70` —— `Comment.user: User`（指向 `musicTypes.User`）

**实际代价**：
- 评论转换、用户主页、歌单 creator 之间传递对象时容易把 `avatarUrl` 当 `avatar`、`userId` 当 `id`。
- 类型目前勉强通过，但运行时显示空头像、错误 ID、路由跳转失败。
- 当前 `CommentListResponse.user` 是 `User`（45 字段），但 `transformComment` 第 192 行直接 `rawComment.user`，不做转换。

---

### TS-6. `Playlist` 类型是个 45 字段的"超级 interface"

**位置**：`src/types/playlist.ts:1-51`

**现象**：包含从 `id` 到 `songFromUsers` 的 45 个字段，混合原始 Netease schema 与领域字段。没有 `RawPlaylist` / `PlaylistDetail` / `PlaylistSummary` 分层。

**实际代价**：列表/详情/评论关联对象被迫共享一个超大类型；新增字段会波及大量页面，且无法表达不同接口真正保证的字段，导致大量非空断言和可选链。

---

### TS-7. `playerStore` 大量非空断言

**位置**：`src/stores/playerStore.ts:73-79, 95, 117, 136, 215, 250`

**现象**：
```ts
[randomQueue.value[i]!, randomQueue.value[j]!] = [randomQueue.value[j]!, randomQueue.value[i]!]
playlist.value[index]! // 在 for/await 内
randomQueue.value[randomIndex.value]!
playlist.value[i]!
```

**实际代价**：清空列表、删除当前歌曲、异步预加载期间切换歌曲或随机队列过期时，会把 `undefined` 传入 `playByIndex`/`getSong`，最终在播放、URL 读取或属性访问处崩溃。

---

### TS-8. `user.ts` getter 用非空断言绕过安全 fallback

**位置**：`src/stores/user.ts:77`

**现象**：
```ts
_userCreatePlaylist: Playlist[] | null,  // 可能 null
isUserCreatedPlaylist: (state) => (playlist) =>
  state._userCreatePlaylist!.some(item => item.id === playlist.id)  // 直接 !
```

getter `userCreatePlaylist` 提供空数组兜底，但 action 绕过了安全 getter。

**实际代价**：用户未登录、初始化尚未完成或 `resetUser` 后调用收藏检查会直接对 null 调 `some` 崩溃。

---

## 🟢 轻微

### TS-9. `MusicController.playSong` 用 `song.url!` 强假设

**位置**：`src/core/player/MusicController.ts:139-141`

**现象**：`this.audio.src = song.url!`

**实际代价**：缓存失效、URL 获取失败或未注入 URL 时会把 `undefined` 设置给 `audio.src`，浏览器静默失败。

---

### TS-10. `lyric.ts` 把 Promise 当字符串返回

**位置**：`src/api/lyric.ts:14-19`

**现象**：
```ts
const response = await fetch(...)
if (response.status === 200) {
  const ttmlString = response.text()  // ← 这是 Promise<string>，不是 string
  return ttmlString
}
```

**实际代价**：调用方 `getTTMLLyric()` 拿到的是 Promise，传入 `parseTTML()` 会失败；`FullScreenPlayer.vue` 的 `extractTTMLLyrics(ttmlLyricRes)` 实际是对 Promise 解析。

---

### TS-11. `request.ts` 三个拦截器类型几乎相同

**位置**：`src/utils/request.ts:18-20`

```ts
type RequestInterceptor = (config: Request) => Promise<Request> | Request
type ResponseInterceptor<T = any> = (data: T) => T | Promise<T>
type ErrorInterceptor = (error: any) => any
```

可合并为单一泛型 `Interceptor<T>`。

---

## 总结

| # | 问题 | 修法 |
|---|------|------|
| TS-1 | MusicController 事件擦除 | 把 `Map<string, EventCallback[]>` 改为 `Map<PlayerEvent, PlayerEventHandler>` |
| TS-2 | mitt 无类型 | `mitt<Events>()` + 集中 `Events` interface |
| TS-3 | dataTransformer 全 any | 引入 `zod` 做 schema 校验；或在 transform 内显式判空 |
| TS-4 | API 无返回类型 | `request.get<T>(url)` + 各 API 函数声明返回类型 |
| TS-5 | User 多 interface | 用 `type User = UserDetail & UserSummary` 交集 / 分层 `Playlist.creator` 用 `PlaylistCreator` 而非全局 User |
| TS-6 | Playlist 超大类型 | 拆 `RawPlaylist` / `PlaylistSummary` / `PlaylistDetail` |
| TS-7 | playerStore 非空断言 | 用 `at(index)` + 显式 `if (!item) return` |
| TS-8 | user getter `!` | 用 `_userCreatePlaylist ?? []` |
| TS-9 | `song.url!` | 改 `if (!song.url) await getSong(song)` |
| TS-10 | `response.text()` 未 await | `return await response.text()` |
