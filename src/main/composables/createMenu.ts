import { BrowserWindow, ipcMain, Menu } from 'electron'
import { ipcEnum } from '../../enum/ipcEnum'
import { menu } from '../components/menu'

export function createMenu(windowName: WindowNameType, win: BrowserWindow) {
  ipcMain.on(ipcEnum.showMainMenu, (event) => {
    const eventWin = BrowserWindow.fromWebContents(event.sender)
    if (eventWin !== win) return
    const contextMenu = menu[windowName]
    if (contextMenu) {
      const windowMenu = Menu.buildFromTemplate(contextMenu)
      windowMenu.popup({
        window: win
      })
    }
  })
}
