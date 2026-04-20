import request from '@/utils/request'

export async function getUserFromCookie() {
  return await request.post(`/user/account`,{sendCookie:true})
}