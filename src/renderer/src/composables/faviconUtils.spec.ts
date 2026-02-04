/**
 * @file faviconUtils.spec.ts
 * @description faviconUtils 工具函数的单元测试
 *
 * 测试覆盖：
 * - 防抖函数功能
 * - 图标状态枚举
 * - 域名提取
 * - URL格式化
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FaviconFetchStatus, debounce, extractDomain, formatFaviconUrl } from './faviconUtils'

describe('faviconUtils', () => {
  describe('FaviconFetchStatus', () => {
    it('应包含所有必要的状态值', () => {
      expect(FaviconFetchStatus.IDLE).toBe('idle')
      expect(FaviconFetchStatus.LOADING).toBe('loading')
      expect(FaviconFetchStatus.SUCCESS).toBe('success')
      expect(FaviconFetchStatus.ERROR).toBe('error')
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应在延迟后执行函数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('arg1', 'arg2')
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('应在多次调用时只执行最后一次', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('third')
    })

    it('应正确传递多个参数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn(1, 'test', { key: 'value' }, [1, 2, 3])

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledWith(1, 'test', { key: 'value' }, [1, 2, 3])
    })

    it('应在延迟期间重置计时器', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('first')
      vi.advanceTimersByTime(50)
      debouncedFn('second')
      vi.advanceTimersByTime(50)

      // 第一次调用应该被取消
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('second')
    })
  })

  describe('extractDomain', () => {
    it('应从完整URL中提取域名', () => {
      expect(extractDomain('https://www.example.com/path')).toBe('www.example.com')
      expect(extractDomain('http://github.com/user/repo')).toBe('github.com')
      expect(extractDomain('https://sub.domain.co.uk/path?query=1')).toBe('sub.domain.co.uk')
    })

    it('应处理带端口的URL', () => {
      expect(extractDomain('http://localhost:3000')).toBe('localhost')
      expect(extractDomain('https://example.com:8080/path')).toBe('example.com')
    })

    it('应处理无效URL', () => {
      expect(extractDomain('not-a-url')).toBe('not-a-url')
      expect(extractDomain('')).toBe('')
    })

    it('应处理只有域名的字符串', () => {
      expect(extractDomain('example.com')).toBe('example.com')
    })
  })

  describe('formatFaviconUrl', () => {
    it('应格式化完整的图标URL', () => {
      expect(formatFaviconUrl('https://example.com/favicon.ico')).toBe('example.com/favicon.ico')
      expect(formatFaviconUrl('http://github.com/assets/icon.png')).toBe(
        'github.com/assets/icon.png'
      )
    })

    it('应处理带查询参数的URL', () => {
      expect(formatFaviconUrl('https://example.com/icon.png?v=123')).toBe('example.com/icon.png')
    })

    it('应处理null值', () => {
      expect(formatFaviconUrl(null)).toBe('')
    })

    it('应处理空字符串', () => {
      expect(formatFaviconUrl('')).toBe('')
    })

    it('应处理无效URL', () => {
      expect(formatFaviconUrl('not-a-valid-url')).toBe('not-a-valid-url')
    })

    it('应处理协议相对URL', () => {
      // 在Node.js测试环境中，协议相对URL无法被解析，会返回原字符串
      // 在浏览器环境中，它会被解析为有效URL
      const result = formatFaviconUrl('//example.com/favicon.ico')
      // 结果可能是原字符串（Node环境）或解析后的URL（浏览器环境）
      expect(result === '//example.com/favicon.ico' || result === 'example.com/favicon.ico').toBe(
        true
      )
    })
  })
})
