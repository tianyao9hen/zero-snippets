/**
 * 剪贴板工具函数
 * 提供剪贴板读取和URL验证功能
 */

import { isValidUrl } from './urlUtils'

/**
 * 从剪贴板读取文本内容
 * @returns 剪贴板文本内容，读取失败返回空字符串
 */
export function readClipboardText(): string {
  try {
    return window.api.readClipboardText()
  } catch (error) {
    console.error('读取剪贴板失败:', error)
    return ''
  }
}

/**
 * 验证剪贴板内容是否为有效的URL
 * @param text 剪贴板文本内容
 * @returns 是否为有效URL
 */
export function isValidUrlForClipboard(text: string): boolean {
  if (!text || text.trim() === '') {
    return false
  }
  return isValidUrl(text.trim())
}
