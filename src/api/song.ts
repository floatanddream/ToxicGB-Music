import request from '@/utils/request'

//获取歌手详情
export const getSongUrl = async (id: number | string) => {
    return await request.get(`/song/url/v1`,{
        id,
        level:'exhigh',
        sendCookie:true,
        timestamp:new Date().getTime(),
    });
}

export const checkUrl = async (url:  string) => {
    return await request.head(url);
}
