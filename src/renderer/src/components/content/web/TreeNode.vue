<template>
  <!-- 树节点组件 - 递归渲染树形结构 -->
  <div
    ref="nodeRef"
    class="tree-node select-none"
    :class="{
      'is-selected': isSelected,
      'is-dragging': isDragging,
      'is-drop-target': isDropTarget && currentDropPosition === 'inside',
      'is-drop-before': isDropTarget && currentDropPosition === 'before',
      'is-drop-after': isDropTarget && currentDropPosition === 'after',
      'is-new-node': isNewNode
    }"
    :style="{ paddingLeft: `${level <= 1 ? level * 16 : 16}px` }"
    :data-node-id="node.id"
    :draggable="true"
    @click.stop="handleClick"
    @dblclick="handleDblClick"
    @contextmenu="handleContextMenu"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- 拖拽放置指示线 - 上方 -->
    <div
      v-if="isDropTarget && currentDropPosition === 'before'"
      class="drop-indicator drop-indicator-before"
    />

    <!-- 节点内容区域 -->
    <div
      class="tree-node-content flex items-center h-6 px-1 py-0.5 rounded cursor-pointer transition-all duration-200"
      :class="{
        'bg-[#4096ff]': isSelected,
        'bg-[rgba(64,150,255,0.1)]': isHovered && !isSelected,
        'drop-target-inside': isDropTarget && currentDropPosition === 'inside'
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- 展开/折叠图标 -->
      <span
        v-if="hasChildren"
        class="flex items-center justify-center w-4 h-4 mr-0.5 text-slate-500 transition-transform duration-200 cursor-pointer hover:text-[#4096ff]"
        :class="{ 'rotate-90': node.isExpanded, '!text-white': isSelected }"
        @click.stop="toggleExpand"
      >
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
        </svg>
      </span>
      <span v-else class="w-4 h-4 mr-0.5"></span>

      <!-- 节点图标 -->
      <span
        class="flex items-center justify-center w-4 h-4 mr-1"
        @mouseenter="handleIconMouseEnter"
        @mouseleave="handleIconMouseLeave"
      >
        <img :src="nodeIconSrc" :alt="nodeIconAlt" class="w-3.5 h-3.5" @error="handleIconError" />
      </span>

      <!-- 节点标题 - 编辑模式 -->
      <input
        v-if="node.isEditing"
        ref="editInputRef"
        v-model="editTitle"
        class="flex-1 h-[18px] px-1 text-xs border border-[#4096ff] rounded outline-none bg-white text-gray-800"
        spellcheck="false"
        @keydown="handleEditKeydown"
        @blur="handleEditBlur"
      />

      <!-- 节点标题 - 展示模式 -->
      <div v-else class="flex-1 flex items-center min-w-0 gap-1" :title="nodeTooltip">
        <!-- 节点名称和未分类标识容器 -->
        <div class="flex items-center gap-1 max-w-[140px]">
          <!-- 节点名称 -->
          <span class="text-xs leading-[18px] truncate" :class="{ 'text-white': isSelected }">
            <HighlightText
              :text="node.title"
              :keyword="highlightInfo?.keyword"
              :is-selected="isSelected"
            />
          </span>

          <!-- 未分类标识 -->
          <span
            v-if="node.categoryId === -1"
            class="text-[10px] px-1 py-0.5 rounded flex-shrink-0"
            :class="isSelected ? 'bg-gray-500/50 text-gray-200' : 'bg-gray-100 text-gray-500'"
          >
            未分类
          </span>
        </div>

        <!-- 网页节点额外信息 - 表格样式右对齐 -->
        <div v-if="isWebNode" class="flex-1 flex items-center justify-end pr-3">
          <!-- 信息容器 - 固定宽度保持对齐 -->
          <div class="flex items-center w-full max-w-[450px]">
            <!-- 地址 -->
            <span
              class="w-[50%] text-[10px] truncate text-left"
              :class="isSelected ? 'text-blue-200' : 'text-slate-400'"
            >
              {{ node.url || '' }}
            </span>
            <!-- 快捷键 -->
            <span class="w-[15%] text-[10px] truncate text-left">
              <span
                v-if="node.shortcut"
                class="px-1 py-0.5 rounded"
                :class="isSelected ? 'bg-blue-400/30 text-white' : 'bg-sky-100 text-sky-600'"
              >
                {{ node.shortcut }}
              </span>
            </span>
            <!-- 描述 -->
            <span
              class="w-[35%] text-[10px] truncate text-left"
              :class="isSelected ? 'text-blue-200' : 'text-slate-400'"
            >
              {{ truncatedDescription }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 拖拽放置指示线 - 下方 -->
    <div
      v-if="isDropTarget && currentDropPosition === 'after'"
      class="drop-indicator drop-indicator-after"
    />

    <!-- 子节点列表 -->
    <div v-if="shouldShowChildren" class="relative child-area">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-id="selectedId"
        :highlight-info="getChildHighlightInfo(child.id)"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
        @edit-start="emit('edit-start', $event)"
        @edit-end="emit('edit-end', $event)"
        @edit-cancel="emit('edit-cancel', $event)"
        @context-menu="emit('context-menu', $event)"
        @drag-start="emit('drag-start', $event)"
        @drag-end="emit('drag-end', $event)"
        @drop-node="emit('drop-node', $event)"
        @reorder-node="emit('reorder-node', $event)"
        @move-and-reorder="emit('move-and-reorder', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file TreeNode.vue
 * @description 树节点递归组件
 *
 * 功能说明：
 * - 递归渲染树形结构的单个节点
 * - 支持选中、展开/折叠、编辑、右键菜单
 * - 支持拖拽排序和层级调整
 * - 支持搜索高亮显示
 *
 * 组件特性：
 * - 使用递归方式渲染子节点
 * - 通过 provide/inject 共享拖拽状态
 * - 支持多种拖拽放置位置（before/after/inside）
 *
 * @example
 * <TreeNode
 *   :node="treeNode"
 *   :level="0"
 *   :selected-id="selectedId"
 *   @select="handleSelect"
 *   @toggle="handleToggle"
 * />
 */
import { ref, computed, nextTick, watch, inject, h, defineComponent, provide } from 'vue'
import { iconMap } from '@renderer/composables/iconUtils'
import { WebTreeNodeType } from '@renderer/enums'
import {
  DraggingNodeKey,
  DropPositionKey,
  HighlightMapKey,
  type DraggingNodeState,
  type DropPositionState,
  type HighlightMapState,
  type DropPosition,
  calculateDropPosition
} from '@renderer/composables/useTreeDrag'

// ==================== 常量定义 ====================

/** 描述文本最大显示长度 */
const MAX_DESCRIPTION_LENGTH = 20

/** 图标配置 */
const ICON_CONFIG = {
  folder: iconMap['folder'],
  link: iconMap['addArticle']
} as const

// ==================== 子组件定义 ====================

/**
 * 高亮文本组件
 * @description 用于在搜索结果中高亮显示匹配的关键词
 *
 * @example
 * <HighlightText
 *   text="示例文本"
 *   keyword="示例"
 *   :is-selected="false"
 * />
 */
const HighlightText = defineComponent({
  props: {
    text: {
      type: String,
      required: true
    },
    keyword: {
      type: String,
      default: ''
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    return () => {
      const { text, keyword, isSelected } = props

      if (!keyword || !text) {
        return h('span', text)
      }

      const lowerText = text.toLowerCase()
      const lowerKeyword = keyword.toLowerCase()
      const index = lowerText.indexOf(lowerKeyword)

      if (index === -1) {
        return h('span', text)
      }

      const before = text.slice(0, index)
      const match = text.slice(index, index + keyword.length)
      const after = text.slice(index + keyword.length)

      // 根据选中状态决定高亮样式
      const highlightClass = isSelected
        ? 'bg-yellow-400 text-slate-900'
        : 'bg-yellow-200 text-slate-900'

      return h('span', [before, h('span', { class: highlightClass }, match), after])
    }
  }
})

// ==================== 组件属性定义 ====================

/**
 * 组件属性接口
 * @interface Props
 */
interface Props {
  /** 节点数据对象，包含节点的所有信息 */
  node: WebTreeNodeView
  /** 当前层级深度，用于计算缩进（根节点为0） */
  level?: number
  /** 当前选中的节点ID，用于高亮显示 */
  selectedId?: number
  /** 高亮信息，用于搜索时高亮匹配文本 */
  highlightInfo?: HighlightInfo
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  selectedId: 0
})

// ==================== 事件定义 ====================

/**
 * 组件事件接口
 * @interface Emits
 */
interface Emits {
  /** 选中节点事件 */
  (e: 'select', node: WebTreeNodeView): void
  /** 展开/折叠节点事件 */
  (e: 'toggle', node: WebTreeNodeView): void
  /** 开始编辑节点事件 */
  (e: 'edit-start', node: WebTreeNodeView): void
  /** 结束编辑节点事件 */
  (e: 'edit-end', payload: { node: WebTreeNodeView; newTitle: string }): void
  /** 取消编辑节点事件 */
  (e: 'edit-cancel', node: WebTreeNodeView): void
  /** 右键菜单事件 */
  (e: 'context-menu', payload: { node: WebTreeNodeView; event: MouseEvent }): void
  /** 开始拖拽节点事件 */
  (e: 'drag-start', node: WebTreeNodeView): void
  /** 结束拖拽节点事件 */
  (e: 'drag-end', node: WebTreeNodeView): void
  /** 放置节点事件（拖拽到另一个节点上） */
  (e: 'drop-node', payload: { draggedNode: WebTreeNodeView; targetNode: WebTreeNodeView }): void
  /** 节点排序事件（同级拖拽排序） */
  (
    e: 'reorder-node',
    payload: {
      draggedNode: WebTreeNodeView
      targetNode: WebTreeNodeView
      position: 'before' | 'after'
    }
  ): void
  /** 移动并排序事件（跨级拖拽） */
  (
    e: 'move-and-reorder',
    payload: {
      draggedNode: WebTreeNodeView
      targetNode: WebTreeNodeView
      position: 'before' | 'after' | 'inside'
    }
  ): void
}

const emit = defineEmits<Emits>()

// ==================== 响应式状态 ====================

/** 编辑输入框的DOM引用，用于自动聚焦 */
const editInputRef = ref<HTMLInputElement>()

/** 节点元素的DOM引用，用于计算拖拽位置 */
const nodeRef = ref<HTMLDivElement>()

/** 编辑模式下输入框的内容 */
const editTitle = ref('')

/** 标记当前节点是否正在被拖拽 */
const isDragging = ref(false)

/** 标记当前节点是否为拖拽放置的目标 */
const isDropTarget = ref(false)

/** 当前拖拽放置的位置：'before' | 'after' | 'inside' | null */
const currentDropPosition = ref<DropPosition>(null)

/** 标记鼠标是否悬停在当前节点上 */
const isHovered = ref(false)

/** 标记是否为新添加的节点（用于显示动画）- 已禁用动画 */
const isNewNode = ref(false)

// 新节点动画已禁用，直接显示，不做特殊处理
// 如需恢复动画，取消下面代码的注释：
// onMounted(() => {
//   const createTime = props.node.createTime ? new Date(props.node.createTime).getTime() : 0
//   const now = Date.now()
//   if (createTime > 0 && now - createTime < 3000) {
//     isNewNode.value = true
//     setTimeout(() => {
//       isNewNode.value = false
//     }, 3000)
//   }
// })

// ==================== 注入状态 ====================

/** 注入的拖拽节点状态 */
const draggingState = inject<DraggingNodeState>(DraggingNodeKey)

/** 注入的拖拽位置状态 */
const dropPositionState = inject<DropPositionState>(DropPositionKey)

/** 注入的高亮映射状态 */
const highlightMapState = inject<HighlightMapState>(HighlightMapKey)

// ==================== 提供状态给子节点 ====================

/**
 * 提供高亮映射给子节点
 * 如果当前组件已经注入了高亮映射，则直接传递给子节点
 */
provide(HighlightMapKey, {
  getHighlightInfo: (nodeId: number): HighlightInfo | undefined => {
    // 优先使用注入的状态
    if (highlightMapState) {
      return highlightMapState.getHighlightInfo(nodeId)
    }
    // 如果没有注入，返回当前节点的高亮信息（如果匹配）
    if (props.highlightInfo) {
      return props.highlightInfo
    }
    return undefined
  }
})

// ==================== 计算属性 ====================

/** 判断当前节点是否被选中 */
const isSelected = computed(() => props.selectedId === props.node.id)

/** 判断是否为文件夹节点 */
const isFolder = computed(() => props.node.nodeType === WebTreeNodeType.FOLDER)

/** 判断是否为网页节点 */
const isWebNode = computed(() => props.node.nodeType === WebTreeNodeType.WEBSITE)

/** 判断节点是否有子节点 */
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

/** 判断是否应该显示子节点 */
const shouldShowChildren = computed(() => {
  return hasChildren.value && props.node.isExpanded
})

/** 图标加载失败标记 */
const iconLoadError = ref(false)

/** 图标悬停状态（用于默认图标悬停切换） */
const isIconHovered = ref(false)

/** 节点图标源地址 */
const nodeIconSrc = computed(() => {
  if (isFolder.value) {
    return isSelected.value ? ICON_CONFIG.folder.url : ICON_CONFIG.folder.dUrl
  }

  // Web节点图标逻辑
  // 1. 如果有自定义图标且加载成功，显示自定义图标（选中时也不变）
  if (props.node.icon && !iconLoadError.value) {
    return props.node.icon
  }

  // 2. 如果节点被选中，显示高亮图标
  if (isSelected.value) {
    return iconMap.web.url
  }

  // 3. 显示默认Web图标（dUrl或url取决于悬停状态）
  return isIconHovered.value ? iconMap.web.url : iconMap.web.dUrl
})

/** 节点图标替代文本 */
const nodeIconAlt = computed(() => {
  return isFolder.value ? '文件夹' : '网页'
})

/** 截断后的描述文本 */
const truncatedDescription = computed(() => {
  const desc = props.node.description || ''
  if (desc.length <= MAX_DESCRIPTION_LENGTH) {
    return desc
  }
  return desc.slice(0, MAX_DESCRIPTION_LENGTH) + '...'
})

/** 节点提示文本 */
const nodeTooltip = computed(() => {
  const parts: string[] = [props.node.title]
  if (props.node.url) {
    parts.push(`\nURL: ${props.node.url}`)
  }
  if (props.node.shortcut) {
    parts.push(`\n快捷键: ${props.node.shortcut}`)
  }
  if (props.node.description) {
    parts.push(`\n描述: ${props.node.description}`)
  }
  return parts.join('')
})

// ==================== 监听器 ====================

/**
 * 监听节点的编辑状态变化
 * 当节点进入编辑模式时，自动聚焦输入框并选中所有文本
 */
watch(
  () => props.node.isEditing,
  async (isEditing) => {
    if (isEditing) {
      // 将当前节点标题设置到编辑框
      editTitle.value = props.node.title
      // 等待DOM更新完成
      await nextTick()
      // 聚焦输入框并选中所有文本
      editInputRef.value?.focus()
      editInputRef.value?.select()
    }
  },
  { immediate: true }
)

/**
 * 监听节点图标变化
 * 当图标地址变化时，重置加载错误状态
 */
watch(
  () => props.node.icon,
  () => {
    iconLoadError.value = false
  }
)

// ==================== 事件处理函数 ====================

/**
 * 处理点击事件
 * 点击节点时触发选中事件
 * 如果是文件夹类型且有子节点，同时切换展开/折叠状态
 */
const handleClick = () => {
  emit('select', props.node)
  // 文件夹类型且有子节点时，自动展开/折叠
  if (isFolder.value && hasChildren.value) {
    emit('toggle', props.node)
  }
}

/**
 * 处理鼠标进入事件
 * 设置悬停状态，用于显示悬停样式
 */
const handleMouseEnter = () => {
  isHovered.value = true
}

/**
 * 处理鼠标离开事件
 * 取消悬停状态
 */
const handleMouseLeave = () => {
  isHovered.value = false
}

/**
 * 处理图标加载错误
 * 当自定义图标加载失败时，回退到默认图标
 */
const handleIconError = () => {
  iconLoadError.value = true
}

/**
 * 处理图标鼠标进入（悬停效果）
 * 当显示默认图标时，悬停切换到高亮图标
 */
const handleIconMouseEnter = () => {
  // 只有当显示默认图标时才启用悬停切换
  if (!props.node.icon || iconLoadError.value) {
    isIconHovered.value = true
  }
}

/**
 * 处理图标鼠标离开
 * 恢复默认图标显示
 */
const handleIconMouseLeave = () => {
  isIconHovered.value = false
}

/**
 * 处理双击事件
 * 阻止事件冒泡，防止触发父节点的双击事件
 */
const handleDblClick = (event: MouseEvent) => {
  // 阻止事件冒泡，防止父节点响应双击事件
  event.stopPropagation()
}

/**
 * 切换节点的展开/折叠状态
 * 点击展开/折叠图标时触发
 */
const toggleExpand = () => {
  emit('toggle', props.node)
}

/**
 * 处理右键菜单事件
 * 阻止默认的浏览器右键菜单，触发自定义的右键菜单
 */
const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  emit('context-menu', { node: props.node, event })
}

/**
 * 处理编辑状态下的键盘事件
 * Enter键：确认编辑
 * Escape键：取消编辑
 */
const handleEditKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // 按下回车键，确认编辑
    event.preventDefault()
    confirmEdit()
  } else if (event.key === 'Escape') {
    // 按下ESC键，取消编辑
    event.preventDefault()
    cancelEdit()
  }
}

/**
 * 处理编辑框失去焦点事件
 * 失去焦点时自动确认编辑
 */
const handleEditBlur = () => {
  confirmEdit()
}

/**
 * 确认编辑
 * 如果标题有变化且不为空，则触发编辑完成事件
 * 否则取消编辑
 */
const confirmEdit = () => {
  const trimmedTitle = editTitle.value.trim()
  if (trimmedTitle && trimmedTitle !== props.node.title) {
    // 标题有变化，触发编辑完成事件
    emit('edit-end', { node: props.node, newTitle: trimmedTitle })
  } else {
    // 标题无变化或为空，取消编辑
    emit('edit-cancel', props.node)
  }
}

/**
 * 取消编辑
 * 触发编辑取消事件，恢复原始标题
 */
const cancelEdit = () => {
  emit('edit-cancel', props.node)
}

// ==================== 拖拽处理函数 ====================

/**
 * 处理拖拽开始事件
 * 设置拖拽数据、拖拽图像，并通知父组件
 */
const handleDragStart = (event: DragEvent) => {
  // 阻止事件冒泡，防止父节点也被触发拖拽
  event.stopPropagation()

  // 标记当前节点正在拖拽
  isDragging.value = true

  // 设置拖拽数据到dataTransfer（用于跨窗口拖拽）
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(props.node))

    // 设置拖拽时的自定义图像
    const dragImage = document.createElement('div')
    dragImage.textContent = props.node.title
    dragImage.style.cssText = `
      padding: 4px 8px;
      background: #4096ff;
      color: white;
      border-radius: 4px;
      font-size: 12px;
    `
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 0, 0)
    // 立即移除临时创建的拖拽图像元素
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  // 设置共享的拖拽节点状态，供其他组件使用
  if (draggingState) {
    draggingState.setDraggingNode(props.node)
  }

  // 触发事件通知父组件拖拽开始
  emit('drag-start', props.node)
}

/**
 * 处理拖拽结束事件
 * 重置拖拽状态
 */
const handleDragEnd = () => {
  isDragging.value = false
  isDropTarget.value = false
  emit('drag-end', props.node)
}

/**
 * 处理拖拽经过事件
 * 当拖拽的节点经过当前节点上方时触发
 * 计算放置位置并设置视觉反馈
 */
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }

  // 获取被拖拽的节点
  const draggedNode = getDraggedNode(event)
  if (!draggedNode || draggedNode.id === props.node.id) {
    return
  }

  // 计算放置位置
  if (nodeRef.value) {
    const position = calculateDropPosition(event, nodeRef.value)
    currentDropPosition.value = position
    dropPositionState?.setDropPosition(position)
  }

  isDropTarget.value = true
}

/**
 * 处理拖拽离开事件
 * 当拖拽的节点离开当前节点时触发
 * 取消放置目标状态
 */
const handleDragLeave = (event: DragEvent) => {
  event.stopPropagation()
  isDropTarget.value = false
  currentDropPosition.value = null
  dropPositionState?.setDropPosition(null)
}

/**
 * 检查目标节点是否是被拖拽节点的后代
 * 用于防止将父节点拖放到自己的子节点中（造成循环引用）
 *
 * @param targetNode 目标节点（放置位置）
 * @param draggedNodeId 被拖拽节点的ID
 * @returns 如果目标节点是被拖拽节点的后代，返回true
 */
const isDescendant = (targetNode: WebTreeNodeView, draggedNodeId: number): boolean => {
  // 如果目标节点没有子节点，则不可能是后代
  if (!targetNode.children || targetNode.children.length === 0) {
    return false
  }

  // 递归检查每个子节点
  for (const child of targetNode.children) {
    // 如果子节点的ID与被拖拽节点ID相同，说明是后代
    if (child.id === draggedNodeId) {
      return true
    }
    // 递归检查子节点的子节点
    if (isDescendant(child, draggedNodeId)) {
      return true
    }
  }

  return false
}

/**
 * 获取拖拽的节点数据
 * 优先从注入的状态中获取，如果不存在则从dataTransfer中获取
 *
 * @param event 拖拽事件对象
 * @returns 被拖拽的节点对象，如果无法获取则返回null
 */
const getDraggedNode = (event: DragEvent): WebTreeNodeView | null => {
  // 优先使用注入的拖拽节点状态
  // 因为dataTransfer在dragover/dragleave中无法读取
  if (draggingState?.draggingNode.value) {
    return draggingState.draggingNode.value
  }

  // 回退到dataTransfer获取数据（用于跨窗口拖拽场景）
  if (event.dataTransfer) {
    const data = event.dataTransfer.getData('application/json')
    if (data) {
      try {
        return JSON.parse(data) as WebTreeNodeView
      } catch (error) {
        console.error('解析拖拽数据失败:', error)
      }
    }
  }

  return null
}

/**
 * 检查是否可以放置拖拽的节点到当前节点
 * 检查规则：
 * 1. 不能放置到自己（draggedNode.id !== targetNode.id）
 * 2. 不能放置到自己的后代节点中（防止循环引用）
 *
 * @param draggedNode 被拖拽的节点
 * @param targetNode 目标节点（放置位置）
 * @returns 如果可以放置返回true，否则返回false
 */
const canDrop = (draggedNode: WebTreeNodeView, targetNode: WebTreeNodeView): boolean => {
  // 规则1：不能拖放到自己
  if (draggedNode.id === targetNode.id) {
    return false
  }

  // 规则2：不能拖放到自己的子节点中
  if (isDescendant(targetNode, draggedNode.id)) {
    console.warn('不能将节点移动到自己的子节点中')
    return false
  }

  return true
}

/**
 * 检查两个节点是否为同级节点
 *
 * @param node1 节点1
 * @param node2 节点2
 * @returns 是否为同级节点
 */
const checkIsSibling = (node1: WebTreeNodeView, node2: WebTreeNodeView): boolean => {
  return node1.parentId === node2.parentId
}

/**
 * 处理放置事件
 * 当拖拽的节点放置到当前节点上时触发
 * 根据放置位置执行排序或移动操作
 */
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDropTarget.value = false
  const finalPosition = currentDropPosition.value
  currentDropPosition.value = null
  dropPositionState?.setDropPosition(null)

  // 获取被拖拽的节点
  const draggedNode = getDraggedNode(event)

  if (!draggedNode) {
    return
  }

  // 检查是否可以放置
  if (!canDrop(draggedNode, props.node)) {
    draggingState?.setDraggingNode(null)
    return
  }

  // 根据放置位置决定操作类型
  if (finalPosition === 'before' || finalPosition === 'after') {
    // 同级排序：只有当是同级节点时才触发排序
    if (checkIsSibling(draggedNode, props.node)) {
      emit('reorder-node', {
        draggedNode,
        targetNode: props.node,
        position: finalPosition
      })
    } else {
      // 跨级拖拽：改变父节点并排序
      emit('move-and-reorder', {
        draggedNode,
        targetNode: props.node,
        position: finalPosition
      })
    }
  } else if (finalPosition === 'inside') {
    // 放入目标节点内部（作为子节点）
    if (isFolder.value) {
      // 文件夹类型：放入内部作为子节点
      emit('drop-node', { draggedNode, targetNode: props.node })
    } else {
      // 非文件夹类型：将拖拽节点的父节点设为与目标节点相同，并排序在目标节点之后
      emit('move-and-reorder', {
        draggedNode,
        targetNode: props.node,
        position: 'inside'
      })
    }
  }

  // 清除拖拽状态
  draggingState?.setDraggingNode(null)
}

/**
 * 获取子节点的高亮信息
 *
 * @param childId 子节点ID
 * @returns 高亮信息
 */
const getChildHighlightInfo = (childId: number): HighlightInfo | undefined => {
  if (highlightMapState) {
    return highlightMapState.getHighlightInfo(childId)
  }
  return undefined
}
</script>

<style scoped>
/* 树节点基础样式 */
.tree-node {
  position: relative;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

/* 拖拽时的样式：半透明 */
.is-dragging {
  opacity: 0.4;
  transform: scale(0.98);
}

/* 拖拽时的阴影效果 */
.is-dragging .tree-node-content {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 放置目标时的样式：高亮背景 */
.is-drop-target .tree-node-content {
  background-color: rgba(64, 150, 255, 0.15);
  border: 1px dashed #4096ff;
}

/* 放置到内部时的高亮 */
.drop-target-inside {
  background-color: rgba(64, 150, 255, 0.2) !important;
  border: 2px solid #4096ff !important;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 脉冲动画 */
@keyframes pulse {
  0%,
  100% {
    background-color: rgba(64, 150, 255, 0.2);
  }
  50% {
    background-color: rgba(64, 150, 255, 0.35);
  }
}

/* 拖拽放置指示线基础样式 */
.drop-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4096ff 0%, #4096ff 50%, transparent 100%);
  pointer-events: none;
  z-index: 100;
  animation: slideIn 0.2s ease;
}

/* 上方指示线 */
.drop-indicator-before {
  top: -1px;
}

/* 下方指示线 */
.drop-indicator-after {
  bottom: -1px;
}

/* 指示线滑入动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

/* 指示线发光效果 */
.drop-indicator::before {
  content: '';
  position: absolute;
  left: 0;
  top: -2px;
  width: 8px;
  height: 6px;
  background: #4096ff;
  border-radius: 50%;
  box-shadow: 0 0 6px #4096ff;
}

/* 子节点区域不接受拖拽事件，但子节点本身接受 */
.child-area {
  pointer-events: none;
}

.child-area > .tree-node {
  pointer-events: auto;
}

/* 节点内容过渡效果 */
.tree-node-content {
  transition: background-color 0.2s ease;
}

/* 选中状态的过渡 */
.is-selected .tree-node-content {
  transition: background-color 0.15s ease;
}

/* 新节点高亮动画 */
.is-new-node .tree-node-content {
  animation: highlightNewNode 3s ease-out;
}

@keyframes highlightNewNode {
  0% {
    background-color: rgba(64, 150, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.6);
  }
  50% {
    background-color: rgba(64, 150, 255, 0.2);
    box-shadow: 0 0 0 1px rgba(64, 150, 255, 0.3);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
  }
}

/* 子节点列表过渡动画 */
.child-area {
  transition: all 0.3s ease;
}
</style>
