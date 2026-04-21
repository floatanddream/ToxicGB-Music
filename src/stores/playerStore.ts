import { defineStore } from 'pinia';
import type { Song, PlayMode } from '@/types/player';
import { MusicController } from '@/core/player/musicController';
import { getSong } from '@/core/player/MusicService';
import { ref,watch } from 'vue';

// 🎧 单例播放器（不要在 store 里 new 多次）
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

  /* ---------------- 初始化（只执行一次）---------------- */
  const init = () => {
    player.on('songchange', (song: Song) => {
      currentSong.value = song;
      currentIndex.value = player.getCurrentIndex();
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

    player.on('modechange', (m: PlayMode) => {
      mode.value = m;
    });
  };

  // const replaceList = async (list: Song[], index = 0) => {
  //   loading.value = true;

  //   try {
  //     // 🎧 当前歌曲（必须有 url）
  //     const current = await getSong(list[index]!);

  //     const newPlaylist: Song[] = [current];

  //     // 🎯 下一首（预加载，提升体验）
  //     const next = list[index + 1]
  //       ? await getSong(list[index + 1]!)
  //       : null;

  //     if (next) newPlaylist.push(next);

  //     playlist.value = newPlaylist;

  //     player.setPlaylist(newPlaylist);
  //     player.playByIndex(0);

  //     currentIndex.value = index;
  //     currentSong.value = current;

  //     // 🚀 后台预加载第3首（不阻塞）
  //     const third = list[index + 2];
  //     if (third) {
  //       getSong(third);
  //     }

  //   } finally {
  //     loading.value = false;
  //   }
  // };

  const replaceList = async (list: Song[], index = 0) => {
    loading.value = true;
    try{
      playlist.value = list;
      currentIndex.value = index;
      await preloadNextSong();
      player.playByIndex(index);
    }finally{
      loading.value = false;
    }
  };
  /* ---------------- 🎯 播放单曲 ---------------- */
  const playSong = async (song: Song) => {
    const fullSong = await getSong(song);

    playlist.value = [fullSong];
    currentIndex.value = 0;
    currentSong.value = fullSong;

    player.setPlaylist([fullSong]);
    player.playByIndex(0);
  };

  /* ---------------- 控制 ---------------- */
  const play = () => {
    player.play();
  };

  const pause = () => {
    player.pause();
  };

  const toggle = () => {
    player.toggle();
  };

  const next = () => {
    player.next();
  };

  const prev = () => {
    player.prev();
  };

  const seek = (time: number) => {
    player.seek(time);
  };

  const setMode = (modeValue: PlayMode) => {
    player.setMode(modeValue);
  };

  const setVolume = (v: number) => {
    player.setVolume(v);
  };

  const preloadNextSong = async () =>{
    //index变化时，预加载后面3首歌,当后面无3首歌时那么自动加载
    for(let i=currentIndex.value;i<currentIndex.value+3;i++){
      if(i<playlist.value.length){
        //如有已有url
        if (playlist.value[i]?.url) continue;
        //获取url
        let songWithUrl:Song = await getSong(playlist.value[i]!);
        playlist.value[i] = songWithUrl;

      }else{
        break;
      };
    };
     player.setPlaylist(playlist.value)
  }

  watch(currentIndex,()=>{
   preloadNextSong();
  });

  return {
    // state
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