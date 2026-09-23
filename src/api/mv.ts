import request from '@/utils/request'

/**
 * 取 MV 的播放地址。
 *
 * 返回的地址与歌曲 url 同类：**带时效的 CDN 直链**，只在内存里活，
 * 不要写进任何持久化快照。
 *
 * 拿不到时返回 undefined（VIP / 版权 / 下架都可能），调用方据此回退流体背景。
 *
 * 实测载荷（2026-09-23，localhost:3000）：
 *   { code: 200, data: { id, url, r, size, md5, code, expi, fee, mvFee, st, ... } }
 */
export const getMvUrl = async (mvId: number | string): Promise<string | undefined> => {
  const res = await request.get('/mv/url', { id: mvId })
  return res?.data?.url ?? undefined
}
