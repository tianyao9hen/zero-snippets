import { ipcRenderer } from 'electron'
import { ipcEnum } from '../../enum/ipcEnum'

export const getAutoLaunchStatus = () => {
  return ipcRenderer.invoke(ipcEnum.getAutoLaunchStatus)
}

export const toggleAutoLaunch = (enable: boolean) => {
  return ipcRenderer.invoke(ipcEnum.toggleAutoLaunch, enable)
}
