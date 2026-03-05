import { ipcRenderer } from 'electron'
import { ipcEnum } from '../../enum/ipcEnum'

export function uploadToOss(params: { config: OssConfig; fileInfo: OssFileInfo }) {
  return ipcRenderer.invoke(ipcEnum.ossUpload, params)
}

/**
 * 使用 Electron 原生对话框选择图片并上传，避免 packaged 下白屏
 */
export function pickAndUploadImages(params: { config: OssConfig }) {
  return ipcRenderer.invoke(ipcEnum.pickAndUploadImages, params)
}
