import request from '@/utils/request'

export async function getUserFromCookie() {
  return await request.post(`/user/account`,{sendCookie:true})
}

export async function getUser(uid: number|string) {
  return await request.post(`/user/detail?uid=${uid}`,{sendCookie:true})
}

export async function fetchUserPlaylist(uid: number|string) {
  return await request.get(`/user/playlist?uid=${uid}`,{sendCookie:true})
}

export async function fetchUserFollows(uid: number|string, limit = 150, offset = 0) {
  return await request.get(`/user/follows?uid=${uid}&limit=${limit}&offset=${offset}`,{sendCookie:true})
}

export async function fetchUserFolloweds(uid: number|string, limit = 150, offset = 0) {
  return await request.get(`/user/followeds?uid=${uid}&limit=${limit}&offset=${offset}`,{sendCookie:true})
}

export async function getUserSimpleIInfo() {
  return await request.post(`/user/subcount`,{sendCookie:true})
}

//用户喜欢的音乐
export async function getLikeMusic(uid: number|string) {
  return await request.post(`/likelist?uid=${uid}`,{sendCookie:true})
}

//喜欢音乐
export async function likeMusic(id: number | string, like: boolean) {
  return await request.post(`/like?timestamp=${new Date().getTime()}`,{sendCookie:true, like , id:Number(id)})
}