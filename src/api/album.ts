import request from '@/utils/request'

//获取歌手详情
export const getAlbumDetail = async (id: number | String) => {
    return await request.get(`/album?id=${id}`)
}

export interface AlbumCommentsParams {
  id: string;
  limit?: number;
  offset?: number;
  before?: number;
}

// 获取专辑评论
export async function getAlbumComments(params: AlbumCommentsParams) {
  const { id, limit = 20, offset = 0, before } = params;
  let url = `/comment/album?id=${id}&limit=${limit}&offset=${offset}`;
  if (before) {
    url += `&before=${before}`;
  }
  return await request.get(url);
}
