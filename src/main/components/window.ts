import { app, BrowserWindow, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { createWindow } from '../composables/createWindow'
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
      openDevTools: false,
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
      openDevTools: true,
      initShow: true,
      // path: '/content'
      // path: '/content/1/category/0/catelog'
      path: '/content/2/web/0/folder'
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
    createMenu(name, win)
  }
  win.hookWindowMessage(278, function (_e) {
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

app.whenReady().then(() => {
  // getWindowByName('search')
  getWindowByName('content')
})
