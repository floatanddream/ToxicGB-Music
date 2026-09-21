import { defineStore } from 'pinia';
import type { Song, PlayMode } from '@/types/player';
import { MusicController } from '@/core/player/MusicController';
import { getSong } from '@/core/player/MusicService';
import { ref, watch } from 'vue';
import { watchDebounced } from '@vueuse/core';
import {
  EQ_BANDS,
  EQ_PRESETS,
  EQ_GAIN_MIN,
  EQ_GAIN_MAX,
  PLAYBACK_RATE_MIN,
  PLAYBACK_RATE_MAX,
  PITCH_MIN,
  PITCH_MAX,
  PITCH_DEFAULT,
} from '@/constants/audioEffects';

const player = new MusicController();

export const usePlayerStore = defineStore('player', () => {
  const playlist = ref<Song[]>([]);
  const currentSong = ref<Song | null>(null);
  const currentIndex = ref<number>(0);
  const isFullScreen = ref(false);

  const mode = ref<PlayMode>('loop');

  const playing = ref<boolean>(false);
  const currentTime = ref<number>(0);
  const duration = ref<number>(0);

  const loading = ref<boolean>(false);
  const volume = ref<number>(0.5);

  // 音效
  const eqPresetId = ref<string>('flat');
  const eqGains = ref<number[]>(EQ_BANDS.map(() => 0));
  const playbackRate = ref<number>(1);
  const preservesPitch = ref<boolean>(true);
  const pitchSemitones = ref<number>(PITCH_DEFAULT);

  // 随机播放队列
  // 随机顺序（存 song **id**，不是 playlist 下标 —— 理由见下方「随机队列管理」）
  const randomQueue = ref<string[]>([]);
  const randomIndex = ref<number>(0);

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
          pitchSemitones: pitchSemitones.value,
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
      // eqGains 与 eqPresetId 必须「一起生效、一起放弃」。
      // 频段数变更（5 → 10）后，旧存储里的 eqGains 长度不匹配会被下面的校验拒绝；
      // 此时若仍然恢复 eqPresetId，UI 会显示某个预设、而实际增益是平的。
      const eqGainsAccepted =
        Array.isArray(s.eqGains) &&
        s.eqGains.length === EQ_BANDS.length &&
        s.eqGains.every((g: unknown) => typeof g === 'number' && Number.isFinite(g));
      if (eqGainsAccepted) {
        eqGains.value = s.eqGains;
        if (typeof s.eqPresetId === 'string') {
          eqPresetId.value = s.eqPresetId;
        }
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
      if (
        typeof s.pitchSemitones === 'number' &&
        s.pitchSemitones >= PITCH_MIN &&
        s.pitchSemitones <= PITCH_MAX
      ) {
        pitchSemitones.value = s.pitchSemitones;
      }
    } catch {
      // 坏数据 / 旧版本结构 → 整体忽略，走默认值
    }
  };

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

    // 竞态判据之一：currentSong 的**对象引用**。用户在 await 期间重新点了同一首歌时，
    // switchSong / playByIndex 会把 currentSong 换成另一个对象，引用比较能识别出来；
    // 而 id 比较会把「重新点了同一首」误判成「什么都没发生」，让迟到的结果执行
    // player.loadSong()，把用户刚开始的播放重置掉（audio.load() 会退回 HAVE_NOTHING）。
    const isStale = () => currentSong.value !== song

    // 竞态判据之二：槽位。**引用没变只保证「用户没换歌」，不保证「槽位没变」** ——
    // playByIndex / replaceList / insertNext 都是「先改 currentIndex（replaceList 连整个
    // 数组一起换），await 之后才改 currentSong」，中间那段窗口正是「currentSong 还是这首歌、
    // 槽位却已经换人」。刷新后趁恢复请求在飞时点「播放全部」：replaceList 把 currentIndex 置 0
    // 并换掉整个队列，此时 isStale() 仍为假，于是刷新前那首歌会被写进新队列的同名槽位，
    // 随后 playByIndex(0) 就当它是待播歌曲 —— 最终播的是刷新前那首。所以槽位必须在
    // await 之前记下来，等结果回来另行核对。
    const restoredIndex = currentIndex.value

    // 「槽位仍是这首歌」用 **id** 判断，而不是像 isStale 那样比对象引用。
    // 原因：preloadNextSong()（loadQueue() 写 currentIndex 会连带触发它）会对槽位执行
    // playlist.value[i] = { ...song, url }，写出一个**同 id 的新对象**。若这里比引用，
    // 这条完全无害的重写会被误判成「槽位被换掉」，恢复路径静默放弃，audio 永远没有 src，
    // 用户点 ▶ 无反应 —— 正是本函数要消灭的症状。
    // 反向也成立：id 相等即同一首歌，写回不会错位（队列里同 id 重复出现时写回内容也相同）；
    // 而「用户重新点了同一首、播放已开始」这种必须放弃的情形，isStale() 已经拦住了
    // （playByIndex 写槽位与写 currentSong 之间没有 await，两者必在同一同步块内完成）。
    const slotIsOurs = () => playlist.value[restoredIndex]?.id === song.id

    // 失败兜底（VIP / 无版权 / 下架 / 网络抖动）：保留队列，但把 currentSong 置空。
    // 不能留着它 —— 界面显示着一首歌、audio.src 却是空的状态，用户点 ▶ 会静默无反应。
    // 不清快照：失败路径上 watcher 跟踪的几项都没变，不会触发重写，下次刷新会再试。
    // 「什么都没发生」的三重判据。任何一条不成立都说明用户插了一脚 —— 此时置空
    // currentSong 只会把用户刚点出来的状态抹掉（随后由用户那次操作填回，中间闪一下「未播放」）：
    //   isStale()         —— 用户换了歌，currentSong 已被换成别的对象
    //   currentIndex 变了 —— 用户点了另一首。playByIndex 是**先改索引**、await 之后才改
    //                        currentSong，所以那段窗口里 isStale() 仍为假、槽位也还没动，
    //                        只有索引能证明用户动了手
    //   槽位易主           —— 整个队列被换掉（replaceList），此时索引可能恰好没变
    const nothingHappened = () =>
      !isStale() && currentIndex.value === restoredIndex && slotIsOurs()

    const handleRestoreFailure = (err: unknown) => {
      if (!nothingHappened()) return
      currentSong.value = null
      console.warn('[playerStore] 恢复上次的歌曲失败，队列已保留:', err)
    }

    try {
      const fullSong = await getSong(song)

      // await 期间用户已经点了别的歌（或重新点了这首）→ 放弃，不要用迟到的结果覆盖用户的操作
      if (isStale()) return

      // await 期间槽位已经易主（replaceList / insertNext / playByIndex 的那段窗口）→ 整段放弃：
      // 不能写回（会把刷新前那首歌塞进新队列），也不该 player.loadSong()（用户已经在放别的歌了），
      // 连失败兜底都不该走 —— 它会把用户刚点出来的队列的 currentSong 置空。
      if (!slotIsOurs()) return

      // 拿不到 url **不是异常**：VIP / 无版权 / 下架时 /song/url/v1 返回 HTTP 200 且业务成功，
      // MusicService.fetchSong 取到 data[0]?.url === undefined 后正常 resolve，不会抛错。
      // 这类「业务成功但没有音源」必须并入失败路径，否则会把字面量字符串 "undefined"
      // 写进 audio.src，得到的正是「界面有歌、点 ▶ 静默无反应」。
      if (!fullSong.url) {
        handleRestoreFailure(new Error(`歌曲无可用音源（VIP / 无版权 / 下架）: ${song.id}`))
        return
      }

      // 走到这里说明「用户没换歌」且「槽位仍是这首歌」（两道判据都过了）→ 写回不会错位。
      // 槽位用上面记下的 restoredIndex，不用 currentIndex.value —— 后者在 await 期间可能已被改写。
      playlist.value[restoredIndex] = fullSong
      currentSong.value = fullSong
      player.loadSong(fullSong)
    } catch (err) {
      handleRestoreFailure(err)
    }
  }

  /* ---------------- 初始化 ---------------- */
  const init = () => {
    loadSettings();
    loadQueue(); // 恢复上次的队列与当前曲（同步，界面立即到位）

    player.setVolume(volume.value);
    player.setEqGains(eqGains.value);
    player.setPlaybackRate(playbackRate.value);
    player.setPreservesPitch(preservesPitch.value);
    player.setPitchSemitones(pitchSemitones.value);

    // 设置 MediaSession 控制
    player.setMediaSessionHandlers({
      onNext: () => next(),
      onPrevious: () => prev(),
      onSeek: (time: number) => seek(time)
    });

    player.on('play', () => {
      playing.value = true;
    });

    player.on('pause', () => {
      playing.value = false;
    });

    player.on('timeupdate', (t: number) => {
      currentTime.value = t;
    });

    player.on('loaded', (d: number) => {
      duration.value = d;
    });

    player.on('ended', () => {
      handleEnded();
    });

    // 预装当前曲。不 await —— init() 保持同步，不能拖住 app.mount()
    void loadRestoredCurrentSong();
  };

  /* ---------------- 🎲 随机队列管理 ----------------
   *
   * randomQueue 存的是 **song id**，不是 playlist 的下标。
   *
   * 为什么用 id：下标队列有一个强不变量「randomQueue[i] 必须始终是 playlist 的
   * 有效下标」，而 playlist 每次增删都会破坏它 —— 于是 replaceList / playSong /
   * insertNext 三处都得 resetRandomQueue() 补救（该函数已随本次重构删除），
   * 漏一处就静默播错歌。
   * 换成 id 之后这个不变量不再需要维护：队列里残留一个已删除的 id 也无害，
   * 播放时跳过即可。
   *
   * 「随机顺序」不做保留 —— 每次切到随机模式都重新洗牌。保留会引入
   * 「队列可能过时」这个新状态（顺序模式下插/删的歌不在队列里），
   * 需要额外的补齐逻辑，得不偿失。
   */

  /** 按 id 取 playlist 下标；歌已被删时返回 -1 */
  const indexOfSongId = (id: string) => playlist.value.findIndex((s) => s.id === id);

  /** 把 randomIndex 对齐到「当前正在播的那首歌」在队列中的位置 */
  const syncRandomIndex = () => {
    const id = currentSong.value?.id;
    if (id === undefined) return;
    const pos = randomQueue.value.indexOf(id);
    if (pos !== -1) randomIndex.value = pos;
  };

  /**
   * 重新洗牌。队列就是 playlist 的纯随机排列。
   *
   * ⚠️ 故意**不**把当前曲换到第 0 位 —— 那是「随机模式下回绕会重播上一首」的根源：
   * 旧实现把当前曲放在第 0 位，而所有调用方都把 index 0 当成「下一首」。
   * 现在当前曲在第几位就在第几位，由 syncRandomIndex() 对齐。
   */
  const generateRandomQueue = () => {
    const ids = playlist.value.map((s) => s.id);

    // Fisher-Yates 洗牌
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    }

    randomQueue.value = ids;
    syncRandomIndex();
  };

  /** 按 id 播放。id 已失效（歌被删）时静默跳过，不会播错歌。 */
  const playBySongId = (id: string | undefined) => {
    if (id === undefined) return;
    const index = indexOfSongId(id);
    if (index === -1) return;
    playByIndex(index);
  };

  /* ---------------- 🎵 播放控制 ---------------- */
  const playByIndex = async (index: number) => {
    if (index < 0 || index >= playlist.value.length) return;

    currentIndex.value = index;
    const song = playlist.value[index]!;
    const fullSong = await getSong(song);
    playlist.value[index] = fullSong;

    currentSong.value = fullSong;
    player.playSong(fullSong);

    if (mode.value === 'random') {
      syncRandomIndex();
    }
  };

  const next = () => {
    if (playlist.value.length === 0) return;

    if (mode.value === 'random') {
      if (randomQueue.value.length === 0) generateRandomQueue();

      randomIndex.value++;

      // 走到队列末尾 → 重新洗牌，并前进到「当前曲之后」的那一首。
      // generateRandomQueue 会把 randomIndex 对齐到当前曲，这里再 +1，
      // 否则回绕时会重播刚刚放完的那首。
      if (randomIndex.value >= randomQueue.value.length) {
        generateRandomQueue();
        randomIndex.value = (randomIndex.value + 1) % randomQueue.value.length;
      }

      playBySongId(randomQueue.value[randomIndex.value]);
    } else {
      let nextIndex = currentIndex.value + 1;
      if (nextIndex >= playlist.value.length) nextIndex = 0;
      playByIndex(nextIndex);
    }
  };

  const prev = () => {
    if (playlist.value.length === 0) return;

    if (mode.value === 'random') {
      if (randomQueue.value.length === 0) generateRandomQueue();

      randomIndex.value--;

      // 走到队列开头 → 重新洗牌，并退到「当前曲之前」的那一首
      if (randomIndex.value < 0) {
        generateRandomQueue();
        randomIndex.value =
          (randomIndex.value - 1 + randomQueue.value.length) % randomQueue.value.length;
      }

      playBySongId(randomQueue.value[randomIndex.value]);
    } else {
      let prevIndex = currentIndex.value - 1;
      if (prevIndex < 0) prevIndex = playlist.value.length - 1;
      playByIndex(prevIndex);
    }
  };

  const setMode = (modeValue: PlayMode) => {
    if (mode.value === modeValue) return;

    mode.value = modeValue;

    if (modeValue === 'random') {
      generateRandomQueue();
    }
  };

  const handleEnded = () => {
    if (mode.value === 'single') {
      player.play();
    } else {
      next();
    }
  };

  /* ---------------- 播放列表操作 ---------------- */
  const replaceList = async (list: Song[], index = 0) => {
    loading.value = true;
    try {
      playlist.value = [...list];
      currentIndex.value = index;
      // 整个列表被换掉了，旧的随机顺序不再有意义 —— 清空，让 next() 惰性重建
      randomQueue.value = [];
      randomIndex.value = 0;
      await preloadNextSong();
      playByIndex(index);
    } finally {
      loading.value = false;
    }
  };

  const playSong = async (song: Song) => {
    const fullSong = await getSong(song);
    playlist.value = [fullSong];
    currentIndex.value = 0;
    currentSong.value = fullSong;
    // 播放列表缩成一首，旧的随机顺序作废
    randomQueue.value = [];
    randomIndex.value = 0;
    player.playSong(fullSong);
  };

  const insertNext = async (song: Song) => {
    if (playlist.value.length === 0) {
      await playSong(song);
      return;
    }

    const existingIndex = playlist.value.findIndex(s => s.id === song.id);
    if (existingIndex !== -1) {
      playlist.value.splice(existingIndex, 1);
      if (existingIndex < currentIndex.value) {
        currentIndex.value--;
      }
    }

    const insertIndex = currentIndex.value + 1;
    const fullSong = await getSong(song);
    playlist.value.splice(insertIndex, 0, fullSong);

    // 随机模式下要让「刚插入的这首」成为下一首。
    // 队列存的是 id，所以上面 playlist 的增删本身不影响队列 —— 只需把新歌 id
    // 补插到当前项之后。若它已在队列里（上面的去重分支删掉了），先 filter 掉避免重复。
    // currentPos === -1（当前曲不在队列里）时新歌落到队首、randomIndex 置 -1，
    // 下一次 next() 的 ++ 正好落在它上面。
    if (mode.value === 'random' && randomQueue.value.length > 0) {
      const currentId = currentSong.value?.id;
      const rest = randomQueue.value.filter((id) => id !== fullSong.id);
      const currentPos = currentId === undefined ? -1 : rest.indexOf(currentId);
      rest.splice(currentPos + 1, 0, fullSong.id);
      randomQueue.value = rest;
      randomIndex.value = currentPos;
    }
  };

  const insertNextAndPlay = async (song: Song) => {
    await insertNext(song);
    next();
  };

  const switchSong = async (song: Song) => {
    const index = playlist.value.findIndex(s => s.id === song.id);
    if (index !== -1) {
      // 如果歌曲没有 URL，先获取
      if (!playlist.value[index]?.url) {
        const fullSong = await getSong(playlist.value[index]!);
        playlist.value[index] = fullSong;
      }
      playByIndex(index);
    };
  };

  /* ---------------- 基础控制 ---------------- */
  const play = () => {
    player.play();
  };

  const pause = () => {
    player.pause();
  };

  const toggle = () => {
    player.toggle();
  };

  const seek = (time: number) => {
    player.seek(time);
  };

  const setVolume = (v: number) => {
    v = v / 100;
    player.setVolume(v);
    volume.value = v;
  };

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

  const setPitchSemitones = (semitones: number) => {
    const clamped = Math.max(PITCH_MIN, Math.min(PITCH_MAX, semitones));
    pitchSemitones.value = clamped;
    player.setPitchSemitones(clamped);
  };

  /* ---------------- 预加载 ---------------- */
  const preloadNextSong = async () => {
    for(let i = currentIndex.value; i < currentIndex.value + 3; i++){
      if (i < playlist.value.length){
        if (playlist.value[i]?.url) continue;
        let songWithUrl: Song = await getSong(playlist.value[i]!);
        playlist.value[i] = songWithUrl;
      } else {
        break;
      };
    };
  };

  const setFullPlayer = (e : boolean) =>{
    isFullScreen.value = e;
  }

  watch(currentIndex, () => {
    preloadNextSong();
  });

  watchDebounced(
    () => ({
      volume: volume.value,
      eqPresetId: eqPresetId.value,
      eqGains: [...eqGains.value],
      playbackRate: playbackRate.value,
      preservesPitch: preservesPitch.value,
      pitchSemitones: pitchSemitones.value,
    }),
    persistSettings,
    { debounce: 300 },
  );

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
  );

  return {
    isFullScreen,
    volume,
    eqPresetId,
    eqGains,
    playbackRate,
    preservesPitch,
    pitchSemitones,
    playlist,
    currentSong,
    currentIndex,
    mode,
    playing,
    currentTime,
    duration,
    loading,
    // actions
    init,
    replaceList,
    playSong,
    insertNext,
    insertNextAndPlay,
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    setMode,
    setVolume,
    setEqPreset,
    setBandGain,
    setPlaybackRate,
    setPreservesPitch,
    setPitchSemitones,
    switchSong,
    setFullPlayer,
  };
});

export type playerStore = ReturnType<typeof usePlayerStore>;