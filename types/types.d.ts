// 窗口配置类
interface OptionsType extends Partial<Electron.BrowserWindowConstructorOptions> {
  width: number
  height: number
  openDevTools?: boolean
  initShow?: boolean
  path?: string
}

// 窗口类
type WindowType = {
  id: number
  options: OptionsType
}

// 窗口名称类型
type WindowNameType = 'search' | 'content';

// 内容
type ContentType = {
  id: number
  typeId: number
  categoryId: number
  title: string
  content: string
}

// 内容类型
type ContentTypeType = {
  id: number
  name: string
  title: string
}

// 图标
type IconEntity = {
  id: string
  url: string
  dUrl: string
}

type CategoryType = {
  id: number
  typeId: number
  title: string
}
