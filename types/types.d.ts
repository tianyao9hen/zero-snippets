// 窗口配置类
interface OptionsClass extends Partial<Electron.BrowserWindowConstructorOptions> {
  width: number
  height: number
  openDevTools?: boolean
  initShow?: boolean
  path?: string
}

// 窗口类
type WindowClass = {
  id: number
  options: OptionsClass
}

// 窗口名称类型
type WindowNameType = 'search' | 'content';

type SqlActionType = 'findAll' | 'findOne' | 'insert' | 'update' | 'del'

// 图标类
type IconClass = {
  id: string
  url: string
  dUrl: string
}

// 内容
type ContentEntity = {
  id: number
  typeId: number
  categoryId: number
  title: string
  content: string
}

// 内容类型
type TypeEntity = {
  id: number
  name: string
  title: string
  orderNum: number
  createTime?: string
}

// 文章分类
type CategoryEntity = {
  id: number
  typeId: number
  title: string
  orderNum: number
  createTime?: string
}
