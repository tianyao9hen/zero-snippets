/**
 * URL工具函数
 * 提供URL验证、协议自动补全等功能
 */

/**
 * URL处理结果接口
 */
export interface UrlProcessResult {
  /** 处理后的URL */
  url: string
  /** 是否自动添加了协议 */
  protocolAdded: boolean
  /** 是否有效 */
  isValid: boolean
  /** 错误信息（如果有） */
  error?: string
}

/**
 * 协议类型枚举
 */
export enum UrlProtocol {
  HTTP = 'http://',
  HTTPS = 'https://',
  FTP = 'ftp://',
  FTPS = 'ftps://',
  FILE = 'file://',
  MAILTO = 'mailto:',
  TEL = 'tel:'
}

/**
 * 有效的协议前缀列表
 */
const VALID_PROTOCOLS = [
  'http://',
  'https://',
  'ftp://',
  'ftps://',
  'file://',
  'mailto:',
  'tel:',
  'data:',
  'javascript:',
  'ws://',
  'wss://'
]

/**
 * 检查URL是否已包含协议前缀
 * @param url URL字符串
 * @returns boolean 是否包含协议
 */
export function hasProtocol(url: string): boolean {
  const trimmedUrl = url.trim().toLowerCase()
  return VALID_PROTOCOLS.some((protocol) => trimmedUrl.startsWith(protocol))
}

/**
 * 自动补全URL协议
 * 如果URL没有协议前缀，自动添加https://
 * 保留其他协议（ftp://, ftps://等）不变
 * @param url 原始URL字符串
 * @returns string 处理后的URL
 */
export function autoCompleteProtocol(url: string): string {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return trimmedUrl
  }

  // 如果已经有协议，直接返回
  if (hasProtocol(trimmedUrl)) {
    return trimmedUrl
  }

  // 默认添加 https:// 协议
  return `https://${trimmedUrl}`
}

/**
 * 处理并验证URL
 * 自动补全协议并验证URL格式
 * @param url 原始URL字符串
 * @returns UrlProcessResult 处理结果
 */
export function processUrl(url: string): UrlProcessResult {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return {
      url: trimmedUrl,
      protocolAdded: false,
      isValid: false,
      error: 'URL不能为空'
    }
  }

  const originalHasProtocol = hasProtocol(trimmedUrl)
  const processedUrl = autoCompleteProtocol(trimmedUrl)
  const protocolAdded = !originalHasProtocol

  // 验证处理后的URL格式
  const isValid = isValidUrl(processedUrl)

  return {
    url: processedUrl,
    protocolAdded,
    isValid,
    error: isValid ? undefined : 'URL格式不正确'
  }
}

/**
 * 验证URL格式是否有效
 * 支持http://, https://协议
 * @param url URL字符串
 * @returns boolean 是否有效
 */
export function isValidUrl(url: string): boolean {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return false
  }

  // 使用正则表达式验证URL格式
  // 支持域名、IP地址、端口、路径、查询参数和锚点
  const urlPattern =
    /^https?:\/\/(?:[\w-]+(?:\.[\w-]+)*|localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d{2,5})?(?:[/?#][^\s]*)?$/i

  return urlPattern.test(trimmedUrl)
}

/**
 * 验证URL格式（宽松模式）
 * 允许更多格式的URL，包括没有路径的域名
 * @param url URL字符串
 * @returns boolean 是否有效
 */
export function isValidUrlLoose(url: string): boolean {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return false
  }

  try {
    // 使用URL API进行验证
    new URL(trimmedUrl)
    return true
  } catch {
    return false
  }
}

/**
 * 获取URL的协议类型
 * @param url URL字符串
 * @returns string | null 协议类型或null
 */
export function getProtocol(url: string): string | null {
  const trimmedUrl = url.trim().toLowerCase()

  for (const protocol of VALID_PROTOCOLS) {
    if (trimmedUrl.startsWith(protocol)) {
      return protocol
    }
  }

  return null
}

/**
 * 移除URL的协议前缀
 * @param url URL字符串
 * @returns string 移除协议后的URL
 */
export function removeProtocol(url: string): string {
  const trimmedUrl = url.trim()
  const protocol = getProtocol(trimmedUrl)

  if (protocol) {
    return trimmedUrl.slice(protocol.length)
  }

  return trimmedUrl
}

/**
 * 格式化URL用于显示
 * 如果URL过长，截断显示
 * @param url URL字符串
 * @param maxLength 最大长度，默认50
 * @returns string 格式化后的URL
 */
export function formatUrlForDisplay(url: string, maxLength: number = 50): string {
  const trimmedUrl = url.trim()

  if (trimmedUrl.length <= maxLength) {
    return trimmedUrl
  }

  return trimmedUrl.slice(0, maxLength - 3) + '...'
}
