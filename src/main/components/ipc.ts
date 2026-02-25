import { ipcMain, IpcMainEvent, shell } from 'electron'
import { ipcEnum } from '../../enum/ipcEnum'
import { getWindowByEvent, showWindowExclusive, hideWindow } from './window'
import './db/ipc'
import { toggleAutoLaunch, getAutoLaunchStatus } from './autoLaunch'

/**
 * 处理切换开机自启动的IPC请求
 * @param _event IPC事件对象（未使用）
 * @param enable 是否开启自启动，true为开启，false为关闭
 */
ipcMain.handle(ipcEnum.toggleAutoLaunch, (_event, enable: boolean) => {
  return toggleAutoLaunch(enable)
})

/**
 * 处理获取开机自启动状态的IPC请求
 * @returns 返回当前自启动状态
 */
ipcMain.handle(ipcEnum.getAutoLaunchStatus, () => {
  return getAutoLaunchStatus()
})

ipcMain.on(
  ipcEnum.setIgnoreMouseEvent,
  (event: IpcMainEvent, ignore: boolean, options: { forward: boolean }) => {
    getWindowByEvent(event)?.setIgnoreMouseEvents(ignore, options)
  }
)

ipcMain.on(
  ipcEnum.showWindowExclusive,
  (_event: IpcMainEvent, name: WindowNameType, path?: string) => {
    showWindowExclusive(name, path)
  }
)

ipcMain.on(ipcEnum.hideWindow, (_event: IpcMainEvent, name: WindowNameType) => {
  hideWindow(name)
})

ipcMain.on(ipcEnum.openExternal, (_event: IpcMainEvent, url: string) => {
  shell.openExternal(url)
})
