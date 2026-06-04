import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { WebTreeNodeType } from '@renderer/enums'
import useWebTree from '@renderer/hooks/useWebTree'
import { processUrl } from '@renderer/composables/urlUtils'

type FolderOption = {
  id: number
  title: string
  path: string
  level: number
  categoryId: number
}

type QuickWebsiteForm = {
  title: string
  url: string
  shortcut: string
  description: string
  icon: string
  paramUrl: string
}

const WEB_TYPE_ID = 2
const ROOT_FOLDER: FolderOption = {
  id: 0,
  title: '根节点',
  path: '根节点',
  level: 0,
  categoryId: -1
}

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

function buildFolderOptions(nodes: WebTreeNode[]): FolderOption[] {
  const folders = nodes.filter((node) => node.nodeType === WebTreeNodeType.FOLDER)
  const folderMap = new Map(folders.map((node) => [node.id, node]))

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

export function useQuickWebsiteInput() {
  const { getWebTreeByTypeId, addWebTreeNode } = useWebTree()
  const flatNodes = ref<WebTreeNode[]>([])
  const selectedParentId = ref(0)
  const form = ref<QuickWebsiteForm>(createEmptyForm())
  const isLoading = ref(false)
  const isSaving = ref(false)

  const folderOptions = computed(() => buildFolderOptions(flatNodes.value))
  const selectedFolder = computed(
    () => folderOptions.value.find((folder) => folder.id === selectedParentId.value) ?? ROOT_FOLDER
  )

  async function loadTree() {
    isLoading.value = true
    try {
      flatNodes.value = await getWebTreeByTypeId(WEB_TYPE_ID)
    } finally {
      isLoading.value = false
    }
  }

  function resetForm() {
    form.value = createEmptyForm()
  }

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
