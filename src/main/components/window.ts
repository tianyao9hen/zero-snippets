import { app, BrowserWindow } from "electron"
import { createWindow } from "../composables/createWindow"

export const window: Record<string, WindowType> = {
  search: {
    id: 0,
    options: {
      width: 500,
      height: 350,
      openDevTools: false,
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
