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

// 内容类型
type ContentType = {
  id: number
  typeId: number
  content: string
}

type ContentTypeType = {
  id: number
  name: string
  title: string
}
