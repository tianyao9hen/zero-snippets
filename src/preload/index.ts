import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { showMainMenu } from './composables/menu'
import { setIgnoreMouseEvent } from './composables/setIgnoreMouseEvent'

// Custom APIs for renderer
const api = {
  showMainMenu,
  setIgnoreMouseEvent
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
