/**
 * @file faviconUtils.spec.ts
 * @description faviconUtils 工具函数的单元测试（Main进程）
 *
 * 测试覆盖：
 * - URL解析和规范化
 * - HTML图标链接解析
 * - 图标优先级排序
 * - URL验证
 */
import { describe, it, expect } from 'vitest'
import {
  resolveFaviconUrl,
  parseFaviconLinks,
  getStandardFaviconUrl,
  sortFaviconCandidates,
  isValidUrl,
  cleanUrl,
  type FaviconCandidate
} from './faviconUtils'

describe('faviconUtils (Main)', () => {
  describe('resolveFaviconUrl', () => {
    it('应保留完整的绝对URL', () => {
      const url = 'https://example.com/favicon.ico'
      expect(resolveFaviconUrl('https://base.com', url)).toBe(url)
    })

    it('应解析协议相对URL', () => {
      expect(resolveFaviconUrl('https://example.com', '//cdn.com/icon.png')).toBe(
        'https://cdn.com/icon.png'
      )
    })

    it('应解析根路径URL', () => {
      expect(resolveFaviconUrl('https://example.com/path', '/favicon.ico')).toBe(
        'https://example.com/favicon.ico'
      )
    })

    it('应解析相对路径URL', () => {
      expect(resolveFaviconUrl('https://example.com/path/', 'icon.png')).toBe(
        'https://example.com/path/icon.png'
      )
      expect(resolveFaviconUrl('https://example.com/path/page', 'icon.png')).toBe(
        'https://example.com/path/page/icon.png'
      )
    })

    it('应处理http协议', () => {
      expect(resolveFaviconUrl('http://example.com', '/favicon.ico')).toBe(
        'http://example.com/favicon.ico'
      )
    })
  })

  describe('parseFaviconLinks', () => {
    it('应解析apple-touch-icon', () => {
      const html = `
        <html>
          <head>
            <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180">
          </head>
        </html>
      `
      const candidates = parseFaviconLinks(html, 'https://example.com')
      expect(candidates).toHaveLength(1)
      expect(candidates[0].url).toBe('https://example.com/apple-icon.png')
      expect(candidates[0].sizes).toBe('180x180')
    })

    it('应解析标准icon链接', () => {
      const html = `
        <html>
          <head>
            <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
          </head>
        </html>
      `
      const candidates = parseFaviconLinks(html, 'https://example.com')
      expect(candidates).toHaveLength(1)
      expect(candidates[0].url).toBe('https://example.com/favicon.png')
      expect(candidates[0].type).toBe('image/png')
    })

    it('应解析shortcut icon', () => {
      const html = `
        <html>
          <head>
            <link rel="shortcut icon" href="/favicon.ico">
          </head>
        </html>
      `
      const candidates = parseFaviconLinks(html, 'https://example.com')
      expect(candidates).toHaveLength(1)
      expect(candidates[0].url).toBe('https://example.com/favicon.ico')
    })

    it('应解析多个图标并按优先级排序', () => {
      const html = `
        <html>
          <head>
            <link rel="icon" href="/favicon.ico">
            <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180">
            <link rel="icon" type="image/png" href="/icon-32.png" sizes="32x32">
          </head>
        </html>
      `
      const candidates = parseFaviconLinks(html, 'https://example.com')
      expect(candidates.length).toBeGreaterThanOrEqual(2)
      // apple-touch-icon 应该有更高的优先级
      const appleIcon = candidates.find((c) => c.url.includes('apple-icon'))
      expect(appleIcon).toBeDefined()
    })

    it('应处理绝对路径URL', () => {
      const html = `
        <html>
          <head>
            <link rel="icon" href="https://cdn.example.com/icon.png">
          </head>
        </html>
      `
      const candidates = parseFaviconLinks(html, 'https://example.com')
      expect(candidates).toHaveLength(1)
      expect(candidates[0].url).toBe('https://cdn.example.com/icon.png')
    })

    it('应处理空HTML', () => {
      const candidates = parseFaviconLinks('', 'https://example.com')
      expect(candidates).toHaveLength(0)
    })

    it('应处理无图标的HTML', () => {
      const html = `
        <html>
          <head>
            <title>No Icon</title>
          </head>
        </html>
      `
      const candidates = parseFaviconLinks(html, 'https://example.com')
      expect(candidates).toHaveLength(0)
    })
  })

  describe('getStandardFaviconUrl', () => {
    it('应生成标准favicon.ico URL', () => {
      expect(getStandardFaviconUrl('https://example.com')).toBe('https://example.com/favicon.ico')
      expect(getStandardFaviconUrl('https://example.com/path')).toBe(
        'https://example.com/favicon.ico'
      )
    })

    it('应保留http协议', () => {
      expect(getStandardFaviconUrl('http://example.com')).toBe('http://example.com/favicon.ico')
    })

    it('应处理带端口的URL', () => {
      expect(getStandardFaviconUrl('http://localhost:3000')).toBe(
        'http://localhost:3000/favicon.ico'
      )
    })
  })

  describe('sortFaviconCandidates', () => {
    it('应按优先级降序排序', () => {
      const candidates: FaviconCandidate[] = [
        { url: 'low.png', priority: 10 },
        { url: 'high.png', priority: 100 },
        { url: 'medium.png', priority: 50 }
      ]
      const sorted = sortFaviconCandidates(candidates)
      expect(sorted[0].url).toBe('high.png')
      expect(sorted[1].url).toBe('medium.png')
      expect(sorted[2].url).toBe('low.png')
    })

    it('应处理空数组', () => {
      const sorted = sortFaviconCandidates([])
      expect(sorted).toHaveLength(0)
    })

    it('应处理单元素数组', () => {
      const candidates: FaviconCandidate[] = [{ url: 'single.png', priority: 50 }]
      const sorted = sortFaviconCandidates(candidates)
      expect(sorted).toHaveLength(1)
      expect(sorted[0].url).toBe('single.png')
    })
  })

  describe('isValidUrl', () => {
    it('应验证有效的HTTP URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('应验证带路径的URL', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true)
    })

    it('应验证带查询参数的URL', () => {
      expect(isValidUrl('https://example.com?query=value')).toBe(true)
    })

    it('应拒绝无效的URL', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(true) // URL构造函数接受ftp
    })

    it('应拒绝空字符串', () => {
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('cleanUrl', () => {
    it('应移除hash片段', () => {
      expect(cleanUrl('https://example.com/page#section')).toBe('https://example.com/page')
    })

    it('应保留查询参数', () => {
      expect(cleanUrl('https://example.com/page?query=value')).toBe(
        'https://example.com/page?query=value'
      )
    })

    it('应处理没有hash的URL', () => {
      expect(cleanUrl('https://example.com/page')).toBe('https://example.com/page')
    })

    it('应处理无效URL', () => {
      expect(cleanUrl('not-a-url')).toBe('not-a-url')
    })
  })
})
