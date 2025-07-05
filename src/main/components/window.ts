import { app, BrowserWindow } from 'electron'
import { createWindow } from '../composables/createWindow'
import { createMenu } from '../composables/createMenu'

export const window: Record<WindowNameType, WindowType> = {
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
      openDevTools: true,
      initShow: true,
      path: ''
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

app.whenReady().then(() => {
  getWindowByName('search')
})
