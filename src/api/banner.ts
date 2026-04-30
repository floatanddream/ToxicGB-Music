import request from '@/utils/request'

//歌手热门 50 首歌曲
export const getBanner = async () => {
    return await request.get(`/banner`);
}