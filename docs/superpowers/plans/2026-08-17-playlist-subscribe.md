# 歌单收藏 / 取消收藏 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 PlaylistCard 歌单卡片红心的「收藏 / 取消收藏」：点击收藏、再点取消、自建歌单不显红心、侧边栏「收藏的歌单」同步。

**Architecture:** 逻辑归属 `userStore`，与歌曲红心 `userLikeListSet` / `toggleLikeMusic` 对称。新增 `subscribedPlaylistSet: Set<string>` 作为收藏状态唯一真源，`toggleSubscribePlaylist(playlist)` 调接口成功后更新 Set 并同步 `_userSubPlaylist`（侧边栏响应式绑定该数组）。PlaylistCard 直接调用 store。

**Tech Stack:** Vue 3.5（`<script setup lang="ts">`）、Pinia 3（Options API store）、ky 封装 `utils/request`、lucide-vue-next 图标、mitt 事件总线 + `MESSAGE_TYPE` Toast。

## Global Constraints

- **简化 `Playlist.id` 运行时恒为字符串**：所有生产方走 `transformToPlaylist`（`id: String(rawPlaylist.id)`）。Set 统一存字符串，getter/action 内用 `String(id)` 归一化，避免 Number/string 键不匹配。
- **Toast 常量沿用历史拼写**：`MESSAGE_TYPE.TOAST_SUSSESS`（双 S）不可改为 `SUCCESS`。
- **无测试框架**：本项目无 vitest/jest。验证 = `pnpm type-check`（vue-tsc）+ 用户手动场景清单。Agent 不得启动 `pnpm dev` / 后端服务（CLAUDE.md 行为规范 1）。
- **提交时机**：本计划**不含任何 `git commit` 步骤**。按用户要求，所有提交待任务完成、`pnpm type-check` 通过、用户批准后统一执行。
- **最小影响面**：只改 `src/api/playlist.ts`、`src/stores/user.ts`、`src/components/common/musicComponents/PlaylistCard.vue` 三个文件。不碰 TheSidebar.vue / SongList.vue / PlaylistGrid.vue / 事件总线 / 路由。
- **不修复存量问题**：`SongList.vue` 的 `has(Number(songId))` 潜在 bug、`persist()` 不持久化 `_userCreatePlaylist` / `_userSubPlaylist` 均不在本次范围。

---

## 文件结构

| 文件 | 职责 | 动作 |
| --- | --- | --- |
| `src/api/playlist.ts` | 新增 `subscribePlaylist` 接口函数 | 追加 |
| `src/stores/user.ts` | 收藏状态（Set + getter + action + 播种 + 持久化）+ 修复 `isUserCreatedPlaylist` | 修改 |
| `src/components/common/musicComponents/PlaylistCard.vue` | 红心按钮接线（含 loading / 自建隐藏 / 死 emit 移除） | 修改 |
| `src/views/Home/components/PlaylistSection.vue` | 首页「推荐歌单」红心接入 store + 修复 hoveredPlaylist 类型错误（不隐藏自建） | 修改 |

---

### Task 1: API — `src/api/playlist.ts`

**Files:**
- Modify: `src/api/playlist.ts`（文件末尾，`modifyPlaylistTracks` 之后追加）

**Interfaces:**
- Consumes: `request`（`@/utils/request`，已有）
- Produces: `subscribePlaylist(t: 1 | 2, id: string | number): Promise<any>`（Task 2 消费）

- [ ] **Step 1: 追加 `subscribePlaylist`**

在 `src/api/playlist.ts` 文件末尾追加：

```typescript
/**
 * 收藏 / 取消收藏歌单
 * t = 1: 收藏，t = 2: 取消收藏
 * 接口地址: /playlist/subscribe
 */
export async function subscribePlaylist(t: 1 | 2, id: string | number) {
  return await request.get(`/playlist/subscribe?t=${t}&id=${id}`, { sendCookie: true })
}
```

- [ ] **Step 2: 类型检查**

Run: `pnpm type-check`
Expected: 无新增错误（新增导出函数本身不引入类型问题）。

---

### Task 2: userStore — `src/stores/user.ts`

**Files:**
- Modify: `src/stores/user.ts`（import / UserState / state / getters / init / actions / fetchUser / persist）

**Interfaces:**
- Consumes: `subscribePlaylist`（Task 1）、`MESSAGE_TYPE`（已有）、`emitter`（已有）、`Playlist` / `FullPlaylist` 类型（已有）
- Produces: `isPlaylistSubscribed(id: string | number): boolean`、`toggleSubscribePlaylist(playlist: Playlist): Promise<boolean>`、`isUserCreatedPlaylist(playlist): boolean`（修复后）（Task 3 消费）

- [ ] **Step 1: 新增 import**

在 `src/stores/user.ts` 现有 import 块中，`@/api/user` import 之后追加一行：

```typescript
import { subscribePlaylist } from '@/api/playlist'
```

（`src/api/user` 与 `src/api/playlist` 是同级目录，路径按现有 `@/` 别名写。）

- [ ] **Step 2: `UserState` 接口 + `state()` 初始值**

`UserState` 接口在 `userLikeListSet: Set<number | string>` 后追加：

```typescript
  subscribedPlaylistSet: Set<string> // 已收藏歌单 id 集合（统一存字符串）
```

`state()` 中 `userLikeListSet: new Set(),` 后追加：

```typescript
    subscribedPlaylistSet: new Set(),
```

- [ ] **Step 3: getters — 新增 `isPlaylistSubscribed` + 修复 `isUserCreatedPlaylist`**

在 `isSongLiked` getter 后追加 `isPlaylistSubscribed`：

```typescript
    isPlaylistSubscribed: (state) => (id: string | number): boolean =>
      state.subscribedPlaylistSet.has(String(id)),
```

将 `isUserCreatedPlaylist` 由：

```typescript
    isUserCreatedPlaylist: (state) =>
      (playlist: Playlist | FullPlaylist): boolean =>
        state._userCreatePlaylist!.some((item) => item.id === playlist.id),
```

改为（`?.` + `?? false` 修复 `_userCreatePlaylist` 为 null 时抛异常）：

```typescript
    isUserCreatedPlaylist: (state) =>
      (playlist: Playlist | FullPlaylist): boolean =>
        state._userCreatePlaylist?.some((item) => item.id === playlist.id) ?? false,
```

- [ ] **Step 4: `init()` 恢复持久化**

在 `init()` 中 `this.userLikeListSet = new Set(data.userLikeListSet || [])` 后追加：

```typescript
        this.subscribedPlaylistSet = new Set(data.subscribedPlaylistSet || [])
```

- [ ] **Step 5: 新增 `toggleSubscribePlaylist` action**

在 `toggleLikeMusic` action 之后、`fetchUser` 之前插入：

```typescript
    /**
     * 收藏 / 取消收藏歌单
     * 成功更新 subscribedPlaylistSet 与 _userSubPlaylist（侧边栏同步）
     * @param playlist 简化 Playlist（id 恒为字符串）
     */
    async toggleSubscribePlaylist(playlist: Playlist): Promise<boolean> {
      // 登录守卫：未登录直接拦截，不发请求
      if (!this.isLogin) {
        emitter.emit(MESSAGE_TYPE.TOAST_WARNING, '请先登录')
        return false
      }
      const id = String(playlist.id)
      const isSubscribed = this.subscribedPlaylistSet.has(id)
      const res = await subscribePlaylist(isSubscribed ? 2 : 1, playlist.id)
      if (res?.code === 200 || res?.code === '200') {
        // 更新 Set（新建实例触发响应式）
        const newSet = new Set(this.subscribedPlaylistSet)
        isSubscribed ? newSet.delete(id) : newSet.add(id)
        this.subscribedPlaylistSet = newSet

        // 同步侧边栏「收藏的歌单」（重新赋值新数组显式触发）
        if (isSubscribed) {
          this._userSubPlaylist = (this._userSubPlaylist || []).filter((p) => String(p.id) !== id)
        } else {
          const list = this._userSubPlaylist || []
          if (!list.some((p) => String(p.id) === id)) {
            this._userSubPlaylist = [...list, playlist]
          }
        }

        emitter.emit(MESSAGE_TYPE.TOAST_SUSSESS, isSubscribed ? '已取消收藏' : '已收藏')
        return true
      }
      emitter.emit(MESSAGE_TYPE.TOAST_ERROR, isSubscribed ? '取消收藏失败' : '收藏失败')
      return false
    },
```

- [ ] **Step 6: `fetchUser()` 播种**

在 `fetchUser()` 中 `this._userCreatePlaylist = userCreate` / `this._userSubPlaylist = userSub` 之后追加：

```typescript
        this.subscribedPlaylistSet = new Set(userSub.map((p) => String(p.id)))
```

- [ ] **Step 7: `persist()` 持久化**

在 `persist()` 的 `userLikeListSet: [...this.userLikeListSet],` 后追加：

```typescript
          subscribedPlaylistSet: [...this.subscribedPlaylistSet],
```

- [ ] **Step 8: 类型检查**

Run: `pnpm type-check`
Expected: 无新增错误。重点确认 `this.isLogin`、`this.subscribedPlaylistSet`、`this._userSubPlaylist` 在 Options API action 中的类型正确。

---

### Task 3: PlaylistCard — `src/components/common/musicComponents/PlaylistCard.vue`

**Files:**
- Modify: `src/components/common/musicComponents/PlaylistCard.vue`（script / template / style）

**Interfaces:**
- Consumes: `useUserStore`、`isUserCreatedPlaylist`、`isPlaylistSubscribed`、`toggleSubscribePlaylist`（Task 2）
- Produces: 无新接口（供 PlaylistGrid 等以现有 `:playlist` prop 消费）

- [ ] **Step 1: 改 script — import + 状态 + handler**

将 `<script setup>` 的 import 部分由：

```typescript
import { Music2, User, Play, Heart } from 'lucide-vue-next';
```

改为（追加 `computed`/`ref` 与 `Loader2`，新增 store import）：

```typescript
import { computed, ref } from 'vue';
import { Music2, User, Play, Heart, Loader2 } from 'lucide-vue-next';
import { useUserStore } from '@/stores/user';
```

将 `defineEmits` 由：

```typescript
defineEmits<{
  'like-playlist': [playlist: Playlist];
  'artist-click': [artist: any];
}>();
```

改为（移除无监听者的 `like-playlist`；`artist-click` 保持不变）：

```typescript
defineEmits<{
  'artist-click': [artist: any];
}>();
```

在 `handlePlaylistClick` 之前插入状态与 handler：

```typescript
const userStore = useUserStore();
const isUserCreated = computed(() => userStore.isUserCreatedPlaylist(props.playlist));
const isLiked = computed(() => userStore.isPlaylistSubscribed(props.playlist.id));
const subscribeLoading = ref(false);
const handleSubscribe = async () => {
  subscribeLoading.value = true;
  await userStore.toggleSubscribePlaylist(props.playlist);
  subscribeLoading.value = false;
};
```

- [ ] **Step 2: 改 template — 红心按钮**

将红心按钮由：

```vue
        <Button size="icon" variant="secondary"
          class="w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white"
          @click.stop="$emit('like-playlist', playlist)">
          <Heart class="w-3 h-3" :class="{ 'fill-red-500 text-red-500': playlist.isLiked }" />
        </Button>
```

改为：

```vue
        <Button
          v-if="!isUserCreated"
          size="icon"
          variant="secondary"
          class="w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white subscribe-btn"
          :disabled="subscribeLoading"
          @click.stop="handleSubscribe"
        >
          <Loader2 v-if="subscribeLoading" class="w-3 h-3 animate-spin" />
          <Heart v-else class="w-3 h-3 transition-all duration-300"
            :class="{ 'fill-red-500 text-red-500': isLiked }" />
        </Button>
```

- [ ] **Step 3: 补 style — `.subscribe-btn` 微动效**

在 `<style scoped>` 的 `.playlist-image:hover` 规则后追加：

```css
/* 收藏按钮微动效 */
.subscribe-btn {
  transition: transform 0.15s ease;
}
.subscribe-btn:active {
  transform: scale(0.92);
}
.subscribe-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}
```

- [ ] **Step 4: 类型检查**

Run: `pnpm type-check`
Expected: 无新增错误。确认 `Loader2`、`computed`、`ref`、`useUserStore` 均已导入无未使用告警（`vue-tsc` 默认不报未使用 import，prettier 不处理）。

---

### Task 4: PlaylistSection — 首页「推荐歌单」红心接入 + 类型修复

> 用户追加需求（2026-08-17 已确认）：PlaylistSection 的红心 stub（本地翻转 `playlist.isLiked`，不调接口）接入 store 收藏逻辑，并修复 `hoveredPlaylist` 类型错误。**不隐藏自建歌单红心。**

**Files:**
- Modify: `src/views/Home/components/PlaylistSection.vue`

**Interfaces:**
- Consumes: `useUserStore`、`isPlaylistSubscribed`、`toggleSubscribePlaylist`（Task 2）
- Produces: 无

- [ ] **Step 1: import useUserStore**

在 `import { MESSAGE_TYPE } from '@/constants/messages'` 后追加：

```typescript
import { useUserStore } from '@/stores/user'
```

- [ ] **Step 2: 修复 hoveredPlaylist 类型错误**

由 `const hoveredPlaylist = ref<number | null>(null)` 改为：

```typescript
const hoveredPlaylist = ref<string | number | null>(null)
```

（`playlist.id` 为 `string | number`，原 `number | null` 导致 TS2322。）

- [ ] **Step 3: toggleLike 接入 store + 防重复守卫**

由：

```typescript
const toggleLike = (playlist: Playlist) => {
  playlist.isLiked = !playlist.isLiked
}
```

改为：

```typescript
const userStore = useUserStore()
const subscribingId = ref<string | number | null>(null)
const toggleLike = async (playlist: Playlist) => {
  if (subscribingId.value !== null) return
  subscribingId.value = playlist.id
  await userStore.toggleSubscribePlaylist(playlist)
  subscribingId.value = null
}
```

- [ ] **Step 4: 模板红心改为读 store**

模板中两处 `playlist.isLiked` 改为 `userStore.isPlaylistSubscribed(playlist.id)`：

```vue
:class="{ 'scale-110': userStore.isPlaylistSubscribed(playlist.id) }"
```
```vue
:class="{ 'fill-red-500 text-red-500 scale-110': userStore.isPlaylistSubscribed(playlist.id) }"
```

- [ ] **Step 5: 类型检查**

Run: `pnpm type-check`
Expected: `PlaylistSection.vue` 原有 TS2322 消除；整体错误数由基线 26 降至 25，**无新增**。

---

### Task 5: TheSidebar — 折叠高度重测（追加 bug 修复）

> 用户报告（2026-08-17）：收藏新歌单后侧边栏「收藏的歌单」不显示。根因：`subPlaylistHeight`/`createPlaylistHeight` 是缓存非响应式 `scrollHeight` 的 computed，列表新增项后 `maxHeight` 不重测，新项被 `.playlist-list { overflow: hidden }` 裁剪（取消收藏时内容变矮、不超过旧 maxHeight，所以能正常看到）。
>
> 用户明确选择**只改 TheSidebar.vue，不碰 user.ts 持久化**。已知遗留：刷新后订阅状态不持久（`toggleSubscribePlaylist` 未调 persist、`persist()` 不保存数组、`fetchUser` 10 分钟缓存跳过拉取），刷新后侧边栏仍可能不显示新收藏。

**Files:**
- Modify: `src/components/layout/TheSidebar.vue`

- [ ] **Step 1: import 补 `watch` / `nextTick`**

`import { ref, onMounted, computed } from 'vue'` → `import { ref, onMounted, computed, watch, nextTick } from 'vue'`

- [ ] **Step 2: 高度由 computed 改为 ref**

由：

```typescript
const createPlaylistHeight = computed(() => {
  return userCreatePlaylistRef.value?.scrollHeight
})
const subPlaylistHeight = computed(() => {
  return userSubPlaylistRef.value?.scrollHeight
})
```

改为：

```typescript
const createPlaylistHeight = ref(0)
const subPlaylistHeight = ref(0)
```

- [ ] **Step 3: measure 函数 + 4 个 watch**

在 `toggleSubPlaylists` 后、`onMounted` 前插入：

```typescript
// 歌单列表内容变化时重新测量高度（scrollHeight 非响应式，需在 DOM 更新后手动重测）
const measureSubHeight = async () => {
  await nextTick()
  subPlaylistHeight.value = userSubPlaylistRef.value?.scrollHeight || 0
}
const measureCreateHeight = async () => {
  await nextTick()
  createPlaylistHeight.value = userCreatePlaylistRef.value?.scrollHeight || 0
}
watch(() => userStore.userSubPlaylist, measureSubHeight)
watch(() => userStore.userCreatePlaylist, measureCreateHeight)
watch(subPlaylistsCollapsed, measureSubHeight)
watch(myPlaylistsCollapsed, measureCreateHeight)
```

- [ ] **Step 4: 类型检查**

Run: `pnpm type-check`
Expected: `TheSidebar.vue` 无错误；整体仍为基线 25（无新增）。

---

## 验证（实现完成后）

### 1. 静态检查

```bash
pnpm type-check
```
Expected: 通过，无本次改动引入的错误。

### 2. 手动场景清单（用户执行，`pnpm dev`）

| # | 场景 | 预期 |
| --- | --- | --- |
| 1 | 登录后，首页歌单卡片点红心 | Toast「已收藏」，红心变红（fill-red-500） |
| 2 | 再次点击同一红心 | Toast「已取消收藏」，红心复原 |
| 3 | 收藏后查看侧边栏「收藏的歌单」 | 出现该歌单；取消后消失 |
| 4 | 未登录，点击红心 | Toast「请先登录」，无网络请求，红心不变 |
| 5 | 用户主页查看自己创建的歌单 | 卡片不显示红心（`isUserCreatedPlaylist` 命中） |
| 6 | 收藏 / 取消过程中（loading） | 按钮禁用，显示 `Loader2` 旋转 |
| 7 | 首页「推荐歌单」区点红心 | 与场景 1-4 一致（收藏/取消/未登录拦截），红心状态与 PlaylistCard 同步 |

### 3. 提交

按用户要求：**所有改动待上述验证通过、用户明确批准后**，统一 `git add` / `git commit`（当前分支 `developing`）。不在此计划内执行任何 commit。
