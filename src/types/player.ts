import type * as MusicType from '@/types/musicTypes';

export type PlayMode = 'loop' | 'single' | 'random';

export interface Song extends MusicType.Song {
  url?: string
  /**
   * MV id。`0` 表示这首歌没有 MV，`undefined` 表示「还没查过」——
   * 两者不能混：没有 MV 的歌也要把 0 记下来，否则每次换回这首歌都会重查一遍。
   */
  mvid?: number
  /** MV 播放地址。与 url 同类：带时效的 CDN 直链，只在内存里活，不进持久化快照。 */
  mvUrl?: string
}

export type SongLoader = (id: number | string) => Promise<Song>