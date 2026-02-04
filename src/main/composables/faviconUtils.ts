import { URL } from 'url'

/**
 * 图标候选信息
 */
export interface FaviconCandidate {
  url: string
  sizes?: string
  type?: string
  priority: number
}

/**
 * 图标获取结果
 */
export interface FaviconFetchResult {
  url: string | null
  success: boolean
  error?: string
}

/**
 * 从基础URL构建完整的图标URL
 * @param baseUrl 基础URL
 * @param faviconPath 图标路径（可能是相对或绝对路径）
 * @returns 完整的图标URL
 */
export function resolveFaviconUrl(baseUrl: string, faviconPath: string): string {
  try {
    // 如果已经是完整URL，直接返回
    if (faviconPath.startsWith('http://') || faviconPath.startsWith('https://')) {
      return faviconPath
    }

    // 使用URL API解析相对路径
    const base = new URL(baseUrl)

    // 以 // 开头的协议相对URL
    if (faviconPath.startsWith('//')) {
      return `${base.protocol}${faviconPath}`
    }

    // 以 / 开头的绝对路径
    if (faviconPath.startsWith('/')) {
      return `${base.protocol}//${base.host}${faviconPath}`
    }

    // 相对路径，需要基于当前路径解析
    const basePath = base.pathname.endsWith('/') ? base.pathname : `${base.pathname}/`
    return `${base.protocol}//${base.host}${basePath}${faviconPath}`
  } catch {
    // 如果解析失败，尝试简单拼接
    if (faviconPath.startsWith('/')) {
      const urlObj = new URL(baseUrl)
      return `${urlObj.protocol}//${urlObj.host}${faviconPath}`
    }
    return faviconPath
  }
}

/**
 * 解析HTML中的图标链接
 * @param html HTML内容
 * @param baseUrl 基础URL用于解析相对路径
 * @returns 图标候选列表
 */
export function parseFaviconLinks(html: string, baseUrl: string): FaviconCandidate[] {
  const candidates: FaviconCandidate[] = []

  // 匹配各种图标link标签
  const linkPatterns = [
    // apple-touch-icon (通常质量最高)
    {
      regex: /<link[^>]*rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["'][^>]*>/gi,
      priority: 100
    },
    // icon (标准图标)
    { regex: /<link[^>]*rel=["']icon["'][^>]*>/gi, priority: 80 },
    // shortcut icon (IE风格)
    { regex: /<link[^>]*rel=["']shortcut icon["'][^>]*>/gi, priority: 60 },
    // mask-icon (Safari pinned tab)
    { regex: /<link[^>]*rel=["']mask-icon["'][^>]*>/gi, priority: 40 }
  ]

  for (const { regex, priority } of linkPatterns) {
    const matches = html.match(regex) || []
    for (const match of matches) {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i)
      const sizesMatch = match.match(/sizes=["']([^"']+)["']/i)
      const typeMatch = match.match(/type=["']([^"']+)["']/i)

      if (hrefMatch) {
        const url = resolveFaviconUrl(baseUrl, hrefMatch[1])
        candidates.push({
          url,
          sizes: sizesMatch?.[1],
          type: typeMatch?.[1],
          priority: calculatePriority(priority, sizesMatch?.[1], typeMatch?.[1])
        })
      }
    }
  }

  return candidates
}

/**
 * 计算图标优先级
 * @param basePriority 基础优先级
 * @param sizes 尺寸声明
 * @param type MIME类型
 * @returns 计算后的优先级
 */
function calculatePriority(basePriority: number, sizes?: string, type?: string): number {
  let priority = basePriority

  // 根据尺寸增加优先级
  if (sizes) {
    const sizeMatch = sizes.match(/(\d+)x(\d+)/i)
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1], 10)
      // 越大越好，但不超过50的加成
      priority += Math.min(size / 10, 50)
    }
  }

  // 根据格式调整优先级
  if (type) {
    if (type.includes('svg')) {
      priority += 30 // SVG 质量最好
    } else if (type.includes('png')) {
      priority += 20 // PNG 次之
    } else if (type.includes('ico')) {
      priority += 10 // ICO 基础支持
    }
  }

  return priority
}

/**
 * 获取标准favicon.ico路径
 * @param baseUrl 基础URL
 * @returns 标准favicon路径
 */
export function getStandardFaviconUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl)
    return `${url.protocol}//${url.host}/favicon.ico`
  } catch {
    return `${baseUrl}/favicon.ico`
  }
}

/**
 * 排序图标候选列表
 * @param candidates 图标候选列表
 * @returns 排序后的列表
 */
export function sortFaviconCandidates(candidates: FaviconCandidate[]): FaviconCandidate[] {
  return candidates.sort((a, b) => b.priority - a.priority)
}

/**
 * 验证URL是否有效
 * @param url URL字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 清理URL，移除跟踪参数和片段
 * @param url 原始URL
 * @returns 清理后的URL
 */
export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // 移除hash
    urlObj.hash = ''
    return urlObj.toString()
  } catch {
    return url
  }
}
