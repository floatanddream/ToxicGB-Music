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

export const EQ_BANDS: readonly EqBand[] = [
  { key: 'low', label: '60Hz', type: 'lowshelf', frequency: 60, Q: 0.7 },
  { key: 'lowMid', label: '230Hz', type: 'peaking', frequency: 230, Q: 1.0 },
  { key: 'mid', label: '910Hz', type: 'peaking', frequency: 910, Q: 1.0 },
  { key: 'highMid', label: '3.6k', type: 'peaking', frequency: 3600, Q: 1.0 },
  { key: 'high', label: '14k', type: 'highshelf', frequency: 14000, Q: 0.7 },
] as const

export const EQ_PRESETS: readonly EqPreset[] = [
  { id: 'flat', label: '原声', gains: [0, 0, 0, 0, 0] },
  { id: 'bass', label: '低音增强', gains: [6, 4, 0, -1, 0] },
  { id: 'vocal', label: '人声', gains: [-2, 0, 3, 3, 1] },
  { id: 'rock', label: '摇滚', gains: [4, 2, -1, 2, 3] },
  { id: 'classical', label: '古典', gains: [0, 0, 0, 1, 4] },
] as const

export const EQ_GAIN_MIN = -12
export const EQ_GAIN_MAX = 12
export const PLAYBACK_RATE_MIN = 0.1
export const PLAYBACK_RATE_MAX = 5
export const PITCH_MIN = -12
export const PITCH_MAX = 12
export const PITCH_DEFAULT = 0
