import request from '@/utils/request'

//歌手热门 50 首歌曲
export const getArtistTop50 = async (id: number | String) => {
  return await request.get(`/artist/top/song?id=${id}`)
}
//获取歌手详情
export const getArtistDetail = async (id: number | String) => {
  return await request.get(`/artist/detail?id=${id}`)
}

//获取歌手专辑
export const getArtistAlbum = async (id: number | String) => {
  return await request.get(`/artist/album?id=${id}&limit=100`)
}

export const getHotArtists = async (limit: number = 50, offset: number = 0) => {
  return await request.get(`/top/artists?offset=${offset}&limit=${limit}`)
}
