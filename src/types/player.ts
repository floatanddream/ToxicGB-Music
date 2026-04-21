import type * as MusicType from '@/types/musicTypes';

export type PlayMode = 'loop' | 'single' | 'random';

export interface Song extends MusicType.Song {
  url?: string
};

export type SongLoader = (id: number | string) => Promise<Song>