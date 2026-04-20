import ky, { HTTPError } from 'ky'

/**
 * 自定义类型（适配你的后端）
 */
interface ApiResponse<T = any> {
  success: boolean
  data: T
  errorMsg: string
  code: number
}

/**
 * 拦截器类型（模拟 axios）
 */
type RequestInterceptor = (config: Request) => Promise<Request> | Request
type ResponseInterceptor<T = any> = (data: T) => T | Promise<T>
type ErrorInterceptor = (error: any) => any

/**
 * 核心类（类 axios）
 */
class HttpClient {
  private instance
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(options: any = {}) {
    this.instance = ky.create({
      prefix: options.baseURL || '',
      timeout: options.timeout || 10000,
      retry: options.retry || 0,

      hooks: {
        /**
         * 请求拦截器链
         */
        beforeRequest: [
          async (request) => {
            for (const interceptor of this.requestInterceptors) {
              request = await interceptor(request)
            }
          },
        ],

        /**
         * 响应拦截器链
         */
        afterResponse: [
          async (request, options, response, state) => {
            let data: ApiResponse

            try {
              data = await response.clone().json()
            } catch {
              return response
            }

            /**
             * 🔥 401 自动刷新 token
             */
            if (data.code === 401 && state.retryCount === 0) {
              const newToken = await this.refreshToken()

              if (newToken) {
                const newRequest = new Request(request, {
                  headers: {
                    ...Object.fromEntries(request.headers),
                    Authorization: newToken,
                  },
                })

                return ky.retry({
                  request: newRequest,
                  code: 'TOKEN_REFRESH',
                })
              }
            }

            /**
             * 业务错误
             */
            if (!data.success) {
              throw new Error(data.errorMsg || '业务错误')
            }

            let result = data.data

            /**
             * 响应拦截器链
             */
            for (const interceptor of this.responseInterceptors) {
              result = await interceptor(result)
            }

            return new Response(JSON.stringify(result), response)
          },
        ],

        /**
         * 错误拦截器
         */
        beforeError: [
          async (error) => {
            for (const interceptor of this.errorInterceptors) {
              error = await interceptor(error)
            }

            return error
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

  useResponse(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  useError(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor)
  }

  /**
   * 获取 cookie 值
   */
  private getCookie(): string {
    return localStorage.getItem('cookie') || '';
  }

  /**
   * 请求方法封装
   */
  async get<T = any>(url: string, params?: any, sendCookie = false): Promise<T> {
    const searchParams = sendCookie
      ? { ...params, cookie: encodeURIComponent(this.getCookie()) }
      : params;
    return this.instance.get(url, { searchParams }).json();
  }

  async post<T = any>(url: string, data?: any, sendCookie = false): Promise<T> {
    const jsonData = sendCookie
      ? { ...data, cookie: this.getCookie() }
      : data;
    return this.instance.post(url, { json: jsonData }).json();
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.instance.put(url, { json: data }).json()
  }

  async delete<T = any>(url: string, data?: any): Promise<T> {
    return this.instance.delete(url, { json: data }).json()
  }

  /**
   * 🔥 token 刷新逻辑
   */
  private async refreshToken(): Promise<string | null> {
    try {
      const res = await ky.post('/auth/refresh').json<any>()
      const token = res.data?.token

      if (token) {
        localStorage.setItem('authToken', token)
        return token
      }

      return null
    } catch {
      //   localStorage.removeItem('authToken')
      //   window.location.href = '/login'
      return null
    }
  }
}
export function createClient(options?: any) {
  const client = new HttpClient(options)

  /**
   * 默认拦截器（你项目用）
   */

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
  baseURL: 'http://127.0.0.1:3000',
  timeout: 10000,
  retry: 2,
})

export default request
