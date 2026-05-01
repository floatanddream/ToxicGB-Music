import { getSongUrl } from '@/api/song'
import type { Song } from '@/types/player'

const URL_EXPIRE_TIME = 5 * 60 * 1000 // 10分钟

interface CachedSong {
  song: Song
  fetchTime: number
}

const cache = new Map<number | string, CachedSong>()

function isUrlExpired(fetchTime: number): boolean {
  return Date.now() - fetchTime > URL_EXPIRE_TIME
}

async function fetchSong(song: Song): Promise<CachedSong> {
  const songData = await getSongUrl(song.id)
  return {
    song: { ...song, url: songData.data[0]?.url },
    fetchTime: Date.now(),
  }
}

export async function getSong(song: Song): Promise<Song> {
  const cached = cache.get(song.id)
  if (cached && !isUrlExpired(cached.fetchTime)) {
    return cached.song
  }
  const songWithUrl = await fetchSong(song)
  cache.set(song.id, songWithUrl)
  return songWithUrl.song
}
