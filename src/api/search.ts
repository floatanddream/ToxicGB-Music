import request from '@/utils/request'

export async function searchByKeyword(keyword: string) {
  return await request.get(`/search?keywords=${keyword}&type=1018`)
}
