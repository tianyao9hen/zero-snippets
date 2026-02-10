import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import icon from '../../../resources/icon.png?asset'
import { join } from 'path'

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
        ...(process.platform === 'linux' ? { icon } : {}),
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#' + options.path)
  } else {
    // TODO 打包后加载本地文件
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return window
}
