import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      showMainMenu: () => void
      setIgnoreMouseEvent:(ignore: boolean, options?: { forward: boolean }) => void
    }
  }
}
