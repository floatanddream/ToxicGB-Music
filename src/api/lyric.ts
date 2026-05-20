import request from '@/utils/request'

//获取歌手详情
export const getSongLyric = async (id: number | string) => {
    return await request.post(`/lyric/new`,{
        id,
        sendCookie:true,
    });
}
