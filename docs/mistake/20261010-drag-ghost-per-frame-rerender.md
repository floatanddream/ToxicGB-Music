# 失误记录 — 拖拽浮层把「每帧值」塞进了响应式

> **发生日期**：2026-10-10
> **涉及文件**：`src/components/common/PlaylistPanel.vue`（播放列表面板的行拖拽排序）
> **症状**：拖动过程中卡顿。同一首歌拖得越远越卡 —— 从列表首行拖到第二三行之间几乎无感，拖到更远就明显掉帧。
> 松手之后不卡，只是拖的**过程**中卡。
> **严重度**：中。不影响正确性（顺序、播放、持久化都对），但把这个功能的手感毁掉了。
> **定位耗时**：把一行赋值注释掉再复现，30 秒。

---

## 一句话

浮层位置是**每次 `pointermove` 都变**的值，我用一个 `ref` 存它，又把它放在**本组件的根渲染函数**里读 ——
而那个渲染函数里还有整个列表的 `v-for`。于是每动一下鼠标，整棵 vnode 树连同每一行的
reka ContextMenu 子树全部重建一遍，拖拽被自己的渲染开销压住。

---

## 出问题的代码

```vue
// 之前（有 bug）
const ghostPos = ref({ x: 0, y: 0 })

const setGhostPos = (clientX: number, clientY: number) => {
  ghostPos.value = { x: clientX + GHOST_OFFSET_X, y: clientY - ITEM_HEIGHT / 2 }
}
```
```html
<div class="playlist-drag-ghost" :style="{ transform: `translate(${ghostPos.x}px, ${ghostPos.y}px)` }">
```

```vue
// 之后
import { motion, useMotionValue } from 'motion-v'
const ghostX = useMotionValue(0)
const ghostY = useMotionValue(0)

const setGhostPos = (clientX: number, clientY: number) => {
  ghostX.set(clientX + GHOST_OFFSET_X)
  ghostY.set(clientY - ITEM_HEIGHT / 2)
}
```
```html
<motion.div class="playlist-drag-ghost" :style="{ x: ghostX, y: ghostY }">
```

---

## 为什么慢：机制

1. **Vue 3（非 Vapor）没有细粒度订阅。** 组件模板里读到的任何响应式值变化，都会让**整个组件的渲染函数重跑**，
   而不是只更新读到它的那个节点。所以「这个 ref 放在哪」不重要，**「哪个渲染函数读到它」才是要害**。
2. **`ghostPos.value = { x, y }` 每次赋的都是新对象字面量。** Vue 的 ref 判等走 `Object.is`，
   新对象永不相等 → **每次赋值必然触发一次渲染**，一次都不会被跳过。
3. **它和 `v-for` 在同一个渲染函数里。** 可见行数约 19 行（`ceil(可视高 / 68) + 2 × 5` 缓冲，上限为队列长度）。
4. **每一行的组件深度不浅。** 行外面套着 `SongContextMenu`，往下是
   `ContextMenuRoot → MenuRoot → PopperRoot → MenuAnchor → PopperAnchor`，还各自带着 `reactiveOmit` /
   `useForwardPropsEmits` 这类包装。一行不是一个节点，是一小棵树。
5. 于是每次 `pointermove`：重建约 19 行 × 每行约 10 个 vnode ≈ **200 个临时对象**，
   再把这二百来个 vnode 逐个 patch 一遍。这是纯主线程开销，外加持续的 GC 压力。

对比一下同一次改动里的另一个值：`dropAt` 也是 ref，也在同一个渲染函数里读，
但它由 `calcDropAt()` 算出来，是**阶梯函数** —— 只有指针跨过 68px 的行边界才变。
不跨边界时赋值给的是同一个数字，`hasChanged` 为 false，**根本不触发渲染**。
它不是运气好，是它天然低频。

---

## 症状为什么长成「拖得越远越卡」

这一点差点把我带偏，值得单独记。

每帧的成本是**恒定**的，所以卡顿的**频率**并不随拖动距离变化。变的只是**暴露时长**：
跨 1 行（约 68px）大概 12 帧，可能刚好压在感知阈值之下；跨 2~3 行（140px 以上）就是 20 帧往上，
藏不住了。所以「越远越卡」不是累积效应，是同一件事被看得更久。

我最初的排查方向完全错了 —— 我去翻 `playerStore` 里「每次重排都会跑」的两个副作用
（`preloadNextSong` 的网络预加载、`persistQueue` 的全量 `JSON.stringify` + 同步 `localStorage` 写入），
它们确实是真实成本，也确实随重排次数累积，但它们**解释不了「拖着的时候就卡」**：
拖动期间队列根本没有变，这两个函数一次都没跑。

**决定性的一步不是推理，是把唯一一个真的每帧都在变的赋值注释掉再复现。**

---

## 根本原因（不是「这个 API 用错了」）

1. **把「输入设备的输出」当成了状态。**
   光标位置没有身份、只有一个消费者、且以输入频率变化 —— 状态的三条标准（有身份、多方读、低频）
   它一条都不占。它不该进响应式图。

2. **选存储方式时没有问「谁会读它、读它的地方有多重」。**
   我按「这是个会变的值」选了 `ref`，但没问「这个 ref 会在哪个渲染函数里被读到」。
   放进一个带 N 项 `v-for` 的根渲染函数，等于顺手宣布「这 N 项每帧重建」。

3. **整个设计与复审过程里，没有一次问「这东西每秒跑几次」。**
   我为这个功能跑过一轮红队审查，拿到 22 条结论 —— 事件生命周期、索引换算、边界条件、
   `cleanup()` 时机、`z-index` 包含块、竞态…… **没有一条关于频率**。
   也就是说这不是运气不好，是审查维度里缺了「按频率分层」这一遍，属于系统性漏掉的。

4. **没量就写。** 我是在给「每帧都要跑」的代码路径上，唯一没有做任何计时/计数冲动的那个环节。
   最后是靠用户报障才发现的。

---

## 修法，以及为什么没选另外两条路

用 **motion value**（`motion-v`，项目已有依赖）：`useMotionValue` 来自 `motion-dom` 的
`MotionValue` **普通类**（自带订阅者，**不是 Vue 的响应式对象**），在模板里读它不建立依赖，
`set()` 只把结果写进 DOM，不惊动渲染。

选它的理由，以及被排除的两条：

| 方案 | 取舍 |
| --- | --- |
| **motion value**（采用） | 改动最小；项目已有先例（`BouncingSlider.vue` 的 `bounceX`，同样是在 window 的 `pointermove` 里逐次 set）；顺带解决「浮层挂载瞬间闪一下 (0,0)」—— motion value 可以在元素挂载前就设好，而 ref 做不到 |
| 抽成独立子组件持有位置状态 | 能构造上圈住重渲染，但浮层要复用的那几个行内样式（`.playlist-cover` / `.playlist-info` / `.playlist-song-title`）是 scoped 的，跨组件就不生效，得连带搬 CSS 或复制一份 |
| 命令式写 `el.style.transform` | 最少代码，但等于开一个绕开 Vue 的口子，与项目「显式优于隐式」的偏好相冲；而且一旦浮层上还有别的 `:style` 绑定，任一次别的重渲染都会把命令式写进去的 `transform` 覆盖掉 |

**没有做 rAF 合流。** 被证实的开销是 Vue 重渲染，motion value 已把它整条消掉；
剩下的只是写 `transform` 字符串，浏览器渲染时自然合并，且 `BouncingSlider` 在同一频率下已经是流畅的。
再叠一层自己的 rAF 要引入额外状态与清理路径，属于没有实测支撑的复杂度 —— 等真出现可感顿挫再加。

---

## 沉淀：可复用的判据

### 加一个会变的值之前，先问三句

1. 它会随着指针 / 滚动 / 动画帧变化吗？
2. 谁读它？读它的那个**渲染函数**里有没有 N 项循环？
3. 那个 N 有多大？

任何一条命中，就别走 `.value`：

- **motion value** —— 有位置/动画语义、只有一个视觉消费者时首选（本项目已有依赖和先例）
- **独立子组件持有该状态** —— 要保持声明式、且这个状态还带着别的逻辑时
- **命令式写 DOM** —— 最省代码，但代价是开了个绕开响应式的口子，要写足注释

### 定位手法

**「每帧成本恒定」的症状长得像「越用越卡」，但它不是累积。**
先找「到底哪些东西真的每帧在变」（在 `pointermove` / rAF 回调里逐个看），再找「谁读它」。
最有效的验证是把那个赋值单独注释掉再复现 —— 比读代码猜快一个数量级。

### 本项目已有的高频值（反向检查用）

| 值 | 变化频率 | 谁读 | 结论 |
| --- | --- | --- | --- |
| `PlaylistPanel.dropAt` | 每跨 68px 一次 | 根渲染函数里的行 | 可以（天然低频，值不变时不触发） |
| `PlaylistPanel` 浮层位置 | 每次 `pointermove` | 根渲染函数（**含 19 行 v-for**） | ❌ 曾经的 bug，已改 motion value |
| `BouncingSlider.bounceX` | 每次 `pointermove` | motion value | ✅ 正确用法 |
| `FullPageBackground` 的 `currentTime` / `playing` | 每帧（rAF 驱动） | 该组件自身，无循环 | 可以，但改动它时要留意 |

---

## 关联

- `docs/code-review/06-performance.md` 里的 PERF-* 是**静态读代码**得出的结论。
  本文这一条是**运行时**才暴露的，说明性能问题不能只靠读代码，也需要「每帧跑几次」这条独立的审查维度。
- 同一轮改动里另有一个**性质不同**的隐患（生命周期，不是频率）：
  `settleAfterDrop()` 的两个 rAF 没有登记进 `cleanup()` —— 若在上一次落定后 2 帧内再次起拖，
  陈旧的 rAF 会把 `isSettling` 提前置回 false，行会从错误的位置滑过来。尚未修。
