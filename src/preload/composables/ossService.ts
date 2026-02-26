import { ipcRenderer } from 'electron'
import { ipcEnum } from '../../enum/ipcEnum'

export function uploadToOss(params: { config: OssConfig; fileInfo: OssFileInfo }) {
  return ipcRenderer.invoke(ipcEnum.ossUpload, params)
}
