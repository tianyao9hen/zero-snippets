import { ipcRenderer } from 'electron'
import { ipcEnum } from '../../enum/ipcEnum'

/** 仅打开/聚焦指定窗口，不隐藏其他窗口 */
export const showWindow = (name: WindowNameType, path?: string) => {
  ipcRenderer.send(ipcEnum.showWindow, name, path)
}

/** 打开指定窗口并隐藏其他窗口（不含 note、commandLog） */
export const showWindowExclusive = (name: WindowNameType, path?: string) => {
  ipcRenderer.send(ipcEnum.showWindowExclusive, name, path)
}

export const hideWindow = (name: WindowNameType) => {
  ipcRenderer.send(ipcEnum.hideWindow, name)
}

export const openExternal = (url: string) => {
  ipcRenderer.send('open-external', url)
}
