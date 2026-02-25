import { app, BrowserWindow, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { createWindow, getTargetUrl } from '../composables/createWindow'
import { createMenu } from '../composables/createMenu'

export const window: Record<WindowNameType, WindowClass> = {
  search: {
    id: 0,
    options: {
      width: 500,
      height: 500,
      center: true,
      resizable: false,
      frame: false,
      transparent: true, // 透明
      autoHideMenuBar: true,
      alwaysOnTop: true,
      // openDevTools: true,
      initShow: true,
      path: ''
    }
  },
  content: {
    id: 0,
    options: {
      width: 1000,
      height: 600,
      center: true,
      resizable: true,
      frame: true,
      transparent: false,
      // openDevTools: true,
      initShow: true,
      path: '/content'
      // path: '/content/1/category/0/catelog/11/article'
      // path: '/content/2/web/0/folder'
    }
  },
  note: {
    id: 0,
    options: {
      width: 600,
      height: 400,
      center: true,
      resizable: true,
      frame: false,
      transparent: true,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      // openDevTools: true,
      initShow: true,
      path: '/note-input'
    }
  }
}

export const getWindowByName = (name: WindowNameType): BrowserWindow => {
  // electron中的每一个窗口都有一个id
  let win = BrowserWindow.fromId(window[name].id)
  if (!win) {
    // 创建窗口
    win = createWindow(window[name].options)
    window[name].id = win.id
    if (name === 'search') {
      createMenu(name, win)
    }
  }
  win.hookWindowMessage(278, function () {
    win.setEnabled(false) //窗口禁用
    setTimeout(() => {
      win!.setEnabled(true) //窗口启用
    }, 100)
    return true
  })
  return win
}

export const getWindowByEvent = (event: IpcMainEvent | IpcMainInvokeEvent) => {
  return BrowserWindow.fromWebContents(event.sender)
}

/**
 * 打开/切换指定窗口到指定 path
 * @param name 窗口名称
 * @param path 要加载的路径，默认为配置中的 path
 * @returns BrowserWindow 实例
 */
export const showWindow = async (
  name: WindowNameType,
  path: string = window[name].options.path || ''
): Promise<BrowserWindow> => {
  // 1. 复用 getWindowByName 获取指定窗口（已存在则复用，不存在则创建）
  const win = getWindowByName(name)

  // 2. 获取当前窗口加载的 URL，检查是否需要切换 path
  const currentUrl = win.webContents.getURL()
  const targetUrl = getTargetUrl(path)

  // 3. 如果 path 不同，加载新 path
  if (!currentUrl.includes(path)) {
    await win.loadURL(targetUrl)
  }

  // 4. 重置窗口状态（居中、默认大小），给用户"新窗口"的体验
  win.setSize(window[name].options.width, window[name].options.height)
  if (window[name].options.center) {
    win.center()
  }

  // 5. 激活并显示窗口
  if (win.isMinimized()) win.restore()
  win.focus()
  win.show()

  return win
}

/**
 * 隐藏指定名称的窗口
 * @param name 窗口名称
 * @description 仅隐藏已存在且未销毁的窗口，不会创建新窗口
 */
export const hideWindow = (name: WindowNameType): void => {
  const win = BrowserWindow.fromId(window[name].id)
  if (win && !win.isDestroyed()) {
    win.hide()
  }
}

/**
 * 独占式打开指定窗口（打开指定窗口，隐藏其他所有窗口）
 * @param name 要显示的窗口名称
 * @param path 要加载的路径，默认为配置中的 path
 * @returns BrowserWindow 实例
 */
export const showWindowExclusive = async (
  name: WindowNameType,
  path: string = window[name].options.path || ''
): Promise<BrowserWindow> => {
  // 1. 先隐藏其他所有窗口
  ;(Object.keys(window) as WindowNameType[]).forEach((winName) => {
    if (winName !== name) {
      hideWindow(winName)
    }
  })

  // 2. 打开目标窗口
  return showWindow(name, path)
}

app.whenReady().then(() => {
  showWindow('search')
  // showWindowExclusive('content')
})
