import { Tray, Menu, nativeImage, app } from 'electron'
import path from 'path'
import { menu } from './menu'
import { showWindowExclusive } from './window'

let tray: Tray | null = null

/**
 * 创建系统托盘
 * 确保单实例模式下唯一，防止重复创建；在窗口全部关闭后仍保持常驻，直到用户显式退出。
 */
export const createTray = () => {
  // 防止重复创建
  if (tray) {
    return tray
  }

  const iconPath = getIconPath()
  const icon = nativeImage.createFromPath(iconPath)

  tray = new Tray(icon)

  // 设置悬停提示
  tray.setToolTip('Zero Snippets')

  // 构建上下文菜单
  // 使用 menu.search 作为基础模板
  const contextMenuTemplate = menu.search || []

  const contextMenu = Menu.buildFromTemplate(contextMenuTemplate)
  tray.setContextMenu(contextMenu)

  // 点击托盘图标显示主窗口 (content 窗口)
  tray.on('click', () => {
    showWindowExclusive('content')
  })

  return tray
}

/**
 * 获取图标路径
 * 根据开发环境和生产环境自动适配
 */
const getIconPath = (): string => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'resources', 'icon.png')
  } else {
    // 开发环境：假设 resources 目录在项目根目录
    return path.join(app.getAppPath(), 'resources', 'icon.png')
  }
}
