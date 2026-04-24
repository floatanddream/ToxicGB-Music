import { defineStore } from 'pinia';
import type { Song, PlayMode } from '@/types/player';
import { MusicController } from '@/core/player/MusicController';
import { getSong } from '@/core/player/MusicService';
import { ref, watch } from 'vue';

const player = new MusicController();

export const usePlayerStore = defineStore('player', () => {
  const playlist = ref<Song[]>([]);
  const currentSong = ref<Song | null>(null);
  const currentIndex = ref<number>(0);

  const mode = ref<PlayMode>('loop');

  const playing = ref<boolean>(false);
  const currentTime = ref<number>(0);
  const duration = ref<number>(0);

  const loading = ref<boolean>(false);
  const volume = ref<number>(0.5);

  // 随机播放队列
  const randomQueue = ref<number[]>([]);
  const randomIndex = ref<number>(0);

  /* ---------------- 初始化 ---------------- */
  const init = () => {
    player.setVolume(volume.value);

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
  const playByIndex = (index: number) => {
    if (index < 0 || index >= playlist.value.length) return;

    currentIndex.value = index;
    const song = playlist.value[index]!;

    currentSong.value = song;
    player.playSong(song);

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
      playlist.value = list;
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
    const insertIndex = currentIndex.value + 1;
    const fullSong = await getSong(song);
    playlist.value.splice(insertIndex, 0, fullSong);
    resetRandomQueue();
  };

  const insertNextAndPlay = async (song: Song) => {
    await insertNext(song);
    next();
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

  watch(currentIndex, () => {
    preloadNextSong();
  });

  return {
    volume,
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
  };
});

export type playerStore = ReturnType<typeof usePlayerStore>;