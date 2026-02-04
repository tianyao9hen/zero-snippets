/**
 * @file TreeNode.spec.ts
 * @description TreeNode 组件图标逻辑的单元测试
 *
 * 测试覆盖：
 * - Web节点图标显示逻辑
 * - 图标加载错误回退
 * - 默认图标悬停交互
 * - 文件夹节点图标逻辑
 */
import { describe, it, expect } from 'vitest'
import { iconMap } from '@renderer/composables/iconUtils'
import { WebTreeNodeType } from '@renderer/enums'

/**
 * 模拟 TreeNode 组件的图标选择逻辑
 * 这是从 TreeNode.vue 中提取的核心逻辑
 *
 * 注意：isIconHovered 参数实际上不应该在有自定义图标时被设置为 true，
 * 因为 handleIconMouseEnter 会检查是否有自定义图标
 */
function getNodeIconSrc(
  nodeType: WebTreeNodeType,
  icon: string | undefined,
  iconLoadError: boolean,
  isIconHovered: boolean,
  isSelected: boolean
): string {
  // 文件夹节点逻辑
  if (nodeType === WebTreeNodeType.FOLDER) {
    return isSelected ? iconMap.folder.url : iconMap.folder.dUrl
  }

  // Web节点图标逻辑
  // 1. 如果有自定义图标且加载成功，显示自定义图标（悬停不影响）
  if (icon && !iconLoadError) {
    return icon
  }

  // 2. 显示默认Web图标（dUrl或url取决于悬停状态）
  return isIconHovered ? iconMap.web.url : iconMap.web.dUrl
}

describe('TreeNode 图标逻辑', () => {
  describe('Web节点图标显示', () => {
    it('有自定义图标时应显示自定义图标', () => {
      const customIcon = 'https://example.com/favicon.ico'
      const result = getNodeIconSrc(
        WebTreeNodeType.WEBSITE,
        customIcon,
        false, // iconLoadError
        false, // isIconHovered
        false // isSelected
      )
      expect(result).toBe(customIcon)
    })

    it('无自定义图标时应显示默认Web图标(dUrl)', () => {
      const result = getNodeIconSrc(WebTreeNodeType.WEBSITE, undefined, false, false, false)
      expect(result).toBe(iconMap.web.dUrl)
    })

    it('图标字段为空字符串时应显示默认Web图标', () => {
      const result = getNodeIconSrc(WebTreeNodeType.WEBSITE, '', false, false, false)
      // 空字符串被视为 falsy，应显示默认图标
      expect(result).toBe(iconMap.web.dUrl)
    })
  })

  describe('图标加载错误处理', () => {
    it('自定义图标加载失败时应回退到默认图标', () => {
      const customIcon = 'https://invalid-url.com/icon.png'
      const result = getNodeIconSrc(
        WebTreeNodeType.WEBSITE,
        customIcon,
        true, // iconLoadError = true
        false,
        false
      )
      expect(result).toBe(iconMap.web.dUrl)
    })

    it('加载失败后悬停应切换到高亮图标', () => {
      const customIcon = 'https://invalid-url.com/icon.png'
      const result = getNodeIconSrc(
        WebTreeNodeType.WEBSITE,
        customIcon,
        true, // iconLoadError = true
        true, // isIconHovered = true
        false
      )
      expect(result).toBe(iconMap.web.url)
    })
  })

  describe('默认图标悬停交互', () => {
    it('鼠标悬停在默认图标上时应切换到高亮图标(url)', () => {
      const result = getNodeIconSrc(
        WebTreeNodeType.WEBSITE,
        undefined,
        false,
        true, // isIconHovered = true
        false
      )
      expect(result).toBe(iconMap.web.url)
    })

    it('鼠标离开默认图标时应恢复默认图标(dUrl)', () => {
      const result = getNodeIconSrc(
        WebTreeNodeType.WEBSITE,
        undefined,
        false,
        false, // isIconHovered = false
        false
      )
      expect(result).toBe(iconMap.web.dUrl)
    })

    it('有自定义图标时不应响应悬停切换', () => {
      const customIcon = 'https://example.com/favicon.ico'
      const result = getNodeIconSrc(
        WebTreeNodeType.WEBSITE,
        customIcon,
        false,
        true, // isIconHovered = true，但不应影响结果
        false
      )
      // 应该保持自定义图标，不切换
      expect(result).toBe(customIcon)
    })

    it('自定义图标加载失败后悬停应切换到高亮图标', () => {
      const customIcon = 'https://invalid-url.com/icon.png'
      // 加载失败后，handleIconMouseEnter 会允许悬停切换
      const result = getNodeIconSrc(
        WebTreeNodeType.WEBSITE,
        customIcon,
        true, // iconLoadError = true，此时允许悬停
        true, // isIconHovered = true
        false
      )
      expect(result).toBe(iconMap.web.url)
    })
  })

  describe('文件夹节点图标', () => {
    it('选中状态的文件夹应显示高亮文件夹图标', () => {
      const result = getNodeIconSrc(
        WebTreeNodeType.FOLDER,
        undefined,
        false,
        false,
        true // isSelected = true
      )
      expect(result).toBe(iconMap.folder.url)
    })

    it('未选中状态的文件夹应显示默认文件夹图标', () => {
      const result = getNodeIconSrc(
        WebTreeNodeType.FOLDER,
        undefined,
        false,
        false,
        false // isSelected = false
      )
      expect(result).toBe(iconMap.folder.dUrl)
    })

    it('文件夹节点不受悬停影响', () => {
      const resultWithHover = getNodeIconSrc(
        WebTreeNodeType.FOLDER,
        undefined,
        false,
        true, // isIconHovered = true，但不应影响文件夹
        false
      )
      expect(resultWithHover).toBe(iconMap.folder.dUrl)
    })

    it('文件夹节点不受自定义图标影响', () => {
      const result = getNodeIconSrc(
        WebTreeNodeType.FOLDER,
        'https://example.com/icon.png', // 自定义图标，但文件夹不使用
        false,
        false,
        false
      )
      expect(result).toBe(iconMap.folder.dUrl)
    })
  })

  describe('边界情况', () => {
    it('Web节点选中状态不应影响图标（与文件夹不同）', () => {
      const customIcon = 'https://example.com/favicon.ico'
      const resultUnselected = getNodeIconSrc(
        WebTreeNodeType.WEBSITE,
        customIcon,
        false,
        false,
        false
      )
      const resultSelected = getNodeIconSrc(WebTreeNodeType.WEBSITE, customIcon, false, false, true)
      // Web节点的选中状态不影响图标显示
      expect(resultUnselected).toBe(customIcon)
      expect(resultSelected).toBe(customIcon)
    })

    it('同时满足多个条件时应优先显示自定义图标', () => {
      const customIcon = 'https://example.com/favicon.ico'
      const result = getNodeIconSrc(
        WebTreeNodeType.WEBSITE,
        customIcon,
        false,
        false,
        true // 即使选中，Web节点也显示自定义图标
      )
      expect(result).toBe(customIcon)
    })

    it('空字符串图标应视为无图标', () => {
      const result = getNodeIconSrc(WebTreeNodeType.WEBSITE, '', false, false, false)
      expect(result).toBe(iconMap.web.dUrl)
    })
  })
})
