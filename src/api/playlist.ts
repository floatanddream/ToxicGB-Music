import request from '@/utils/request'

export async function getPlaylistDetail(playlistId: string) {
  return await request.get(`/playlist/detail?id=${playlistId}`)
}
