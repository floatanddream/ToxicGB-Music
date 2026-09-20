export interface EqBand {
  key: string
  label: string
  type: BiquadFilterType
  frequency: number
  Q: number
}

export interface EqPreset {
  id: string
  label: string
  gains: readonly number[]
}

/**
 * 10 段均衡器，中心频率按一个倍频程递进（31 Hz ~ 16 kHz）。
 *
 * Q 取 1.4 —— 这是「恒定 Q」图示均衡器的标准值：相邻频段正好相隔一个倍频程，
 * Q = 1.41 时每段带宽约一个倍频程，段间交叠最小。
 * 首尾两端用 shelf 而非 peaking：31 Hz 以下 / 16 kHz 以上没有相邻频段可交叠，
 * shelf 更贴合「整体抬高低频 / 高频」的听感。
 */
export const EQ_BANDS: readonly EqBand[] = [
  { key: 'b31', label: '31', type: 'lowshelf', frequency: 31, Q: 0.7 },
  { key: 'b63', label: '63', type: 'peaking', frequency: 63, Q: 1.4 },
  { key: 'b125', label: '125', type: 'peaking', frequency: 125, Q: 1.4 },
  { key: 'b250', label: '250', type: 'peaking', frequency: 250, Q: 1.4 },
  { key: 'b500', label: '500', type: 'peaking', frequency: 500, Q: 1.4 },
  { key: 'b1k', label: '1k', type: 'peaking', frequency: 1000, Q: 1.4 },
  { key: 'b2k', label: '2k', type: 'peaking', frequency: 2000, Q: 1.4 },
  { key: 'b4k', label: '4k', type: 'peaking', frequency: 4000, Q: 1.4 },
  { key: 'b8k', label: '8k', type: 'peaking', frequency: 8000, Q: 1.4 },
  { key: 'b16k', label: '16k', type: 'highshelf', frequency: 16000, Q: 0.7 },
] as const

/**
 * 预设曲线。每个 gains 的长度**必须**等于 EQ_BANDS.length（当前 10），
 * 顺序与 EQ_BANDS 一一对应（低频 → 高频）。单位 dB。
 *
 * 曲线设计取向：相邻预设之间要有可听辨的差异，避免「爵士/古典」这种
 * 几乎一样的凑数项。
 */
export const EQ_PRESETS: readonly EqPreset[] = [
  //              31  63  125 250 500  1k   2k   4k   8k   16k
  { id: 'flat', label: '原声', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'bass', label: '低音增强', gains: [8, 7, 5, 3, 1, 0, 0, 0, 0, 0] },
  { id: 'treble', label: '高音增强', gains: [0, 0, 0, 0, 0, 0, 2, 4, 6, 8] },
  { id: 'loudness', label: '等响', gains: [8, 6, 4, 0, -2, -1, 0, 2, 5, 7] },
  { id: 'vocal', label: '人声', gains: [-4, -3, -1, 1, 3, 4, 4, 3, 1, -1] },
  { id: 'pop', label: '流行', gains: [-1, 0, 1, 2, 3, 3, 2, 1, 0, -1] },
  { id: 'rock', label: '摇滚', gains: [6, 5, 3, 0, -2, -1, 2, 4, 5, 5] },
  { id: 'jazz', label: '爵士', gains: [4, 3, 2, 1, -1, -1, 0, 2, 3, 3] },
  { id: 'classical', label: '古典', gains: [4, 3, 2, 0, 0, 0, 0, 2, 4, 5] },
  { id: 'electronic', label: '电子', gains: [5, 4, 2, 0, -1, 0, 1, 3, 4, 4] },
  { id: 'dance', label: '舞曲', gains: [7, 6, 3, -1, -1, -1, 1, 3, 5, 4] },
  { id: 'night', label: '夜间', gains: [-5, -4, -2, -1, 0, 1, 2, 2, 1, -1] },
] as const

export const EQ_GAIN_MIN = -12
export const EQ_GAIN_MAX = 12
export const PLAYBACK_RATE_MIN = 0.1
export const PLAYBACK_RATE_MAX = 5
export const PITCH_MIN = -12
export const PITCH_MAX = 12
export const PITCH_DEFAULT = 0
