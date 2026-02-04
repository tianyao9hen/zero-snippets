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
type WindowNameType = 'search' | 'content'

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

// 网页树节点类型枚举
enum WebTreeNodeType {
  FOLDER = 0, // 文件夹
  WEBSITE = 1 // 网页
}

// 网页树节点实体
type WebTreeNode = {
  id: number
  parentId: number | null // 父节点ID，0表示根节点
  typeId: number // 类型ID
  title: string // 节点名称
  url?: string | null // 网页地址（仅网页节点）
  shortcut?: string | null // 快捷键
  description?: string | null // 节点描述
  icon?: string | null // 网页图标地址（favicon）
  nodeType: WebTreeNodeType // 节点类型
  orderNum: number // 排序号
  createTime?: string // 创建时间
}

// 网页树节点（前端展示用，包含子节点）
type WebTreeNodeView = WebTreeNode & {
  children?: WebTreeNodeView[] // 子节点列表
  isExpanded?: boolean // 是否展开
  isEditing?: boolean // 是否正在编辑
  level?: number // 层级深度
}

// 搜索高亮信息
interface HighlightInfo {
  field: string // 匹配的字段名
  fieldLabel: string // 字段显示名称
  keyword: string // 搜索关键词
  matchedText: string // 匹配的完整文本
}

declare module '@bytemd/vue-next' {
  export const Editor: any
  export const Viewer: any
}
