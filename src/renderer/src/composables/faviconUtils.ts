/**
 * 图标获取状态枚举
 */
export enum FaviconFetchStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * 图标获取结果
 */
export interface FaviconFetchResult {
  url: string | null
  title: string | null
  status: FaviconFetchStatus
  error?: string
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 获取网站图标和标题
 * @param url 网站URL
 * @returns 图标获取结果
 */
export async function fetchWebsiteFavicon(url: string): Promise<FaviconFetchResult> {
  try {
    const result = await window.api.fetchFavicon(url)

    if (result.success && result.url) {
      return {
        url: result.url,
        title: result.title,
        status: FaviconFetchStatus.SUCCESS
      }
    }

    return {
      url: null,
      title: result.title,
      status: FaviconFetchStatus.ERROR,
      error: result.error || '无法获取网站图标'
    }
  } catch (error) {
    return {
      url: null,
      title: null,
      status: FaviconFetchStatus.ERROR,
      error: error instanceof Error ? error.message : '获取图标时发生错误'
    }
  }
}

/**
 * 验证图标URL是否有效
 * @param url 图标URL
 * @returns 是否有效
 */
export async function validateFaviconUrl(url: string): Promise<boolean> {
  if (!url) return false

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * 获取默认图标URL
 * @returns 默认图标URL（使用Google的favicon服务作为降级方案）
 */
export function getDefaultFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`
  } catch {
    return ''
  }
}

/**
 * 创建防抖的图标获取函数
 * @param callback 获取完成后的回调
 * @param delay 防抖延迟（毫秒）
 * @returns 防抖后的获取函数
 */
export function createDebouncedFaviconFetcher(
  callback: (result: FaviconFetchResult) => void,
  delay: number = 500
): (url: string) => void {
  let abortController: AbortController | null = null

  return debounce(async (url: string) => {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()

    // 通知开始加载
    callback({
      url: null,
      title: null,
      status: FaviconFetchStatus.LOADING
    })

    try {
      const result = await fetchWebsiteFavicon(url)

      // 检查是否被取消
      if (abortController.signal.aborted) {
        return
      }

      callback(result)
    } catch {
      // 检查是否被取消
      if (abortController.signal.aborted) {
        return
      }

      callback({
        url: null,
        title: null,
        status: FaviconFetchStatus.ERROR,
        error: '获取图标失败'
      })
    }
  }, delay)
}

/**
 * 从URL中提取域名
 * @param url 网站URL
 * @returns 域名
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * 格式化图标URL用于显示
 * @param url 图标URL
 * @returns 格式化后的URL
 */
export function formatFaviconUrl(url: string | null): string {
  if (!url) return ''

  try {
    const urlObj = new URL(url)
    return `${urlObj.hostname}${urlObj.pathname}`
  } catch {
    return url
  }
}
