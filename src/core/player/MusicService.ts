import { getSongUrl } from '@/api/song';
import type { Song } from '@/types/player'

const cache = new Map<number | string, Song>()

async function fetchSong(song: Song): Promise<Song> {
  const songData = await getSongUrl(song.id);
  return {
    ...song,
    url: songData.data[0]?.url,
  };
}

export async function getSong(song: Song): Promise<Song> {
  if (cache.has(song.id)) {
    return cache.get(song.id)!
  };
  const songWithUrl = await fetchSong(song);
  cache.set(song.id, songWithUrl);
  return songWithUrl;
}