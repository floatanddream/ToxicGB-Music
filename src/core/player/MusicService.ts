import { checkUrl, getSongUrl } from '@/api/song'
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

async function checkUrlValidity(url : string) {
  try {
    const response = await checkUrl(url);
    if (response.ok || response.status === 304) {
      return true;
    } else {
      console.log('URL 无效，状态码:', response.status);
      return false;
    }
  } catch (error) {
    console.log('请求失败，URL 无法访问:', error.message);
    return false;
  }
}

export async function getSong(song: Song): Promise<Song> {
  const cached = cache.get(song.id)
  if (cached 
    && !isUrlExpired(cached.fetchTime) 
    && cached.song.url 
    && await checkUrlValidity(cached.song.url)) {
    return cached.song
  }
  const songWithUrl = await fetchSong(song)
  cache.set(song.id, songWithUrl)
  return songWithUrl.song
}
