import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import icon from '../../../resources/icon.png?asset'
import { join } from 'path'

// 统一构建目标 URL
export const getTargetUrl = (path: string): string => {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    return process.env['ELECTRON_RENDERER_URL'] + '/#' + path
  }
  return `file://${join(__dirname, '../renderer/index.html')}#${path}`
}

export function createWindow(options: OptionsClass): BrowserWindow {
  const window = new BrowserWindow(
    Object.assign(
      {
        show: false,
        frame: true,
        resizable: true,
        autoHideMenuBar: true,
        alwaysOnTop: false,
        transparent: true, // 窗口透明
        icon,
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      },
      options
    )
  )

  if (is.dev && options.openDevTools) {
    window.webContents.openDevTools()
  }

  window.on('ready-to-show', () => {
    window.setOpacity(0.99) // 触发重绘
    setTimeout(() => window.setOpacity(1), 100)
    options.initShow && window.show()
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 使用统一的 URL 构建方法
  window.loadURL(getTargetUrl(options.path || ''))

  return window
}
