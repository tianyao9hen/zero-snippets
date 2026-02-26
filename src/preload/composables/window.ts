import { ipcRenderer } from 'electron'
import { ipcEnum } from '../../enum/ipcEnum'

export const showWindowExclusive = (name: WindowNameType, path?: string) => {
  ipcRenderer.send(ipcEnum.showWindowExclusive, name, path)
}

export const hideWindow = (name: WindowNameType) => {
  ipcRenderer.send(ipcEnum.hideWindow, name)
}

export const openExternal = (url: string) => {
  ipcRenderer.send('open-external', url)
}
