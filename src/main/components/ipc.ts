import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, shell, dialog } from 'electron'
import { readFile } from 'node:fs/promises'
import { ipcEnum } from '../../enum/ipcEnum'
import { getWindowByEvent, showWindowExclusive, hideWindow, showWindow } from './window'
import { toggleAutoLaunch, getAutoLaunchStatus } from './autoLaunch'
import './db/ipc'

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

ipcMain.on(ipcEnum.showWindow, (_event: IpcMainEvent, name: WindowNameType, path?: string) => {
  showWindow(name, path)
})

ipcMain.on(ipcEnum.hideWindow, (_event: IpcMainEvent, name: WindowNameType) => {
  hideWindow(name)
})

ipcMain.on(ipcEnum.openExternal, (_event: IpcMainEvent, url: string) => {
  shell.openExternal(url)
})

ipcMain.handle(ipcEnum.ossUpload, async (_event, params) => {
  const { registerOssService } = await import('./ossService')
  return registerOssService(params)
})

/**
 * 使用 Electron 原生对话框选择图片并上传，避免 packaged 下 input[type=file] 导致白屏
 * 仅在打包后使用此路径，开发模式仍走 Bytemd 默认的 upload-images
 */
ipcMain.handle(
  ipcEnum.pickAndUploadImages,
  async (event: IpcMainInvokeEvent, params: { config: OssConfig }) => {
    const win = getWindowByEvent(event)
    if (!win) return { success: false, images: [] }
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }]
    })
    if (canceled || !filePaths?.length) {
      return { success: true, images: [] }
    }
    const { registerOssService } = await import('./ossService')
    const images: { title: string; url: string }[] = []
    for (const path of filePaths) {
      try {
        const buffer = await readFile(path)
        const name = `images/${Date.now()}_${path.split(/[/\\]/).pop()}`
        const result = await registerOssService({
          config: params.config,
          fileInfo: { name, buffer }
        })
        if (result.success && result.url) {
          images.push({ title: name.split('/').pop() || '', url: result.url })
        }
      } catch (err) {
        console.error('pickAndUploadImages error:', err)
      }
    }
    return { success: true, images }
  }
)
