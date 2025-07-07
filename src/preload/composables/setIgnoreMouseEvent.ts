import { ipcRenderer } from 'electron'
import { ipcEnum } from '../../enum/ipcEnum'

export const setIgnoreMouseEvent = (ignore: boolean, options?: { forward: boolean }) => {
  ipcRenderer.send(ipcEnum.setIgnoreMouseEvent, ignore, options)
}
