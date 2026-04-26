import type { Song } from '@/types/player'

type EventCallback = (...args: any[]) => void

// MediaSession handlers type
type MediaSessionHandlers = {
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
}

export class MusicController {
  private audio: HTMLAudioElement
  private events: Map<string, EventCallback[]> = new Map()
  private mediaSessionHandlers: MediaSessionHandlers | null = null

  constructor() {
    this.audio = new Audio();
    this.initEvents()
    this.initMediaSession()
  }

  /* ---------------- 初始化 ---------------- */
  private initEvents() {
    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', this.audio.currentTime)
    })

    this.audio.addEventListener('play', () => {
      this.emit('play')
      this.updateMediaSessionPlaybackState()
    })

    this.audio.addEventListener('pause', () => {
      this.emit('pause')
      this.updateMediaSessionPlaybackState()
    })

    this.audio.addEventListener('ended', () => {
      this.emit('ended')
    })

    this.audio.addEventListener('loadedmetadata', () => {
      this.emit('loaded', this.audio.duration)
    })
  }

  /* ---------------- MediaSession ---------------- */
  private initMediaSession() {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: '',
      artist: '',
      album: '',
      artwork: []
    })

    navigator.mediaSession.setActionHandler('play', () => {
      this.play()
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      this.pause()
    })

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      this.mediaSessionHandlers?.onNext()
    })

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      this.mediaSessionHandlers?.onPrevious()
    })

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const newTime = Math.max(0, this.audio.currentTime - (details.seekOffset || 10))
      this.mediaSessionHandlers?.onSeek(newTime)
    })

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const newTime = Math.min(this.audio.duration, this.audio.currentTime + (details.seekOffset || 10))
      this.mediaSessionHandlers?.onSeek(newTime)
    })

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        this.mediaSessionHandlers?.onSeek(details.seekTime)
      }
    })
  }

  private updateMediaSessionMetadata(song: Song) {
    if (!('mediaSession' in navigator)) return

    const artwork: MediaImage[] = song.cover
      ? [{ src: song.cover, sizes: '512x512', type: 'image/jpeg' }]
      : []

    const artistName = song.artist?.map(a => a.name).join(', ') || ''

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: artistName,
      album: song.album?.title || '',
      artwork
    })
  }

  private updateMediaSessionPlaybackState() {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = this.audio.paused ? 'paused' : 'playing'
  }

  setMediaSessionHandlers(handlers: MediaSessionHandlers) {
    this.mediaSessionHandlers = handlers
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
    this.updateMediaSessionMetadata(song)
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