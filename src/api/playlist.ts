import request from '@/utils/request'

export async function getPlaylistDetail(playlistId: string) {
  return await request.get(`/playlist/detail?id=${playlistId}`, { sendCookie: true })
}

export interface PlaylistParams {
  id: string | number
  limit?: number
  offset?: number
  before?: number
}

export async function getPlaylistComments(params: PlaylistParams) {
  const { id, limit = 20, offset = 0, before } = params
  let url = `/comment/playlist?id=${id}&limit=${limit}&offset=${offset}`
  if (before) {
    url += `&before=${before}`
  }
  return await request.get(url)
}

export async function getPlaylistSubscribers(params: PlaylistParams) {
  const { id, limit = 20, offset = 0 } = params
  let url = `/playlist/subscribers?id=${id}&limit=${limit}&offset=${offset}`
  return await request.get(url)
}

export async function getExquisitePlaylists(params: {
  order?: 'new' | 'hot'
  cat?: string
  limit?: number
  offset?: number
}) {
  const { order = 'hot', cat = '全部', limit = 10, offset = 0 } = params
  return await request.get(
    `/top/playlist?order=${order}&cat=${cat}&limit=${limit}&offset=${offset}`,
  )
}

export async function getPlaylistAllTracks(params: PlaylistParams) {
  const { id, limit = 0, offset = 0 } = params
  return await request.get(`/playlist/track/all?id=${id}&limit=${limit}&offset=${offset}`)
}

// 对歌单添加或删除歌曲
// 说明 : 调用此接口 , 可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )
// 必选参数 :
// op: 从歌单增加单曲为 add, 删除为 del
// pid: 歌单 id tracks: 歌曲 id,可多个,用逗号隔开
// 接口地址 : /playlist/tracks
// 调用例子 : /playlist/tracks?op=add&pid=24381616&tracks=347231 

export async function modifyPlaylistTracks(playlistId :string | number,
  songId :string | number
  , op: 'add' | 'del') {
  return await request.post(`/playlist/tracks?op=${op}&pid=${playlistId}&tracks=${songId}`,{ sendCookie: true})
}

/**
 * 收藏 / 取消收藏歌单
 * t = 1: 收藏，t = 2: 取消收藏
 * 接口地址: /playlist/subscribe
 */
export async function subscribePlaylist(t: 1 | 2, id: string | number) {
  return await request.get(`/playlist/subscribe?t=${t}&id=${id}`, { sendCookie: true })
}
