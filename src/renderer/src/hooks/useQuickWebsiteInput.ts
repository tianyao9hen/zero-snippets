import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { WebTreeNodeType } from '@renderer/enums'
import useWebTree from '@renderer/hooks/useWebTree'
import { processUrl } from '@renderer/composables/urlUtils'

/**
 * @file useQuickWebsiteInput.ts
 * @description 独立新增网站窗口的业务 Hook。
 */

/**
 * @description 独立窗口中可选择的目录项。
 */
export type FolderOption = {
  id: number // 目录节点 ID，0 表示根节点
  title: string // 目录显示名称
  path: string // 从根节点到当前目录的完整路径
  level: number // 目录层级，用于左侧树形菜单缩进
  categoryId: number // 新增网站继承的分类 ID
  parentId: number // 父目录 ID
  hasChildren: boolean // 是否存在子目录
  children: FolderOption[] // 子目录
}

/**
 * @description 新增网站表单数据。
 */
type QuickWebsiteForm = {
  title: string // 网站名称
  url: string // 网站地址
  shortcut: string // 搜索窗口内使用的网站快捷键
  description: string // 网站描述
  icon: string // favicon 地址
  paramUrl: string // 带参数占位符的搜索 URL
}

const WEB_TYPE_ID = 2

const ROOT_FOLDER: FolderOption = {
  id: 0,
  title: '根节点',
  path: '根节点',
  level: 0,
  categoryId: -1,
  parentId: -1,
  hasChildren: false,
  children: []
}

/**
 * 创建一份空的网站表单数据。
 * @returns 空表单对象
 */
function createEmptyForm(): QuickWebsiteForm {
  return {
    title: '',
    url: '',
    shortcut: '',
    description: '',
    icon: '',
    paramUrl: ''
  }
}

/**
 * 按排序字段和标题稳定排序目录。
 * @param folders 目录节点
 * @returns 排序后的目录节点
 */
function sortFolders(folders: WebTreeNode[]) {
  return folders.slice().sort((a, b) => a.orderNum - b.orderNum || a.title.localeCompare(b.title))
}

/**
 * 从扁平网站树节点中构造可选目录树。
 * @param nodes 网站树扁平节点列表
 * @returns 根节点目录树
 */
function buildFolderTree(nodes: WebTreeNode[]): FolderOption[] {
  const folders = sortFolders(nodes.filter((node) => node.nodeType === WebTreeNodeType.FOLDER))
  const childrenByParentId = new Map<number, WebTreeNode[]>()

  folders.forEach((folder) => {
    const siblings = childrenByParentId.get(folder.parentId) ?? []
    siblings.push(folder)
    childrenByParentId.set(folder.parentId, siblings)
  })

  /**
   * 递归创建目录项。
   * @param node 当前数据库目录节点
   * @param parentPath 父级路径
   * @param level 当前层级
   * @returns 可渲染目录项
   */
  function createFolderOption(node: WebTreeNode, parentPath: string, level: number): FolderOption {
    const path = `${parentPath} > ${node.title}`
    const children = (childrenByParentId.get(node.id) ?? []).map((child) =>
      createFolderOption(child, path, level + 1)
    )

    return {
      id: node.id,
      title: node.title,
      path,
      level,
      categoryId: node.categoryId ?? -1,
      parentId: node.parentId,
      hasChildren: children.length > 0,
      children
    }
  }

  const rootChildren = (childrenByParentId.get(0) ?? []).map((node) =>
    createFolderOption(node, ROOT_FOLDER.path, 1)
  )

  return [
    {
      ...ROOT_FOLDER,
      hasChildren: rootChildren.length > 0,
      children: rootChildren
    }
  ]
}

/**
 * 将目录树拍平成按展示顺序排列的列表。
 * @param tree 目录树
 * @returns 扁平目录列表
 */
function flattenFolderTree(tree: FolderOption[]): FolderOption[] {
  const folders: FolderOption[] = []

  /**
   * 深度优先收集目录项。
   * @param folder 当前目录项
   */
  function visit(folder: FolderOption) {
    folders.push(folder)
    folder.children.forEach(visit)
  }

  tree.forEach(visit)
  return folders
}

/**
 * 获取默认展开的父目录 ID。
 * @param tree 目录树
 * @returns 默认展开 ID 集合
 */
function getDefaultExpandedFolderIds(tree: FolderOption[]) {
  const ids = new Set<number>()

  /**
   * 展开根节点和一级目录，让初始层级关系直接可见。
   * @param folder 当前目录项
   */
  function visit(folder: FolderOption) {
    if (folder.hasChildren && folder.level <= 1) {
      ids.add(folder.id)
    }
    folder.children.forEach(visit)
  }

  tree.forEach(visit)
  return ids
}

/**
 * 管理独立新增网站窗口的目录选择与表单提交逻辑。
 * @returns 新增网站窗口需要的状态和操作函数
 */
export function useQuickWebsiteInput() {
  const { getWebTreeByTypeId, addWebTreeNode } = useWebTree()
  const flatNodes = ref<WebTreeNode[]>([]) // 当前网站库扁平节点
  const selectedParentId = ref(0) // 当前选中的父目录 ID
  const form = ref<QuickWebsiteForm>(createEmptyForm()) // 新增网站表单
  const isLoading = ref(false) // 是否正在加载目录树
  const isSaving = ref(false) // 是否正在保存网站
  const expandedFolderIds = ref<Set<number>>(new Set([0])) // 当前展开的目录 ID

  const folderTree = computed(() => buildFolderTree(flatNodes.value))
  const folderOptions = computed(() => flattenFolderTree(folderTree.value))
  const selectedFolder = computed(
    () => folderOptions.value.find((folder) => folder.id === selectedParentId.value) ?? ROOT_FOLDER
  )

  /**
   * 加载网站库的全部节点，用于构造目录选择树。
   */
  async function loadTree() {
    isLoading.value = true
    try {
      flatNodes.value = await getWebTreeByTypeId(WEB_TYPE_ID)
      expandedFolderIds.value = getDefaultExpandedFolderIds(folderTree.value)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 切换目录展开状态。
   * @param folderId 目录 ID
   */
  function toggleFolderExpanded(folderId: number) {
    const nextExpandedIds = new Set(expandedFolderIds.value)

    if (nextExpandedIds.has(folderId)) {
      nextExpandedIds.delete(folderId)
    } else {
      nextExpandedIds.add(folderId)
    }

    expandedFolderIds.value = nextExpandedIds
  }

  /**
   * 重置网站表单，保留当前目录选择以支持连续新增。
   */
  function resetForm() {
    form.value = createEmptyForm()
  }

  /**
   * 校验表单并保存网站节点。
   */
  async function submit() {
    const title = form.value.title.trim()
    if (!title) {
      message.warning('请输入名称')
      return
    }

    const processedUrl = processUrl(form.value.url)
    if (!processedUrl.isValid) {
      message.warning(processedUrl.error || '网址格式不正确')
      return
    }

    isSaving.value = true
    try {
      await addWebTreeNode({
        parentId: selectedParentId.value,
        typeId: WEB_TYPE_ID,
        title,
        url: processedUrl.url,
        shortcut: form.value.shortcut.trim() || undefined,
        description: form.value.description.trim() || undefined,
        icon: form.value.icon.trim() || undefined,
        paramUrl: form.value.paramUrl.trim() || undefined,
        categoryId: selectedFolder.value.categoryId,
        nodeType: WebTreeNodeType.WEBSITE,
        orderNum: 1000
      })
      message.success('网站已保存')
      resetForm()
      await loadTree()
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 隐藏独立新增网站窗口。
   */
  function close() {
    window.api.hideWindow('quickWebsite')
  }

  return {
    flatNodes,
    folderTree,
    folderOptions,
    expandedFolderIds,
    selectedParentId,
    selectedFolder,
    form,
    isLoading,
    isSaving,
    loadTree,
    toggleFolderExpanded,
    resetForm,
    submit,
    close
  }
}
