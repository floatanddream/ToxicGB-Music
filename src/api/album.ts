import request from '@/utils/request'

//获取歌手详情
export const getAlbumDetail = async (id: number | String) => {
    return await request.get(`/album?id=${id}`)
}
