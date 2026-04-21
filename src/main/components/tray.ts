import { Tray, Menu, nativeImage, app, nativeTheme, systemPreferences } from 'electron'
import path from 'path'
import { menu } from './menu'
import { showWindowExclusive } from './window'

let tray: Tray | null = null

/**
 * 获取托盘图标路径
 * 根据开发/生产环境及系统深浅色自动适配：浅色用 icon_d.png，深色用 icon_w.png
 */
const getTrayIconPath = (): string => {
  const baseDir = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(app.getAppPath(), 'resources')

  let useDarkIcon: boolean
  if (process.platform === 'win32') {
    type RegistryReader = (hive: string, key: string, name: string) => number | null
    const readRegistryValueRaw = (
      systemPreferences as unknown as { readRegistryValueRaw?: RegistryReader }
    ).readRegistryValueRaw

    let systemUsesLightTheme: number | null = null
    if (typeof readRegistryValueRaw === 'function') {
      try {
        systemUsesLightTheme = readRegistryValueRaw(
          'HKCU',
          'Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize',
          'SystemUsesLightTheme'
        )
      } catch {
        systemUsesLightTheme = null
      }
    }

    // SystemUsesLightTheme=1 浅色任务栏 -> 需要深色图标(icon_d)
    // SystemUsesLightTheme=0 深色任务栏 -> 需要浅色图标(icon_w)
    useDarkIcon =
      systemUsesLightTheme !== null ? systemUsesLightTheme === 0 : nativeTheme.shouldUseDarkColors
  } else {
    useDarkIcon = nativeTheme.shouldUseDarkColors
  }

  return path.join(baseDir, useDarkIcon ? 'icon_w.png' : 'icon_d.png')
}

/**
 * 更新托盘图标（用于系统主题切换时）
 */
const updateTrayIcon = () => {
  if (tray && !tray.isDestroyed()) {
    const icon = nativeImage.createFromPath(getTrayIconPath())
    tray.setImage(icon)
  }
}

/**
 * 创建系统托盘
 * 确保单实例模式下唯一，防止重复创建；在窗口全部关闭后仍保持常驻，直到用户显式退出。
 * 托盘图标随系统深浅色主题自动切换。
 */
export const createTray = () => {
  // 防止重复创建
  if (tray) {
    return tray
  }

  const icon = nativeImage.createFromPath(getTrayIconPath())
  tray = new Tray(icon)

  // 设置悬停提示
  tray.setToolTip(`Zero Snippets ${app.getVersion()}`)

  // 构建上下文菜单
  const contextMenuTemplate = menu.search || []
  const contextMenu = Menu.buildFromTemplate(contextMenuTemplate)
  tray.setContextMenu(contextMenu)

  // 点击托盘图标显示主窗口
  tray.on('click', () => {
    showWindowExclusive('content')
  })

  // 系统深浅色主题变化时更新托盘图标
  nativeTheme.on('updated', updateTrayIcon)

  return tray
}
