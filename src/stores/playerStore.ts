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
  const randomQueue = ref<number[]>([]);
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

  /* ---------------- 🎲 随机队列管理 ---------------- */
  const resetRandomQueue = () => {
    randomQueue.value = [];
    randomIndex.value = 0;
  };

  const generateRandomQueue = () => {
    const len = playlist.value.length;
    randomQueue.value = Array.from({ length: len }, (_, i) => i);

    // Fisher-Yates 洗牌
    for (let i = len - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomQueue.value[i]!, randomQueue.value[j]!] = [randomQueue.value[j]!, randomQueue.value[i]!];
    }

    // 当前歌曲放到第一位
    if (currentIndex.value !== -1) {
      const pos = randomQueue.value.indexOf(currentIndex.value);
      [randomQueue.value[0]!, randomQueue.value[pos]!] = [randomQueue.value[pos]!, randomQueue.value[0]!];
    }

    randomIndex.value = 0;
  };

  const syncRandomIndex = () => {
    const pos = randomQueue.value.indexOf(currentIndex.value);
    if (pos !== -1) randomIndex.value = pos;
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
      randomIndex.value++;

      if (randomIndex.value >= randomQueue.value.length) {
        generateRandomQueue();
      }

      playByIndex(randomQueue.value[randomIndex.value]!);
    } else {
      let nextIndex = currentIndex.value + 1;
      if (nextIndex >= playlist.value.length) nextIndex = 0;
      playByIndex(nextIndex);
    }
  };

  const prev = () => {
    if (playlist.value.length === 0) return;

    if (mode.value === 'random') {
      randomIndex.value--;

      if (randomIndex.value < 0) {
        generateRandomQueue();
        randomIndex.value = randomQueue.value.length - 1;
      }

      playByIndex(randomQueue.value[randomIndex.value]!);
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
      resetRandomQueue();
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
    resetRandomQueue();
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
    resetRandomQueue();
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