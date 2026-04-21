import type { Song, PlayMode } from '@/types/player'

type EventCallback = (...args: any[]) => void

export class MusicController {
  private audio: HTMLAudioElement

  private playlist: Song[] = []
  private currentIndex: number = -1

  private mode: PlayMode = 'loop'
  private events: Map<string, EventCallback[]> = new Map()

  // 🎲 随机播放队列（存 index，不存 Song）
  private randomQueue: number[] = []
  private randomIndex: number = 0

  // 当前歌曲缓存
  private currentSong: Song | null = null

  constructor() {
    this.audio = new Audio()
    this.initEvents()
  }

  /* ---------------- 初始化 ---------------- */
  private initEvents() {
    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', this.audio.currentTime)
    })

    this.audio.addEventListener('ended', () => {
      this.handleEnded()
    })

    this.audio.addEventListener('play', () => {
      this.emit('play')
    })

    this.audio.addEventListener('pause', () => {
      this.emit('pause')
    })

    this.audio.addEventListener('loadedmetadata', () => {
      this.emit('loaded', this.audio.duration)
    })
  }

  /* ---------------- 事件系统 ---------------- */
  on(event: string, cb: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(cb)
  }

  off(event: string, cb: EventCallback) {
    const list = this.events.get(event)
    if (!list) return
    this.events.set(
      event,
      list.filter((fn) => fn !== cb),
    )
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach((cb) => cb(...args))
  }

  /* ---------------- 播放控制 ---------------- */
  private load(song: Song) {
    this.currentSong = song

    this.audio.src = song.url!
    this.audio.load()

    this.emit('songchange', song)
  }

  play() {
    this.audio.play()
  }

  pause() {
    this.audio.pause()
  }

  toggle() {
    this.audio.paused ? this.play() : this.pause()
  }

  seek(time: number) {
    this.audio.currentTime = time
  }

  setVolume(volume: number) {
    this.audio.volume = Math.max(0, Math.min(1, volume))
  }

  /* ---------------- 播放列表 ---------------- */
  setPlaylist(list: Song[]) {
    this.playlist = list
    this.resetRandomQueue()
  }

  playByIndex(index: number) {
    if (index < 0 || index >= this.playlist.length) return

    this.currentIndex = index
    const song = this.playlist[index]!

    this.load(song)
    this.play()

    if (this.mode === 'random') {
      this.syncRandomIndex()
    }
  }

  next() {
    if (this.playlist.length === 0) return

    if (this.mode === 'random') {
      this.randomIndex++

      if (this.randomIndex >= this.randomQueue.length) {
        this.generateRandomQueue()
      }

      this.playByIndex(this.randomQueue[this.randomIndex]!)
    } else {
      let nextIndex = this.currentIndex + 1
      if (nextIndex >= this.playlist.length) nextIndex = 0
      this.playByIndex(nextIndex)
    }
  }

  prev() {
    if (this.playlist.length === 0) return

    if (this.mode === 'random') {
      this.randomIndex--

      if (this.randomIndex < 0) {
        this.generateRandomQueue()
        this.randomIndex = this.randomQueue.length - 1
      }

      this.playByIndex(this.randomQueue[this.randomIndex]!)
    } else {
      let prevIndex = this.currentIndex - 1
      if (prevIndex < 0) prevIndex = this.playlist.length - 1
      this.playByIndex(prevIndex)
    }
  }

  setMode(mode: PlayMode) {
    if (this.mode === mode) return

    this.mode = mode

    if (mode === 'random') {
      this.generateRandomQueue()
    }

    this.emit('modechange', mode)
  }

  private handleEnded() {
    if (this.mode === 'single') {
      this.play()
    } else {
      this.next()
    }
  }

  /* ---------------- 🎲 随机队列 ---------------- */
  private resetRandomQueue() {
    this.randomQueue = []
    this.randomIndex = 0
  }

  private generateRandomQueue() {
  const len = this.playlist.length
  this.randomQueue = Array.from({ length: len }, (_, i) => i)

  // Fisher-Yates 洗牌
  for (let i = len - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [this.randomQueue[i]!, this.randomQueue[j]!] = [this.randomQueue[j]!, this.randomQueue[i]!]
  }

  // 当前歌曲放到第一位
  if (this.currentIndex !== -1) {
    const pos = this.randomQueue.indexOf(this.currentIndex);
    [this.randomQueue[0]!, this.randomQueue[pos]!] = [this.randomQueue[pos]!, this.randomQueue[0]!]
  }

  this.randomIndex = 0
}


  private syncRandomIndex() {
    const pos = this.randomQueue.indexOf(this.currentIndex)
    if (pos !== -1) this.randomIndex = pos
  }

  /* ---------------- 状态 ---------------- */
  getCurrentSong() {
    return this.currentSong
  }

  getCurrentTime() {
    return this.audio.currentTime
  }

  getDuration() {
    return this.audio.duration
  }

  getCurrentIndex() {
    return this.currentIndex
  }

  isPlaying() {
    return !this.audio.paused
  }

  getMode() {
    return this.mode
  }

  getPlaylist() {
    return this.playlist
  }
}
