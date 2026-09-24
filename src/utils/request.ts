import ky from 'ky'

const baseURL = import.meta.env.VITE_GLOB_API_URL

/**
 * 拦截器类型（模拟 axios）
 */
type RequestInterceptor = (request: Request) => Promise<Request> | Request
type ErrorInterceptor = (error: Error) => Promise<Error> | Error

/**
 * ky 封装。
 *
 * 后端是 **NeteaseCloudMusicApi**（网易云音乐 NodeJS 版 API），它**直接返回网易云的
 * 原始载荷**（`{ code, data }` / `{ songs, privileges, code }` 这类），外面没有任何
 * 信封。所以这里不做解包 —— `request.get('/song/url/v1', …)` 拿到的就是那个对象，
 * 调用方按 `res.data[0].url` 这样直接读。
 *
 * ⚠️ 勿重犯 —— 这个文件里曾经有一整套 `{ success, data, errorMsg }` 信封处理
 * （业务错误抛出、401 自动刷新 token、响应解包）。那是为一套**这个后端并不存在**的
 * 契约写的；而且 ky 2.0 把 hook 签名从位置参数改成了单个 state 对象之后，那些 hook
 * 从来没真正执行过（`response.clone()` 抛的 TypeError 被 `catch { return response }`
 * 静默吞掉，ky 收到 undefined 就回退用原始响应）。
 *
 * 换句话说：它一直「坏着但能用」，而**把它「修好」反而会让 app 全线报错误** ——
 * 因为后端根本不会返回 `success`。要加响应处理，先确认后端真的会那样返回。
 */
class HttpClient {
  private instance
  private requestInterceptors: RequestInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(options: any = {}) {
    this.instance = ky.create({
      prefix: options.baseURL || '',
      timeout: options.timeout || 10000,
      retry: options.retry || 0,

      hooks: {
        /**
         * 请求拦截器链。
         *
         * ky 2.0 起 hook 收到的是**单个 state 对象**（不再是 `(request, options, …)`
         * 位置参数），且只有返回 `Request` / `Response` 才会被采纳。
         */
        beforeRequest: [
          async ({ request }) => {
            let next: Request = request
            for (const interceptor of this.requestInterceptors) {
              next = await interceptor(next)
            }
            return next
          },
        ],

        /**
         * 错误拦截器链。
         *
         * 同样收 state（错误在 `state.error`），而且**必须返回一个 `Error` 才会被
         * 采纳** —— 返回 state 本身会被 ky 忽略（`if (hookResult instanceof Error)`），
         * 那样写会静默失效。
         */
        beforeError: [
          async ({ error }) => {
            let next: Error = error
            for (const interceptor of this.errorInterceptors) {
              next = await interceptor(next)
            }
            return next
          },
        ],
      },
    })
  }

  /**
   * 添加拦截器（模拟 axios API）
   */
  useRequest(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  useError(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor)
  }

  /**
   * 获取 cookie 值
   */
  private getCookie(): string {
    return localStorage.getItem('cookie') || ''
  }

  /**
   * 请求方法封装
   * signal 可放在 params / data 内部透传给 ky，用于 AbortController 取消请求
   */
  async get<T = any>(url: string, params?: any): Promise<T> {
    const { sendCookie, signal, ...restParams } = params || {}
    const searchParams = sendCookie
      ? { ...restParams, cookie: encodeURIComponent(this.getCookie()) }
      : restParams
    return this.instance.get(url, { searchParams, signal }).json()
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const { sendCookie, signal, ...restData } = data || {}
    const jsonData = sendCookie ? { ...restData, cookie: this.getCookie() } : restData
    return this.instance.post(url, { json: jsonData, signal }).json()
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const { signal, ...restData } = data || {}
    return this.instance.put(url, { json: restData, signal }).json()
  }

  async delete<T = any>(url: string, data?: any): Promise<T> {
    const { signal, ...restData } = data || {}
    return this.instance.delete(url, { json: restData, signal }).json()
  }

  /**
   * 注意：这里刻意用裸 `ky.head` 而不是 `this.instance` —— 调用方传的是 CDN 的
   * **绝对 URL**（校验歌曲直链是否还有效），不需要也不该套上 `prefix`。
   */
  async head(url: string, params?: any, signal?: AbortSignal): Promise<Response> {
    const searchParams = params || {}
    return ky.head(url, { searchParams, signal })
  }
}

export function createClient(options?: any) {
  const client = new HttpClient(options)

  // 全局错误提示
  client.useError((error) => {
    console.error('请求错误:', error.message)
    return error
  })

  return client
}

/**
 * 默认实例
 */
const request = createClient({
  baseURL: `${baseURL}`,
  timeout: 10000,
  retry: 2,
})

export default request
