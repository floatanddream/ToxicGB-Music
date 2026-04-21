import { defineStore } from 'pinia'
import type { Song, PlayMode } from '@/types/player'
import { MusicController } from '@/core/player/musicController'
import { getSong } from '@/core/player/MusicService'

// 🎧 单例播放器（不要在 store 里 new 多次）
const player = new MusicController()

export const usePlayerStore = defineStore('player', {
  state: () => ({
    playlist: [] as Song[],
    currentSong: null as Song | null,
    currentIndex: -1,

    mode: 'loop' as PlayMode,

    playing: false,
    currentTime: 0,
    duration: 0,

    loading: false
  }),

  actions: {
    /* ---------------- 初始化（只执行一次）---------------- */
    init() {
      player.on('songchange', (song: Song) => {
        this.currentSong = song
        this.currentIndex = player.getCurrentIndex()
      })

      player.on('play', () => {
        this.playing = true
      })

      player.on('pause', () => {
        this.playing = false
      })

      player.on('timeupdate', (t: number) => {
        this.currentTime = t
      })

      player.on('loaded', (d: number) => {
        this.duration = d
      })

      player.on('modechange', (m: PlayMode) => {
        this.mode = m
      })
    },

    /* ---------------- 🎯 播放歌单（核心）---------------- */
    async playList(list: Song[], index = 0) {
      this.loading = true

      try {
        // 🎧 当前歌曲（必须有 url）
        const current = await getSong(list[index])

        const playlist: Song[] = [current]

        // 🎯 下一首（预加载，提升体验）
        const next = list[index + 1]
          ? await getSong(list[index + 1])
          : null

        if (next) playlist.push(next)

        this.playlist = playlist

        player.setPlaylist(playlist)
        player.playByIndex(0)

        this.currentIndex = index
        this.currentSong = current

        // 🚀 后台预加载第3首（不阻塞）
        const third = list[index + 2]
        if (third) {
          getSong(third)
        }

      } finally {
        this.loading = false
      }
    },

    /* ---------------- 🎯 播放单曲 ---------------- */
    async playSong(song: Song) {
      const fullSong = await getSong(song)

      this.playlist = [fullSong]
      this.currentIndex = 0
      this.currentSong = fullSong

      player.setPlaylist([fullSong])
      player.playByIndex(0)
    },

    /* ---------------- 控制 ---------------- */
    play() {
      player.play()
    },

    pause() {
      player.pause()
    },

    toggle() {
      player.toggle()
    },

    next() {
      player.next()
    },

    prev() {
      player.prev()
    },

    seek(time: number) {
      player.seek(time)
    },

    setMode(mode: PlayMode) {
      player.setMode(mode)
    },

    setVolume(v: number) {
      player.setVolume(v)
    }
  }
})