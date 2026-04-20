import request from '@/utils/request'

export async function getUserFromCookie() {
  return await request.post(`/user/account`,{sendCookie:true})
}

export async function fetchUserPlaylist(uid: number|string) {
  return await request.get(`/user/playlist?uid=${uid}`,{sendCookie:true})
}