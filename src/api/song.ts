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

/**
 * 取歌曲的 MV id（0 表示没有 MV）。
 *
 * 打的是 /song/detail —— `mv` 这个字段不在搜索 / 歌单 / 专辑的载荷里，只能单独问一次，
 * 所以调用方必须**按需**调用（背景设置关着时不要调），不要挂在换歌的必经路径上。
 *
 * 实测载荷（2026-09-23，localhost:3000）：
 *   { songs: [{ …, mv: 376199 }], privileges, code }
 */
export const getSongMvId = async (id: number | string) => {
    const res = await request.get('/song/detail', { ids: id })
    return Number(res?.songs?.[0]?.mv) || 0
}
