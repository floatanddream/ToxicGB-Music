import { checkUrl, getSongUrl } from '@/api/song'
import type { Song } from '@/types/player'

interface CachedSong {
  song: Song
}

const cache = new Map<number | string, CachedSong>()

async function fetchSong(song: Song): Promise<CachedSong> {
  const songData = await getSongUrl(song.id)
  return {
    song: { ...song, url: songData.data[0]?.url },
  }
}

export async function checkUrlValidity(url : string) {
  try {
    const response = await checkUrl(url);
    if (response.ok || response.status === 304) {
      console.log(response)
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
  if (cached?.song.url && await checkUrlValidity(cached.song.url)) {
    return cached.song
  }
  const songWithUrl = await fetchSong(song)
  cache.set(song.id, songWithUrl)
  return songWithUrl.song
}
