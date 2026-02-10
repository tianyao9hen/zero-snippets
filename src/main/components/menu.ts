import { app } from 'electron'
import { closeIcon } from '../components/icon'
import { showWindowExclusive } from './window'

const mainMenu: Electron.MenuItemConstructorOptions[] = [
  {
    label: '内容',
    click: () => {
      showWindowExclusive('content')
    }
  },
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
  content: null
}
