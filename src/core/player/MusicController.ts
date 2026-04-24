import type { Song } from '@/types/player'

type EventCallback = (...args: any[]) => void

export class MusicController {
  private audio: HTMLAudioElement
  private events: Map<string, EventCallback[]> = new Map()

  constructor() {
    this.audio = new Audio();
    this.initEvents()
  }

  /* ---------------- 初始化 ---------------- */
  private initEvents() {
    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', this.audio.currentTime)
    })

    this.audio.addEventListener('play', () => {
      this.emit('play')
    })

    this.audio.addEventListener('pause', () => {
      this.emit('pause')
    })

    this.audio.addEventListener('ended', () => {
      this.emit('ended')
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
    this.audio.src = song.url!
    this.audio.load()
    this.emit('songchange', song)
  }

  playSong(song: Song) {
    this.load(song)
    this.play()
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

  /* ---------------- 状态查询 ---------------- */
  getCurrentTime() {
    return this.audio.currentTime
  }

  getDuration() {
    return this.audio.duration
  }

  isPlaying() {
    return !this.audio.paused
  }
}