import { app, BrowserWindow } from "electron"
import { createWindow } from "../composables/createWindow"

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

export const getWindowByName = (name: WindowNameType) => {
  // electron中的每一个窗口都有一个id
  let win = BrowserWindow.fromId(window[name].id)
  if(!win){
    // 创建窗口
    win = createWindow(window[name].options)
    window[name].id = win.id
  }
  return win
}

app.whenReady().then(() => {
  getWindowByName('search')
})
