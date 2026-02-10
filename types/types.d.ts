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
  uniqueId: string // 复合唯一标识：typeId_id，用于解决不同表id重复问题
  typeId: number
  categoryId: number
  title: string
  content: string
  // 扩展字段（搜索结果显示用）
  categoryName?: string // 分类名称
  icon?: string // 网页图标
  url?: string // 网页URL
  shortcut?: string // 网页快捷键
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
  parentId: number // 父节点ID，0表示根节点
  typeId: number // 类型ID
  title: string // 节点名称
  url?: string | null // 网页地址（仅网页节点）
  shortcut?: string | null // 快捷键
  description?: string | null // 节点描述
  icon?: string | null // 网页图标地址（favicon）
  categoryId?: number | null // 分类ID（null表示未分类）
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

interface FaviconFetchResult {
  url: string | null
  title: string | null
  success: boolean
  error?: string
}

/**
 * 图标候选信息
 */
interface FaviconCandidate {
  url: string
  sizes?: string
  type?: string
  priority: number
}

/**
 * 书签导入参数
 */
interface ImportBookmarksParams {
  /** 类型ID */
  typeId: number
  /** 书签节点数组 */
  nodes: BookmarkImportNode[]
}

/**
 * 导入结果
 */
interface ImportResult {
  /** 是否成功 */
  success: boolean
  /** 导入的节点数量 */
  importedCount: number
  /** 分类ID */
  categoryId?: number
  /** 错误信息 */
  error?: string
}

/**
 * 书签导入节点
 */
interface BookmarkImportNode {
  /** 节点标题 */
  title: string
  /** 网页URL */
  url?: string
  /** 图标数据 */
  icon?: string
  /** 添加日期 */
  addDate?: string
  /** 子节点 */
  children?: BookmarkImportNode[]
}

declare module '@bytemd/vue-next' {
  // eslint-disable-next-line
  export const Editor: any
  // eslint-disable-next-line
  export const Viewer: any
}
