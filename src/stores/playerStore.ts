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

  /* ---------------- 初始化 ---------------- */
  const init = () => {
    loadSettings();

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