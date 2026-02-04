<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
    @click.self="closeDialog"
  >
    <div class="w-[360px] max-w-[90vw] bg-white rounded-lg shadow-lg max-h-[90vh] flex flex-col">
      <h3
        class="px-4 py-3 text-sm font-semibold text-slate-800 border-b border-slate-200 flex-shrink-0"
      >
        {{ dialogTitle }}
      </h3>
      <div class="p-3 overflow-y-auto">
        <!-- 父节点信息展示区域（只读） -->
        <div class="mb-3">
          <label class="block mb-1 text-xs font-medium text-slate-500">父节点位置：</label>
          <div
            class="px-2.5 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded break-all"
          >
            {{ parentPathDisplay }}
          </div>
        </div>

        <div class="mb-3">
          <label class="block mb-1 text-xs font-medium text-slate-500">节点类型：</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
              <input
                v-model="dialogForm.nodeType"
                type="radio"
                :value="WebTreeNodeType.FOLDER"
                :disabled="isNodeTypeDisabled"
                :class="isNodeTypeDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
              />
              <span>文件夹</span>
            </label>
            <label class="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
              <input
                v-model="dialogForm.nodeType"
                type="radio"
                :value="WebTreeNodeType.WEBSITE"
                :disabled="isNodeTypeDisabled"
                :class="isNodeTypeDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
              />
              <span>网页</span>
            </label>
          </div>
        </div>

        <div class="mb-3">
          <label class="block mb-1 text-xs font-medium text-slate-500">名称：</label>
          <input
            v-model="dialogForm.title"
            type="text"
            placeholder="请输入名称"
            class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded outline-none transition-colors duration-200 focus:border-[#4096ff] placeholder:text-slate-400"
          />
        </div>

        <div v-if="dialogForm.nodeType === WebTreeNodeType.WEBSITE" class="mb-3">
          <label class="block mb-1 text-xs font-medium text-slate-500">网址：</label>
          <input
            v-model="dialogForm.url"
            type="text"
            placeholder="example.com 或 https://example.com"
            class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded outline-none transition-colors duration-200 focus:border-[#4096ff] placeholder:text-slate-400"
            :class="{ 'has-hint': showUrlProtocolHint }"
            @blur="handleUrlBlur"
          />
          <div
            v-if="showUrlProtocolHint"
            class="flex items-center gap-1 mt-1 text-[10px] text-[#4096ff] before:content-['💡']"
          >
            将自动添加 https:// 前缀
          </div>
        </div>

        <!-- 图标预览区域 -->
        <div v-if="dialogForm.nodeType === WebTreeNodeType.WEBSITE" class="mb-3">
          <label class="block mb-1 text-xs font-medium text-slate-500">网站图标：</label>
          <div class="flex items-center gap-3">
            <!-- 图标显示 -->
            <div
              class="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              <img
                v-if="faviconStatus === FaviconFetchStatus.SUCCESS && faviconUrl"
                :src="faviconUrl"
                alt="网站图标"
                class="w-6 h-6 object-contain"
                @error="handleFaviconError"
              />
              <div
                v-else-if="faviconStatus === FaviconFetchStatus.LOADING"
                class="w-5 h-5 border-2 border-slate-300 border-t-[#4096ff] rounded-full animate-spin"
              />
              <svg
                v-else
                class="w-6 h-6 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <!-- 图标信息和操作 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span
                  v-if="faviconStatus === FaviconFetchStatus.SUCCESS"
                  class="text-xs text-green-600 truncate"
                >
                  获取成功
                </span>
                <span
                  v-else-if="faviconStatus === FaviconFetchStatus.LOADING"
                  class="text-xs text-slate-500"
                >
                  获取中...
                </span>
                <span
                  v-else-if="faviconStatus === FaviconFetchStatus.ERROR"
                  class="text-xs text-red-500 truncate"
                  :title="faviconError"
                >
                  {{ faviconError || '获取失败' }}
                </span>
                <span v-else class="text-xs text-slate-400"> 输入网址后自动获取 </span>
              </div>
              <button
                v-if="dialogForm.url && faviconStatus !== FaviconFetchStatus.LOADING"
                type="button"
                class="mt-1 text-[10px] text-[#4096ff] hover:text-blue-600 cursor-pointer"
                @click="fetchFaviconManual"
              >
                {{ faviconStatus === FaviconFetchStatus.SUCCESS ? '重新获取' : '手动获取' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="dialogForm.nodeType === WebTreeNodeType.WEBSITE" class="mb-3">
          <label class="block mb-1 text-xs font-medium text-slate-500">快捷键：</label>
          <input
            v-model="dialogForm.shortcut"
            type="text"
            placeholder="用于快速搜索，如: gh"
            class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded outline-none transition-colors duration-200 focus:border-[#4096ff] placeholder:text-slate-400"
          />
        </div>

        <div class="mb-0">
          <label class="block mb-1 text-xs font-medium text-slate-500">描述：</label>
          <textarea
            v-model="dialogForm.description"
            placeholder="可选：输入描述信息"
            rows="2"
            class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded outline-none transition-colors duration-200 focus:border-[#4096ff] placeholder:text-slate-400 resize-y min-h-[50px]"
          ></textarea>
        </div>
      </div>
      <div class="flex justify-end gap-2 px-4 py-2.5 border-t border-slate-200 flex-shrink-0">
        <button
          class="px-3 py-1.5 text-xs rounded cursor-pointer transition-all duration-200 border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
          @click="closeDialog"
        >
          取消
        </button>
        <button
          class="px-3 py-1.5 text-xs rounded cursor-pointer transition-all duration-200 border border-[#4096ff] bg-[#4096ff] text-white hover:bg-blue-500"
          @click="confirmDialog"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import useWebTree from '@renderer/hooks/useWebTree'
import { processUrl, hasProtocol } from '@renderer/composables/urlUtils'
import {
  FaviconFetchStatus,
  createDebouncedFaviconFetcher
} from '@renderer/composables/faviconUtils'
import { WebTreeNodeType } from '@renderer/enums'

export interface NodeData {
  id: number
  nodeType: WebTreeNodeType
  title: string
  url?: string
  shortcut?: string
  description?: string
  icon?: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  parentId?: number
  typeId?: number
  nodeType?: WebTreeNodeType
  nodeData?: NodeData
  flatNodeList?: WebTreeNode[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [updatedData?: NodeData]
}>()

const { addWebTreeNode, updateWebTreeNode, getParentPathNames } = useWebTree()

const dialogForm = ref<{
  nodeType: WebTreeNodeType
  title: string
  url: string
  shortcut: string
  description: string
  icon: string
}>({
  nodeType: WebTreeNodeType.FOLDER,
  title: '',
  url: '',
  shortcut: '',
  description: '',
  icon: ''
})

const selectedParentId = ref<number>(0)

const isEditing = computed(() => props.mode === 'edit')

const dialogTitle = computed(() => (isEditing.value ? '编辑节点' : '添加节点'))

const isNodeTypeDisabled = computed(() => isEditing.value)

// 获取节点的完整路径名称（包含节点本身）
// 规则：
// - 1-2级：完整显示所有层级
// - 3级：完整显示所有层级
// - 超过3级：显示 "根节点 > ... > 父节点 > 当前节点"
const getNodePathNames = (nodes: WebTreeNode[], nodeId: number): string => {
  if (nodeId === 0) return '根节点'

  const node = nodes.find((n) => n.id === nodeId)
  if (!node) return '根节点'

  // 构建完整路径数组（包含当前节点）
  const pathNames: string[] = [node.title]
  let currentId = node.parentId ?? 0

  // 向上遍历获取所有父节点名称
  while (currentId !== 0) {
    const parentNode = nodes.find((n) => n.id === currentId)
    if (!parentNode) break
    pathNames.unshift(parentNode.title)
    currentId = parentNode.parentId ?? 0
  }

  // 添加根节点
  pathNames.unshift('根节点')

  // 根据层级数量决定显示方式
  if (pathNames.length <= 3) {
    // 3级以内（根节点 + 最多2个节点），完整显示
    return pathNames.join(' > ')
  } else {
    // 超过3级，显示为：根节点 > ... > 父节点 > 当前节点
    const root = pathNames[0]
    const current = pathNames[pathNames.length - 1]
    const parent = pathNames[pathNames.length - 2]
    return `${root} > ... > ${parent} > ${current}`
  }
}

// 父节点路径显示
const parentPathDisplay = computed(() => {
  const nodes = props.flatNodeList || []
  if (isEditing.value && props.nodeData) {
    // 编辑模式：显示当前节点的父节点路径
    const currentNode = nodes.find((n) => n.id === props.nodeData!.id)
    if (currentNode) {
      return getParentPathNames(nodes, currentNode.parentId ?? 0)
    }
  }
  // 添加模式：显示父节点的完整路径（包含父节点本身）
  return getNodePathNames(nodes, selectedParentId.value)
})

const showUrlProtocolHint = computed(() => {
  if (dialogForm.value.nodeType !== WebTreeNodeType.WEBSITE) {
    return false
  }
  const url = dialogForm.value.url.trim()
  if (!url) {
    return false
  }
  return !hasProtocol(url)
})

// ============ 图标获取相关 ============
const faviconStatus = ref<FaviconFetchStatus>(FaviconFetchStatus.IDLE)
const faviconUrl = ref<string>('')
const faviconError = ref<string>('')

// 创建防抖的图标获取函数
const debouncedFetchFavicon = createDebouncedFaviconFetcher((result) => {
  faviconStatus.value = result.status
  if (result.status === FaviconFetchStatus.SUCCESS && result.url) {
    faviconUrl.value = result.url
    dialogForm.value.icon = result.url
    faviconError.value = ''
  } else if (result.status === FaviconFetchStatus.ERROR) {
    faviconError.value = result.error || '获取失败'
    // 不重置已存在的图标，允许保留旧值
  }
}, 500)

// 处理URL输入框失焦
const handleUrlBlur = () => {
  const url = dialogForm.value.url.trim()
  if (url && dialogForm.value.nodeType === WebTreeNodeType.WEBSITE) {
    // 处理URL，添加协议
    const result = processUrl(url)
    if (result.isValid) {
      dialogForm.value.url = result.url
      // 触发图标获取
      debouncedFetchFavicon(result.url)
    }
  }
}

// 手动获取图标
const fetchFaviconManual = () => {
  const url = dialogForm.value.url.trim()
  if (url && dialogForm.value.nodeType === WebTreeNodeType.WEBSITE) {
    const result = processUrl(url)
    if (result.isValid) {
      dialogForm.value.url = result.url
      debouncedFetchFavicon(result.url)
    }
  }
}

// 处理图标加载错误
const handleFaviconError = () => {
  faviconStatus.value = FaviconFetchStatus.ERROR
  faviconError.value = '图标加载失败'
}

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      // 重置图标状态
      faviconStatus.value = FaviconFetchStatus.IDLE
      faviconError.value = ''

      if (isEditing.value && props.nodeData) {
        dialogForm.value = {
          nodeType: props.nodeData.nodeType,
          title: props.nodeData.title,
          url: props.nodeData.url || '',
          shortcut: props.nodeData.shortcut || '',
          description: props.nodeData.description || '',
          icon: props.nodeData.icon || ''
        }
        // 如果有图标，显示它
        if (props.nodeData.icon) {
          faviconUrl.value = props.nodeData.icon
          faviconStatus.value = FaviconFetchStatus.SUCCESS
        }
        // 编辑模式下不需要选择父节点
        selectedParentId.value = 0
      } else {
        // 添加模式：使用传入的 nodeType 或默认为文件夹
        dialogForm.value = {
          nodeType: props.nodeType ?? WebTreeNodeType.FOLDER,
          title: '',
          url: '',
          shortcut: '',
          description: '',
          icon: ''
        }
        faviconUrl.value = ''
        // 添加模式下初始化父节点选择
        selectedParentId.value = props.parentId ?? 0
      }
    }
  },
  { immediate: true }
)

const closeDialog = () => {
  emit('update:visible', false)
}

const confirmDialog = async () => {
  if (!dialogForm.value.title.trim()) {
    alert('请输入名称')
    return
  }

  if (dialogForm.value.nodeType === WebTreeNodeType.WEBSITE) {
    if (!dialogForm.value.url.trim()) {
      alert('请输入网址')
      return
    }
    const result = processUrl(dialogForm.value.url)
    if (!result.isValid) {
      alert(result.error || '网址格式不正确')
      return
    }
    dialogForm.value.url = result.url
    if (result.protocolAdded) {
      console.log(`URL协议已自动补全: ${result.url}`)
    }
  }

  try {
    if (isEditing.value) {
      if (props.nodeData) {
        await updateWebTreeNode(props.nodeData.id, {
          title: dialogForm.value.title.trim(),
          url: dialogForm.value.url.trim() || undefined,
          shortcut: dialogForm.value.shortcut.trim() || undefined,
          description: dialogForm.value.description.trim() || undefined,
          icon: dialogForm.value.icon.trim() || undefined
        })
      }
    } else {
      await addWebTreeNode({
        parentId: selectedParentId.value,
        typeId: props.typeId ?? 2,
        title: dialogForm.value.title.trim(),
        url: dialogForm.value.url.trim() || undefined,
        shortcut: dialogForm.value.shortcut.trim() || undefined,
        description: dialogForm.value.description.trim() || undefined,
        icon: dialogForm.value.icon.trim() || undefined,
        nodeType: dialogForm.value.nodeType,
        orderNum: 0
      })
    }

    closeDialog()

    // 编辑模式下，传递更新后的数据给父组件
    if (isEditing.value && props.nodeData) {
      const updatedData: NodeData = {
        id: props.nodeData.id,
        nodeType: dialogForm.value.nodeType,
        title: dialogForm.value.title.trim(),
        url: dialogForm.value.url.trim() || undefined,
        shortcut: dialogForm.value.shortcut.trim() || undefined,
        description: dialogForm.value.description.trim() || undefined,
        icon: dialogForm.value.icon.trim() || undefined
      }
      emit('success', updatedData)
    } else {
      emit('success')
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : isEditing.value ? '更新失败' : '添加失败')
  }
}
</script>
