import { app } from 'electron'
import { closeIcon } from '../components/icon'

const mainMenu: Electron.MenuItemConstructorOptions[] = [
  {
    label: '退出',
    icon: closeIcon,
    click: () => {
      app.quit()
    }
  }
]

export const menu: Record<WindowNameType, Electron.MenuItemConstructorOptions[] | null> = {
  search: mainMenu,
}
