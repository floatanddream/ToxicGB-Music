import request from '@/utils/request'

export async function getPlaylistDetail(playlistId: string) {
  return await request.get(`/playlist/detail?id=${playlistId}`)
}

export interface PlaylistParams {
  id: string;
  limit?: number;
  offset?: number;
  before?: number;
}

export async function getPlaylistComments(params: PlaylistParams) {
  const { id, limit = 20, offset = 0, before } = params;
  let url = `/comment/playlist?id=${id}&limit=${limit}&offset=${offset}`;
  if (before) {
    url += `&before=${before}`;
  }
  return await request.get(url);
}

export async function getPlaylistSubscribers(params :PlaylistParams) {
  const { id, limit = 20, offset = 0 } = params;
  let url = `/playlist/subscribers?id=${id}&limit=${limit}&offset=${offset}`;
  return await request.get(url);
}