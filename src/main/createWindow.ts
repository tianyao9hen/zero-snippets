import { is } from '@electron-toolkit/utils'
import { BrowserWindow, BrowserWindowConstructorOptions, shell } from 'electron'
import { join } from 'path'

export interface OptionsType extends Partial<BrowserWindowConstructorOptions> {
  width: number
  height: number
  openDevTools?: boolean
  initShow?: boolean
  path?: string
}

export function createWindow(options: OptionsType): BrowserWindow {
  const window = new BrowserWindow(
    Object.assign(
      {
        show: false,
        frame: false,
        resizable: true,
        autoHideMenuBar: false,
        alwaysOnTop: false,
        transparent: true, // 窗口透明
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
    options.initShow && window.show()
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'] + options.path)
  } else {
    // TODO 打包后加载本地文件
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}
