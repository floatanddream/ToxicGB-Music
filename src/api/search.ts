import request from '@/utils/request'

// type: 搜索类型；默认为 1 即单曲 , 取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1018:综合

export async function searchByKeyword(keyword: string) {
  return await request.get(`/search?keywords=${keyword}&type=1018`)
}
export async function searchBySong(keyword: string) {
  return await request.get(`/search?keywords=${keyword}&type=1`)
}
export async function searchByAlbum(keyword: string) {
  return await request.get(`/search?keywords=${keyword}&type=10`)
}
export async function searchBySinger(keyword: string) {
  return await request.get(`/search?keywords=${keyword}&type=100`)
}
export async function searchByPlaylist(keyword: string) {
  return await request.get(`/search?keywords=${keyword}&type=1000`)
}
export async function searchByUser(keyword: string) {
  return await request.get(`/search?keywords=${keyword}&type=1002`)
}
