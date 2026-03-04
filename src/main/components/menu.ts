import { app } from 'electron'
import { closeIcon } from '../components/icon'
import { showWindowExclusive } from './window'

const mainMenu: Electron.MenuItemConstructorOptions[] = [
  {
    label: '知识库',
    click: () => {
      showWindowExclusive('content')
    }
  },
  {
    label: '网站库',
    click: () => {
      showWindowExclusive('content', '/content/2/web/0/folder')
    }
  },
  {
    label: '随手记',
    click: () => {
      showWindowExclusive('content', '/content/4/note')
    }
  },
  {
    label: '新增随手记',
    click: () => {
      showWindowExclusive('note')
    }
  },
  {
    label: '命令行',
    click: () => {
      showWindowExclusive('content', '/content/5/command-log')
    }
  },
  {
    label: '命令行日志',
    click: () => {
      showWindowExclusive('commandLog')
    }
  },
  {
    label: '设置',
    click: () => {
      showWindowExclusive('content', '/content/-1/setting')
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
  content: null,
  note: null,
  commandLog: null
}
