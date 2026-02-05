import {
  parseFaviconLinks,
  getStandardFaviconUrl,
  sortFaviconCandidates,
  cleanUrl,
  isValidUrl,
  type FaviconFetchResult
} from '../composables/faviconUtils'

/**
 * 从HTML中解析标题
 * @param html HTML内容
 * @returns 标题文本或null
 */
function parseTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  if (titleMatch && titleMatch[1]) {
    const title = titleMatch[1].trim()
    return title || null
  }
  return null
}

/**
 * 请求超时时间（毫秒）
 */
const REQUEST_TIMEOUT = 5000

/**
 * 验证图标URL是否可访问
 * @param url 图标URL
 * @returns 是否可访问
 */
async function validateFaviconUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return false
    }

    // 检查内容类型是否为图片
    const contentType = response.headers.get('content-type')
    if (contentType) {
      const validTypes = ['image/', 'application/octet-stream', 'text/plain']
      return validTypes.some((type) => contentType.toLowerCase().includes(type))
    }

    return true
  } catch {
    return false
  }
}

/**
 * 获取网页HTML内容
 * @param url 网页URL
 * @returns HTML内容或null
 */
async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    return await response.text()
  } catch {
    return null
  }
}

/**
 * 尝试获取图标
 * @param url 图标URL
 * @returns 成功返回URL，失败返回null
 */
async function tryFetchFavicon(url: string): Promise<string | null> {
  const isValid = await validateFaviconUrl(url)
  return isValid ? url : null
}

/**
 * 获取网站图标和标题
 * @param websiteUrl 网站URL
 * @returns 图标获取结果
 */
export async function fetchFavicon(websiteUrl: string): Promise<FaviconFetchResult> {
  // 验证URL
  if (!isValidUrl(websiteUrl)) {
    return {
      url: null,
      title: null,
      success: false,
      error: '无效的URL格式'
    }
  }

  const cleanWebsiteUrl = cleanUrl(websiteUrl)
  let pageTitle: string | null = null

  try {
    // 1. 首先尝试获取HTML并解析图标链接和标题
    const html = await fetchHtml(cleanWebsiteUrl)

    if (html) {
      // 解析网页标题
      pageTitle = parseTitle(html)

      // 解析HTML中的图标链接
      const candidates = parseFaviconLinks(html, cleanWebsiteUrl)
      const sortedCandidates = sortFaviconCandidates(candidates)

      // 尝试每个候选图标
      for (const candidate of sortedCandidates) {
        const result = await tryFetchFavicon(candidate.url)
        if (result) {
          return {
            url: result,
            title: pageTitle,
            success: true
          }
        }
      }
    }

    // 2. 如果HTML解析没有结果，尝试标准favicon.ico路径
    const standardFaviconUrl = getStandardFaviconUrl(cleanWebsiteUrl)
    const standardResult = await tryFetchFavicon(standardFaviconUrl)

    if (standardResult) {
      return {
        url: standardResult,
        title: pageTitle,
        success: true
      }
    }

    // 3. 所有尝试都失败，但可能获取到了标题
    return {
      url: null,
      title: pageTitle,
      success: false,
      error: '无法获取网站图标'
    }
  } catch (error) {
    return {
      url: null,
      title: pageTitle,
      success: false,
      error: error instanceof Error ? error.message : '获取图标时发生错误'
    }
  }
}

/**
 * 批量获取多个网站的图标
 * @param urls 网站URL列表
 * @returns 图标结果映射
 */
export async function fetchFaviconsBatch(urls: string[]): Promise<Map<string, FaviconFetchResult>> {
  const results = new Map<string, FaviconFetchResult>()

  // 并行获取，但限制并发数
  const batchSize = 5
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const result = await fetchFavicon(url)
        return { url, result }
      })
    )

    for (const { url, result } of batchResults) {
      results.set(url, result)
    }
  }

  return results
}
