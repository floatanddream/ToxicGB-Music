import request from '@/utils/request'

// type: 搜索类型；默认为 1 即单曲 , 取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1018:综合

type SearchOptions = { limit?: number; offset?: number }

export async function searchByKeyword(keyword: string) {
  return await request.get(`/search?keywords=${keyword}&type=1018&limit=100`)
}
export async function searchBySong(keyword: string, opts: SearchOptions = {}) {
  const { limit = 30, offset = 0 } = opts
  return await request.get(`/cloudsearch?keywords=${keyword}&type=1&limit=${limit}&offset=${offset}`)
}
export async function searchByAlbum(keyword: string, opts: SearchOptions = {}) {
  const { limit = 30, offset = 0 } = opts
  return await request.get(`/search?keywords=${keyword}&type=10&limit=${limit}&offset=${offset}`)
}
export async function searchBySinger(keyword: string, opts: SearchOptions = {}) {
  const { limit = 30, offset = 0 } = opts
  return await request.get(`/search?keywords=${keyword}&type=100&limit=${limit}&offset=${offset}`)
}
export async function searchByPlaylist(keyword: string, opts: SearchOptions = {}) {
  const { limit = 30, offset = 0 } = opts
  return await request.get(`/search?keywords=${keyword}&type=1000&limit=${limit}&offset=${offset}`)
}
export async function searchByUser(keyword: string, opts: SearchOptions = {}) {
  const { limit = 30, offset = 0 } = opts
  return await request.get(`/search?keywords=${keyword}&type=1002&limit=${limit}&offset=${offset}`)
}