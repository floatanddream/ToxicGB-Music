import request from '@/utils/request'

//获取歌手详情
export const getSongLyric = async (id: number | string) => {
    return await request.post(`/lyric/new?timestamp=${new Date().getTime()}`,{
        id,
        sendCookie:true,
    });
}

// 获取ttml歌词
export const getTTMLLyric = async (id: number | string) => {
    try {
        const response = await fetch(`https://amlldb.bikonoo.com/ncm-lyrics/${id}.ttml`);
        
        // 检查响应状态
        if (response.status === 200) {
            const ttmlString = response.text();
            return ttmlString;
        } 
    } catch (error) {
        console.error('获取TTML歌词失败:', error);
        throw error;
    }
}