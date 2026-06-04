import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { WebTreeNodeType } from '@renderer/enums'
import useWebTree from '@renderer/hooks/useWebTree'
import { processUrl } from '@renderer/composables/urlUtils'

/**
 * @file useQuickWebsiteInput.ts
 * @description 独立新增网站窗口的业务 Hook。
 * - 加载网站库目录节点
 * - 构建可选择的目录列表
 * - 校验并保存网站节点
 */

/**
 * @description 独立窗口中可选择的目录项。
 */
type FolderOption = {
  id: number // 目录节点 ID，0 表示根节点
  title: string // 目录显示名称
  path: string // 从根节点到当前目录的完整路径
  level: number // 目录层级，用于左侧列表缩进
  categoryId: number // 新增网站继承的分类 ID
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

// 网站库在 snippets_type 中的固定 typeId。
const WEB_TYPE_ID = 2
// 根节点不是数据库真实节点，用于支持“添加到网站库根目录”。
const ROOT_FOLDER: FolderOption = {
  id: 0,
  title: '根节点',
  path: '根节点',
  level: 0,
  categoryId: -1
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
 * 从扁平网站树节点中提取可选目录列表。
 * @param nodes 网站树扁平节点列表
 * @returns 根节点和所有文件夹节点组成的目录选项
 */
function buildFolderOptions(nodes: WebTreeNode[]): FolderOption[] {
  const folders = nodes.filter((node) => node.nodeType === WebTreeNodeType.FOLDER)
  const folderMap = new Map(folders.map((node) => [node.id, node]))

  /**
   * 获取目录从根节点到自身的路径片段。
   * @param node 目录节点
   * @returns 路径片段数组
   */
  function getPathParts(node: WebTreeNode): string[] {
    const names = [node.title]
    let parentId = node.parentId

    while (parentId !== 0) {
      const parent = folderMap.get(parentId)
      if (!parent) break
      names.unshift(parent.title)
      parentId = parent.parentId
    }

    return ['根节点', ...names]
  }

  return [
    ROOT_FOLDER,
    ...folders
      .slice()
      .sort((a, b) => a.orderNum - b.orderNum)
      .map((node) => {
        const pathParts = getPathParts(node)
        return {
          id: node.id,
          title: node.title,
          path: pathParts.join(' > '),
          level: pathParts.length - 1,
          categoryId: node.categoryId ?? -1
        }
      })
  ]
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

  const folderOptions = computed(() => buildFolderOptions(flatNodes.value))
  const selectedFolder = computed(
    () => folderOptions.value.find((folder) => folder.id === selectedParentId.value) ?? ROOT_FOLDER
  )

  /**
   * 加载网站库的全部节点，用于构造目录选择列表。
   */
  async function loadTree() {
    isLoading.value = true
    try {
      flatNodes.value = await getWebTreeByTypeId(WEB_TYPE_ID)
    } finally {
      isLoading.value = false
    }
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
    folderOptions,
    selectedParentId,
    selectedFolder,
    form,
    isLoading,
    isSaving,
    loadTree,
    resetForm,
    submit,
    close
  }
}
