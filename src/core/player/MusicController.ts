import type { Song } from '@/types/player'
import { EQ_BANDS } from '@/constants/audioEffects'
import { SoundTouchNode } from '@soundtouchjs/audio-worklet'
// ?url 让 Vite 输出 worklet 脚本的原样 URL，不做模块转换
import soundTouchProcessorUrl from '@soundtouchjs/audio-worklet/processor?url'

// AudioParam 斜坡时间常数（秒）。EQ 增益与音调都靠它做平滑 ——
// 拖动滑块时每一步都是一次参数跳变，直接写 .value 会听到细碎的「zipper」爆音。
const PARAM_RAMP_SECONDS = 0.01

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
  private ctx: AudioContext | null = null
  private filters: BiquadFilterNode[] = []
  private eqGains: number[] = EQ_BANDS.map(() => 0)
  private pitchNode: SoundTouchNode | null = null
  private pitchReady = false
  private pitchSemitones = 0

  constructor() {
    this.audio = new Audio();
    // 必须在首次设置 src 之前指定：Web Audio 的 MediaElementAudioSourceNode
    // 对「跨域且未经 CORS 批准」的媒体资源会强制输出静音（不报错）。
    // 用 'anonymous' 而非 'use-credentials' —— CDN 返回的是
    // Access-Control-Allow-Origin: *，与带凭据模式互斥，后者会被浏览器拒绝。
    this.audio.crossOrigin = 'anonymous'
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

    // 媒体加载失败（CDN 403/404、地址过期、CORS 被拒）。
    // 这里**只负责透出事件** —— 重试 / 跳过 / 提示是播放策略，属于 store；
    // 放进这个纯音频控制器会让它承担不该由它做的决策。
    this.audio.addEventListener('error', () => {
      this.emit('error', this.audio.error)
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
  /**
   * 搭建 Web Audio 音频图。幂等 —— 只会在首次调用时真正建图。
   *
   * 注意：createMediaElementSource 对每个 audio 元素一生只能调用一次，
   * 因此整条接线必须集中在此处，且靠 this.ctx 判空保证不重复执行。
   */
  private ensureGraph() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }

    try {
      this.ctx = new AudioContext()

      let node: AudioNode = this.ctx.createMediaElementSource(this.audio)

      this.filters = EQ_BANDS.map((band, i) => {
        const filter = this.ctx!.createBiquadFilter()
        filter.type = band.type
        filter.frequency.value = band.frequency
        filter.Q.value = band.Q
        filter.gain.value = this.eqGains[i] ?? 0 // 回放已保存的增益
        node.connect(filter)
        node = filter
        return filter
      })

      node.connect(this.ctx.destination)

      this.loadPitchWorklet()

      if (this.ctx.state === 'suspended') void this.ctx.resume()
    } catch (err) {
      // 降级：无音效，但不影响播放。
      // 必须留痕 —— 音频图失败的症状是「静音且不报错」，
      // 没有这条日志就无法区分「图没建成」与「图建成但没声音」。
      console.warn('[MusicController] Web Audio 音频图搭建失败，已降级为无音效播放:', err)
      this.ctx = null
      this.filters = []
    }
  }

  /** 预热 SoundTouch worklet 模块。失败只降级为「无变调」，不影响播放。 */
  private loadPitchWorklet() {
    if (!this.ctx || this.pitchReady) return
    SoundTouchNode.register(this.ctx, soundTouchProcessorUrl)
      .then(() => {
        this.pitchReady = true
        // 若此时已有非 0 音调（例如从 localStorage 恢复），立即补插节点
        if (this.pitchSemitones !== 0) this.attachPitchNode()
      })
      .catch((err) => {
        console.warn('[MusicController] 变调 worklet 注册失败，音调调节不可用:', err)
      })
  }

  /**
   * 把链路改接为 ...filters → pitchNode → destination。
   *
   * 懒插入不只是省资源 —— SoundTouch 即使在 0 半音下也有 50–125ms 的
   * WSOLA 内部缓冲延迟，常驻链路会让音频与进度条 / 歌词整体错位。
   */
  private attachPitchNode() {
    if (this.pitchNode || !this.ctx || !this.pitchReady) return
    const tail = this.filters[this.filters.length - 1]
    if (!tail) return
    try {
      const node = new SoundTouchNode({ context: this.ctx, outputChannelCount: 2 })
      node.pitchSemitones.value = this.pitchSemitones
      tail.disconnect()
      tail.connect(node)
      node.connect(this.ctx.destination)
      this.pitchNode = node
    } catch (err) {
      console.warn('[MusicController] 变调节点插入失败，音调调节不可用:', err)
      this.pitchNode = null
      // 插节点中途失败会让 tail 处于「已 disconnect 但未接回」的状态 —— 必须恢复，
      // 否则整条链路断掉、直接没声音。
      try {
        tail.disconnect()
      } catch {
        /* tail 可能已断开，忽略 */
      }
      tail.connect(this.ctx.destination)
    }
  }

  /** 把节点摘出链路，恢复为 ...filters → destination（0 音调下逐样本与原声一致）。 */
  private detachPitchNode() {
    if (!this.pitchNode || !this.ctx) return
    const tail = this.filters[this.filters.length - 1]
    try {
      this.pitchNode.disconnect()
      this.pitchNode = null
      if (tail) {
        tail.disconnect()
        tail.connect(this.ctx.destination)
      }
    } catch (err) {
      console.warn('[MusicController] 变调节点移除失败:', err)
    }
  }

  private load(song: Song) {
    this.audio.src = song.url!
    this.audio.load()
    this.updateMediaSessionMetadata(song)
    this.emit('songchange', song)
  }

  /**
   * 只装载、不播放。
   *
   * 用途：刷新后把上次的歌曲预先灌进 <audio>，这样用户点 ▶ 时
   * MusicController.play() 不必变成 async —— 自动播放策略要求 audio.play()
   * 落在用户手势的同步路径上，而解析 URL 是异步的，塞不进那条路径。
   */
  loadSong(song: Song) {
    this.load(song)
  }

  playSong(song: Song) {
    this.loadSong(song)
    this.play()
  }

  play() {
    // 必须保持同步，不能改成 async + await ctx.resume()：
    // 自动播放策略要求 audio.play() 发生在用户手势的同步路径上，
    // 一旦 await 就掉进微任务、手势令牌可能失效，首次播放会无声。
    this.ensureGraph()
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

  setEqGains(gains: number[]) {
    this.eqGains = [...gains]
    if (!this.ctx) return // 图未建：值已存进 this.eqGains，建图时会回放
    const now = this.ctx.currentTime
    this.filters.forEach((filter, i) => {
      const gain = this.eqGains[i]
      if (gain !== undefined) filter.gain.setTargetAtTime(gain, now, PARAM_RAMP_SECONDS)
    })
  }

  setPlaybackRate(rate: number) {
    // 两个都要写：媒体加载算法（load()）会把 playbackRate 重置为 defaultPlaybackRate。
    // 只写 playbackRate 而不写 defaultPlaybackRate，换歌时倍速会被重置回 1。
    this.audio.defaultPlaybackRate = rate
    this.audio.playbackRate = rate
  }

  setPreservesPitch(enabled: boolean) {
    const audio = this.audio as HTMLAudioElement & {
      webkitPreservesPitch?: boolean
      mozPreservesPitch?: boolean
    }
    // 用 typeof 判存而非 `in`：lib.dom 里 HTMLAudioElement.preservesPitch 是必选属性，
    // `in` 的 else 分支会被收窄成 never，导致后两个前缀分支无法赋值。
    if (typeof audio.preservesPitch === 'boolean') audio.preservesPitch = enabled
    else if (typeof audio.webkitPreservesPitch === 'boolean') audio.webkitPreservesPitch = enabled
    else if (typeof audio.mozPreservesPitch === 'boolean') audio.mozPreservesPitch = enabled
  }

  setPitchSemitones(semitones: number) {
    this.pitchSemitones = semitones
    if (semitones === 0) {
      // 必须整体摘掉节点，而不是把参数设成 0：
      // SoundTouch 在 0 半音下仍有 50–125ms 的 WSOLA 缓冲延迟，留在链路里
      // 会让音频与进度条 / 歌词错位。摘掉才能保证 0 音调下逐样本与原声一致。
      this.detachPitchNode()
      return
    }
    this.attachPitchNode()
    this.pitchNode?.pitchSemitones.setTargetAtTime(semitones, this.ctx!.currentTime, PARAM_RAMP_SECONDS)
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