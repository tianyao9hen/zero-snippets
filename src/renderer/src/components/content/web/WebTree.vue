<template>
  <!-- 网页树组件 - 用于管理网页地址的层级结构 -->
  <main class="flex flex-col h-full bg-white rounded-lg overflow-hidden">
    <!-- 工具栏 -->
    <header class="flex items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50">
      <!-- 搜索框 -->
      <div class="relative flex-1" @click="handleSearchBoxClick">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索名称、地址、快捷键或描述..."
          class="w-full h-8 px-3 pr-16 text-xs border border-slate-200 rounded outline-none transition-colors duration-200 focus:border-[#4096ff] placeholder:text-slate-400"
          @input="handleSearch"
        />
        <!-- 搜索结果计数 -->
        <span
          v-if="showSearchCount"
          class="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded"
        >
          {{ searchResultCount }}
        </span>
        <!-- 清除搜索按钮 -->
        <button
          v-if="searchKeyword"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center bg-slate-200 text-slate-500 rounded-full text-xs cursor-pointer transition-all duration-200 hover:bg-slate-300 hover:text-slate-600"
          @click="clearSearch"
        >
          ×
        </button>
      </div>

      <!-- 新增按钮 -->
      <div class="relative">
        <button
          class="flex items-center justify-center w-8 h-8 text-slate-500 bg-white border border-slate-200 rounded cursor-pointer transition-all duration-200 hover:border-[#4096ff] hover:text-[#4096ff]"
          title="添加节点"
          @click.stop="toggleAddMenu"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
        <!-- 新增菜单 -->
        <div
          v-if="showAddMenu"
          class="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded shadow-lg z-10 min-w-[100px]"
        >
          <button
            class="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            @click.stop="openAddDialog(WebTreeNodeType.FOLDER, $event)"
          >
            <img :src="folderIcon.dUrl" alt="文件夹" class="w-3.5 h-3.5" />
            <span>文件夹</span>
          </button>
          <button
            class="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            @click.stop="openAddDialog(WebTreeNodeType.WEBSITE, $event)"
          >
            <img :src="linkIcon.url" alt="网页" class="w-3.5 h-3.5" />
            <span>网页</span>
          </button>
        </div>
      </div>

      <!-- 展开/收起按钮 -->
      <button
        class="flex items-center justify-center w-8 h-8 text-slate-500 bg-white border border-slate-200 rounded cursor-pointer transition-all duration-200 hover:border-[#4096ff] hover:text-[#4096ff]"
        :title="isAllExpanded ? '折叠全部' : '展开全部'"
        @click="handleToggleExpandAll"
      >
        <img
          :src="openIcon.dUrl"
          alt="展开/收起"
          width="14"
          height="14"
          :class="{ 'rotate-[-90deg]': !isAllExpanded }"
          class="transition-transform duration-200"
        />
      </button>
    </header>

    <!-- 树形内容区域 -->
    <div
      ref="treeContentRef"
      class="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
      :class="{ 'bg-[rgba(64,150,255,0.1)] shadow-[inset_0_0_0_2px_#4096ff]': isRootDropTarget }"
      @click="handleTreeContentClick"
      @dragover="handleRootDragOver"
      @dragleave="handleRootDragLeave"
      @drop="handleRootDrop"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-24 text-slate-400 text-xs">
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="treeData.length === 0"
        class="flex items-center justify-center h-24 text-slate-400 text-xs"
      >
        <span>{{ emptyStateText }}</span>
      </div>

      <!-- 树节点列表 -->
      <div v-else class="px-2">
        <TreeNode
          v-for="node in treeData"
          :key="node.id"
          :node="node"
          :selected-id="selectedNodeId"
          :highlight-info="highlightMap.get(node.id)"
          @select="handleNodeSelect"
          @toggle="handleNodeToggle"
          @edit-start="handleEditStart"
          @edit-end="handleEditEnd"
          @edit-cancel="handleEditCancel"
          @context-menu="handleContextMenu"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
          @drop-node="handleDropNode"
          @reorder-node="handleReorderNode"
          @move-and-reorder="handleMoveAndReorder"
        />
      </div>
    </div>

    <!-- 节点详情面板（选中网页时显示） -->
    <div v-if="showNodeDetails" class="px-3 py-3 border-t border-slate-200 bg-slate-50">
      <div class="flex items-start mb-2 text-xs leading-relaxed last:mb-0">
        <label class="flex-shrink-0 w-[60px] text-slate-500 font-medium">名称：</label>
        <span class="flex-1 text-slate-700 break-all">{{ selectedNode?.title }}</span>
      </div>
      <div class="flex items-start mb-2 text-xs leading-relaxed last:mb-0">
        <label class="flex-shrink-0 w-[60px] text-slate-500 font-medium">地址：</label>
        <a
          :href="selectedNode?.url || undefined"
          target="_blank"
          class="flex-1 text-[#4096ff] break-all hover:underline"
        >
          {{ selectedNode?.url }}
        </a>
      </div>
      <div
        v-if="selectedNode?.shortcut"
        class="flex items-start mb-2 text-xs leading-relaxed last:mb-0"
      >
        <label class="flex-shrink-0 w-[60px] text-slate-500 font-medium">快捷键：</label>
        <span
          class="inline-block px-2 py-0.5 bg-sky-100 text-sky-600 rounded text-[11px] font-medium"
        >
          {{ selectedNode?.shortcut }}
        </span>
      </div>
      <div
        v-if="selectedNode?.description"
        class="flex items-start mb-2 text-xs leading-relaxed last:mb-0"
      >
        <label class="flex-shrink-0 w-[60px] text-slate-500 font-medium">描述：</label>
        <span class="flex-1 text-slate-700 break-all">{{ selectedNode?.description }}</span>
      </div>
    </div>

    <!-- 节点对话框（添加/编辑） -->
    <TreeNodeDialog
      v-model:visible="showDialog"
      :mode="dialogMode"
      :parent-id="dialogMode === 'add' ? addParentId : selectedNodeId || 0"
      :type-id="typeId"
      :node-type="typeIdForAdd"
      :node-data="editNodeData"
      :flat-node-list="flatNodeList"
      @success="handleDialogSuccess"
    />
  </main>
</template>

<script setup lang="ts">
/**
 * @file WebTree.vue
 * @description 网页树组件 - 用于管理网页地址的层级结构
 *
 * 功能说明：
 * - 提供网页地址的树形结构管理
 * - 支持添加、编辑、删除文件夹和网页节点
 * - 支持拖拽排序和层级调整
 * - 支持搜索过滤
 * - 支持展开/折叠全部节点
 * - 支持键盘快捷键（Enter打开网页）
 *
 * 数据结构：
 * - 文件夹节点：包含子节点列表
 * - 网页节点：包含URL、快捷键、描述
 *
 * @example
 * <WebTree />
 */
import { ref, computed, onMounted, onUnmounted, provide, readonly, h } from 'vue'
import { useRoute } from 'vue-router'
import useWebTree from '@renderer/hooks/useWebTree'
import { iconMap } from '@renderer/composables/iconUtils'
import TreeNode from './TreeNode.vue'
import TreeNodeDialog, { type NodeData } from './TreeNodeDialog.vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import { WebTreeNodeType } from '@renderer/enums'
import {
  DraggingNodeKey,
  DropPositionKey,
  HighlightMapKey,
  type DropPosition,
  calculateNewOrderNum,
  calculateNewOrderNumForMove
} from '@renderer/composables/useTreeDrag'

// ==================== 图标引用 ====================

/** 文件夹图标 */
const folderIcon = iconMap['folder']

/** 链接图标 */
const linkIcon = iconMap['addArticle']

/** 删除图标 */
const deleteIcon = iconMap['delete']

/** 展开/收起图标 */
const openIcon = iconMap['open']

// ==================== 响应式状态 ====================

/** 路由实例，用于获取URL参数 */
const route = useRoute()

/** 类型ID */
const typeId = computed(() => Number(route.params.tid) || 2)

/** WebTree hooks，包含树操作的相关方法 */
const {
  buildTree,
  getWebTreeByTypeId,
  updateWebTreeNode,
  removeWebTreeNode,
  moveWebTreeNode,
  expandAll,
  collapseAll,
  reorderWebTreeNodes,
  insertNodeToTree,
  findParentNodeInTree,
  updateNodeOrderInTree,
  moveNodeInTree,
  calculateParentId
} = useWebTree()

/** 树内容区域的DOM引用 */
const treeContentRef = ref<HTMLDivElement>()

/** 加载状态，true表示正在加载数据 */
const loading = ref(false)

/** 树数据（扁平列表），存储从API获取的原始数据 */
const flatNodeList = ref<WebTreeNode[]>([])

/** 树数据（树形结构），由flatNodeList构建的嵌套结构 */
const treeData = ref<WebTreeNodeView[]>([])

/** 当前选中的节点ID */
const selectedNodeId = ref(0)

/** 搜索关键词 */
const searchKeyword = ref('')

/** 高亮信息映射表，key为节点ID，value为高亮信息 */
const highlightMap = ref<Map<number, HighlightInfo>>(new Map())

/** 是否显示对话框 */
const showDialog = ref(false)

/** 对话框模式：'add' 或 'edit' */
const dialogMode = ref<'add' | 'edit'>('add')

/** 编辑对话框节点数据 */
const editNodeData = ref<NodeData | undefined>(undefined)

/** 根级别是否为拖拽目标，用于显示拖拽放置的视觉反馈 */
const isRootDropTarget = ref(false)

/** 当前正在拖拽的节点 */
const draggingNode = ref<WebTreeNodeView | null>(null)

/** 当前拖拽放置的位置 */
const dropPosition = ref<DropPosition>(null)

/** 是否显示新增菜单 */
const showAddMenu = ref(false)

/** 添加节点时的节点类型 */
const typeIdForAdd = ref<WebTreeNodeType>(WebTreeNodeType.FOLDER)

/** 添加节点时的父节点ID（不覆盖 selectedNodeId） */
const addParentId = ref<number>(0)

/** 搜索防抖定时器，用于减少搜索请求频率 */
let searchDebounceTimer: NodeJS.Timeout | null = null

// ==================== 计算属性 ====================

/** 搜索结果数量 */
const searchResultCount = computed(() => highlightMap.value.size)

/** 是否显示搜索结果计数 */
const showSearchCount = computed(() => searchKeyword.value && searchResultCount.value > 0)

/** 空状态文本 */
const emptyStateText = computed(() => {
  return searchKeyword.value ? '未找到匹配的网页' : '暂无数据，点击上方按钮添加'
})

/** 当前选中的节点对象 */
const selectedNode = computed(() => {
  return flatNodeList.value.find((node) => node.id === selectedNodeId.value)
})

/** 是否显示节点详情面板 */
const showNodeDetails = computed(() => {
  return selectedNode.value && selectedNode.value.nodeType === WebTreeNodeType.WEBSITE
})

/**
 * 是否全部展开（计算属性）
 * 只要有任意节点展开，就视为已展开状态
 */
const isAllExpanded = computed(() => {
  return checkHasExpandedNode(treeData.value)
})

// ==================== 提供状态给子组件 ====================

/**
 * 提供拖拽节点状态给子组件
 * 使用provide/inject机制实现跨组件状态共享
 * 解决原生拖拽API中dataTransfer在dragover中无法读取的问题
 */
provide(DraggingNodeKey, {
  draggingNode: readonly(draggingNode),
  setDraggingNode: (node: WebTreeNodeView | null) => {
    draggingNode.value = node
  }
})

/**
 * 提供拖拽位置状态给子组件
 */
provide(DropPositionKey, {
  dropPosition: readonly(dropPosition),
  setDropPosition: (position: DropPosition) => {
    dropPosition.value = position
  }
})

/**
 * 提供高亮映射给子组件
 * 用于搜索时高亮显示匹配文本
 */
provide(HighlightMapKey, {
  getHighlightInfo: (nodeId: number): HighlightInfo | undefined => {
    return highlightMap.value.get(nodeId)
  }
})

// ==================== 生命周期钩子 ====================

/**
 * 组件挂载时加载数据并添加键盘事件监听
 */
onMounted(async () => {
  await loadTreeData()
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

/**
 * 组件卸载时移除键盘事件监听
 */
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// ==================== 数据加载函数 ====================

/**
 * 加载树数据
 * 从API获取数据并构建树形结构
 */
const loadTreeData = async () => {
  loading.value = true
  try {
    // 获取扁平列表数据
    flatNodeList.value = await getWebTreeByTypeId(typeId.value)
    // 构建树形结构
    treeData.value = buildTree(flatNodeList.value)
    // 默认展开所有节点
    expandAll(treeData.value)
  } catch (error) {
    console.error('加载树数据失败:', error)
    alert('加载数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// ==================== 事件处理函数 ====================

/**
 * 处理节点选中
 * @param node 选中的节点对象
 */
const handleNodeSelect = (node: WebTreeNodeView) => {
  selectedNodeId.value = node.id
}

/**
 * 处理树形内容区域点击
 * 点击空白区域时取消选中节点
 */
const handleTreeContentClick = (event: MouseEvent) => {
  // 如果点击的是树形内容区域本身（而不是子节点），则取消选中
  if (event.target === treeContentRef.value) {
    selectedNodeId.value = 0
  }
}

/**
 * 处理搜索框点击
 * 点击搜索框区域时取消选中节点
 */
const handleSearchBoxClick = () => {
  selectedNodeId.value = 0
}

/**
 * 处理节点展开/折叠
 * @param node 操作的节点对象
 */
const handleNodeToggle = (node: WebTreeNodeView) => {
  node.isExpanded = !node.isExpanded
}

/**
 * 处理开始编辑节点
 * @param node 要编辑的节点对象
 */
const handleEditStart = (node: WebTreeNodeView) => {
  node.isEditing = true
}

/**
 * 处理编辑完成
 * @param payload 包含节点对象和新标题的对象
 */
const handleEditEnd = async (payload: { node: WebTreeNodeView; newTitle: string }) => {
  const { node, newTitle } = payload
  node.isEditing = false

  try {
    // 调用API更新节点标题
    await updateWebTreeNode(node.id, { title: newTitle })

    // 局部更新：只更新当前节点的标题
    // 同时更新树中的节点和扁平列表中的节点
    node.title = newTitle
    const flatNode = flatNodeList.value.find((n) => n.id === node.id)
    if (flatNode) {
      flatNode.title = newTitle
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : '更新失败')
  }
}

/**
 * 处理取消编辑
 * @param node 取消编辑的节点对象
 */
const handleEditCancel = (node: WebTreeNodeView) => {
  node.isEditing = false
}

/**
 * 处理右键菜单
 * 显示自定义的右键菜单，包含添加子节点、编辑、删除等操作
 *
 * 注意：添加子节点使用与工具栏按钮相同的统一逻辑
 * - 右键点击的节点会被设为选中状态
 * - 然后根据节点类型自动计算新节点的父节点
 */
const handleContextMenu = (payload: { node: WebTreeNodeView; event: MouseEvent }) => {
  const { node, event } = payload
  // 选中当前节点（这是与工具栏按钮的主要区别：右键会自动选中点击的节点）
  selectedNodeId.value = node.id

  // 显示右键菜单
  ContextMenu.showContextMenu({
    x: event.x,
    y: event.y,
    theme: 'flat',
    items: [
      {
        label: h('div', { style: { fontSize: '12px', color: '#64748b' } }, '添加子文件夹'),
        icon: h('img', { src: folderIcon.url, style: { width: '12px', height: '12px' } }),
        onClick: () => openAddDialog(WebTreeNodeType.FOLDER)
      },
      {
        label: h('div', { style: { fontSize: '12px', color: '#64748b' } }, '添加子网页'),
        icon: h('img', { src: linkIcon.url, style: { width: '12px', height: '12px' } }),
        onClick: () => openAddDialog(WebTreeNodeType.WEBSITE)
      },
      {
        label: h('div', { style: { fontSize: '12px', color: '#64748b' } }, '编辑'),
        divided: true,
        onClick: () => openEditDialog(node)
      },
      {
        label: h('div', { style: { fontSize: '12px', color: '#ef4444' } }, '删除'),
        icon: h('img', { src: deleteIcon.url, style: { width: '12px', height: '12px' } }),
        onClick: () => handleDeleteNode(node)
      }
    ]
  })
}

/**
 * 处理拖拽开始
 * @param node 被拖拽的节点对象
 */
const handleDragStart = (node: WebTreeNodeView) => {
  draggingNode.value = node
}

/**
 * 处理拖拽结束
 * @param node 被拖拽的节点对象
 */
const handleDragEnd = () => {
  // 拖拽状态在放置时清除
}

/**
 * 处理节点放置（拖拽到另一个节点上）
 * @param payload 包含被拖拽节点和目标节点的对象
 */
const handleDropNode = async (payload: {
  draggedNode: WebTreeNodeView
  targetNode: WebTreeNodeView
}) => {
  const { draggedNode, targetNode } = payload

  // 只能放置到文件夹中
  if (targetNode.nodeType !== WebTreeNodeType.FOLDER) {
    alert('只能将节点移动到文件夹中')
    return
  }

  // 防止将节点移动到自己下面
  if (draggedNode.id === targetNode.id) {
    return
  }

  try {
    // 计算目标文件夹下最大的排序号，新节点放到最后
    const targetSiblings = flatNodeList.value.filter(
      (node) => node.parentId === targetNode.id && node.id !== draggedNode.id
    )
    const maxOrderNum = targetSiblings.reduce((max, node) => Math.max(max, node.orderNum), -1)
    const newOrderNum = maxOrderNum + 1

    // 调用API移动节点
    await moveWebTreeNode(draggedNode.id, targetNode.id)

    // 更新排序号
    await reorderWebTreeNodes([{ id: draggedNode.id, orderNum: newOrderNum }])

    // 局部更新：在树中移动节点到新位置
    const success = moveNodeInTree(
      treeData.value,
      flatNodeList.value,
      draggedNode.id,
      targetNode.id,
      newOrderNum
    )
    if (!success) {
      console.warn('局部移动更新失败，执行全量刷新')
      await loadTreeData()
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : '移动失败')
  }
}

/**
 * 处理节点重排序（同级拖拽排序）
 * @param payload 包含被拖拽节点、目标节点和放置位置的对象
 */
const handleReorderNode = async (payload: {
  draggedNode: WebTreeNodeView
  targetNode: WebTreeNodeView
  position: 'before' | 'after'
}) => {
  const { draggedNode, targetNode, position } = payload

  // 获取同级节点
  const siblings = flatNodeList.value.filter(
    (node) => node.parentId === draggedNode.parentId && node.id !== draggedNode.id
  )

  // 计算新的排序号
  const newOrderNum = calculateNewOrderNum(siblings, targetNode, position)

  try {
    // 更新被拖拽节点的排序号
    await reorderWebTreeNodes([{ id: draggedNode.id, orderNum: newOrderNum }])

    // 局部更新：在树中重新定位节点位置，同时同步 flatNodeList
    const success = updateNodeOrderInTree(
      treeData.value,
      flatNodeList.value,
      draggedNode.id,
      newOrderNum
    )
    if (!success) {
      console.warn('局部排序更新失败，执行全量刷新')
      await loadTreeData()
    }
  } catch (error) {
    console.error('节点排序失败:', error)
    alert(error instanceof Error ? error.message : '排序失败')
  }
}

/**
 * 处理节点移动并排序（跨级拖拽）
 * 将节点移动到新的父节点下，并设置合适的排序位置
 */
const handleMoveAndReorder = async (payload: {
  draggedNode: WebTreeNodeView
  targetNode: WebTreeNodeView
  position: 'before' | 'after' | 'inside'
}) => {
  const { draggedNode, targetNode, position } = payload

  // 防止将节点移动到自己下面
  if (draggedNode.id === targetNode.id) {
    return
  }

  try {
    // 确定新的父节点ID
    let newParentId: number
    if (position === 'inside') {
      // 拖到节点上：如果目标是文件夹，放入目标内部；否则与目标同级
      if (targetNode.nodeType === WebTreeNodeType.FOLDER) {
        newParentId = targetNode.id
      } else {
        newParentId = targetNode.parentId!
      }
    } else {
      // before 或 after：与目标节点同级
      newParentId = targetNode.parentId!
    }

    // 获取目标位置的同级节点（不包括被拖拽的节点）
    const targetSiblings = flatNodeList.value.filter(
      (node) => node.parentId === newParentId && node.id !== draggedNode.id
    )

    // 计算新的排序号
    const newOrderNum = calculateNewOrderNumForMove(targetSiblings, targetNode, position)

    // 先移动节点到新的父节点
    await moveWebTreeNode(draggedNode.id, newParentId)

    // 再更新排序号
    await reorderWebTreeNodes([{ id: draggedNode.id, orderNum: newOrderNum }])

    // 局部更新：在树中移动节点到新位置
    const success = moveNodeInTree(
      treeData.value,
      flatNodeList.value,
      draggedNode.id,
      newParentId,
      newOrderNum
    )
    if (!success) {
      console.warn('局部移动更新失败，执行全量刷新')
      await loadTreeData()
    }
  } catch (error) {
    console.error('节点移动并排序失败:', error)
    alert(error instanceof Error ? error.message : '移动失败')
  }
}

/**
 * 处理根级别拖拽经过
 * 当拖拽的节点经过根级别区域上方时触发
 */
const handleRootDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  // 设置根级别为拖拽目标，显示视觉反馈
  isRootDropTarget.value = true
}

/**
 * 处理根级别拖拽离开
 * 当拖拽的节点离开根级别区域时触发
 */
const handleRootDragLeave = (event: DragEvent) => {
  event.stopPropagation()
  isRootDropTarget.value = false
}

/**
 * 处理根级别放置（移动到最外层）
 * 当拖拽的节点放置到根级别区域时触发
 */
const handleRootDrop = async (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isRootDropTarget.value = false

  // 使用共享状态获取拖拽节点，而不是依赖 dataTransfer
  if (draggingNode.value) {
    try {
      // 计算根级别最大的排序号，新节点放到最后
      const rootSiblings = flatNodeList.value.filter(
        (node) => node.parentId === 0 && node.id !== draggingNode.value!.id
      )
      const maxOrderNum = rootSiblings.reduce((max, node) => Math.max(max, node.orderNum), -1)
      const newOrderNum = maxOrderNum + 1

      // 移动到根级别（parentId = 0）
      await moveWebTreeNode(draggingNode.value.id, 0)

      // 更新排序号
      await reorderWebTreeNodes([{ id: draggingNode.value.id, orderNum: newOrderNum }])

      // 局部更新：在树中移动节点到根级别
      const success = moveNodeInTree(
        treeData.value,
        flatNodeList.value,
        draggingNode.value.id,
        0,
        newOrderNum
      )
      if (!success) {
        console.warn('局部移动更新失败，执行全量刷新')
        await loadTreeData()
      }
    } catch (error) {
      console.error('移动到根级别失败:', error)
      alert(error instanceof Error ? error.message : '移动失败')
    } finally {
      // 清除拖拽节点状态
      draggingNode.value = null
    }
  }
}

// ==================== 工具栏操作 ====================

/**
 * 切换新增菜单显示状态
 */
const toggleAddMenu = (event: MouseEvent) => {
  event.stopPropagation()
  showAddMenu.value = !showAddMenu.value
}

/**
 * 打开添加节点对话框
 * 统一的添加节点方法，支持添加文件夹、网页，以及添加子节点
 */
const openAddDialog = (nodeType: WebTreeNodeType, event?: MouseEvent) => {
  // 阻止事件冒泡，防止触发树形区域的点击事件
  event?.stopPropagation()

  // 关闭新增菜单
  showAddMenu.value = false

  // 获取当前选中的节点ID
  const currentSelectedId = selectedNodeId.value

  // 计算父节点ID（使用 useWebTree 中的 calculateParentId 方法）
  const parentId = calculateParentId(currentSelectedId, flatNodeList.value)

  // 保存计算出的父节点ID
  addParentId.value = parentId

  // 重置编辑数据，设置节点类型和模式
  editNodeData.value = undefined
  dialogMode.value = 'add'
  typeIdForAdd.value = nodeType
  showDialog.value = true
}

/**
 * 处理对话框成功（添加或编辑）
 * 编辑模式：局部更新受影响的节点
 * 添加模式：局部插入新节点而不刷新整个树
 */
const handleDialogSuccess = async (updatedData?: NodeData) => {
  // 保存添加前的父节点ID（用于展开路径）
  const savedAddParentId = addParentId.value
  const previousSelectedId = selectedNodeId.value

  // 编辑模式：局部更新节点数据
  if (dialogMode.value === 'edit') {
    if (updatedData) {
      const { id, title, url, shortcut, description, icon } = updatedData

      // 在树中查找并更新节点
      const updateNodeInTree = (nodes: WebTreeNodeView[]): boolean => {
        for (const node of nodes) {
          if (node.id === id) {
            // 更新节点字段
            if (title !== undefined) node.title = title
            if (url !== undefined) node.url = url
            if (shortcut !== undefined) node.shortcut = shortcut
            if (description !== undefined) node.description = description
            if (icon !== undefined) node.icon = icon
            return true
          }
          if (node.children) {
            if (updateNodeInTree(node.children)) return true
          }
        }
        return false
      }

      // 更新树中的节点
      updateNodeInTree(treeData.value)

      // 同步更新扁平列表中的节点
      const flatNode = flatNodeList.value.find((n) => n.id === id)
      if (flatNode) {
        if (title !== undefined) flatNode.title = title
        if (url !== undefined) flatNode.url = url
        if (shortcut !== undefined) flatNode.shortcut = shortcut
        if (description !== undefined) flatNode.description = description
        if (icon !== undefined) flatNode.icon = icon
      }
    }
    // 恢复选中状态
    if (previousSelectedId > 0) {
      selectedNodeId.value = previousSelectedId
    }
    return
  }

  // 添加模式：使用局部更新
  // 1. 获取新添加的节点数据（通过API获取最新数据）
  try {
    // 获取最新的扁平节点列表，找到刚添加的节点
    const latestNodes = await getWebTreeByTypeId(typeId.value)

    // 找出新节点（在 latestNodes 中但不在 flatNodeList 中的节点）
    const existingIds = new Set(flatNodeList.value.map((n) => n.id))
    const newNodes = latestNodes.filter((n) => !existingIds.has(n.id))

    if (newNodes.length === 0) {
      // 未找到新节点，回退到全量刷新
      console.warn('未找到新节点，执行全量刷新')
      await loadTreeData()
      return
    }

    // 2. 将新节点局部插入到树中
    for (const newNode of newNodes) {
      const success = insertNodeToTree(treeData.value, flatNodeList.value, newNode)
      if (!success) {
        console.warn('局部插入失败，执行全量刷新')
        await loadTreeData()
        return
      }
    }

    // 3. 展开父节点以便查看新节点
    const parentId = savedAddParentId
    if (parentId > 0) {
      const parentNode = findParentNodeInTree(treeData.value, parentId)
      if (parentNode) {
        parentNode.isExpanded = true
      }
    }

    // 4. 选中新添加的节点（最后一个）
    const lastNewNode = newNodes[newNodes.length - 1]
    selectedNodeId.value = lastNewNode.id

    // 5. 滚动到新节点位置（延迟执行以确保DOM已更新）
    setTimeout(() => {
      scrollToNode(lastNewNode.id)
    }, 100)
  } catch (error) {
    console.error('局部更新失败:', error)
    // 出错时回退到全量刷新
    await loadTreeData()
  }
}

/**
 * 滚动到指定节点位置
 * @param nodeId 节点ID
 */
const scrollToNode = (nodeId: number) => {
  if (!treeContentRef.value) return

  // 查找节点元素
  const nodeElement = treeContentRef.value.querySelector(`[data-node-id="${nodeId}"]`)
  if (nodeElement) {
    nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/**
 * 递归检查是否有节点处于展开状态
 * @param nodes 树节点数组
 * @returns 是否有展开的节点
 */
const checkHasExpandedNode = (nodes: WebTreeNodeView[]): boolean => {
  for (const node of nodes) {
    if (node.isExpanded) {
      return true
    }
    if (node.children && node.children.length > 0) {
      if (checkHasExpandedNode(node.children)) {
        return true
      }
    }
  }
  return false
}

/**
 * 处理展开/收起全部切换
 * 只要有任意节点展开，就折叠全部；否则展开全部
 */
const handleToggleExpandAll = () => {
  if (isAllExpanded.value) {
    // 如果有任意节点展开，则折叠全部
    collapseAll(treeData.value)
  } else {
    // 否则展开全部
    expandAll(treeData.value)
  }
}

// ==================== 搜索功能 ====================

/**
 * 移除URL中的协议部分（http:// 或 https://）
 * @param url URL字符串
 * @returns 移除协议后的URL
 */
const removeUrlProtocol = (url: string): string => {
  return url.replace(/^https?:\/\//i, '')
}

/**
 * 检查节点是否匹配搜索关键词
 * @param node 节点数据
 * @param keyword 搜索关键词（小写）
 * @returns 匹配信息，不匹配返回null
 */
const matchNode = (node: WebTreeNode, keyword: string): HighlightInfo | null => {
  const lowerKeyword = keyword.toLowerCase()

  // 搜索名称
  if (node.title && node.title.toLowerCase().includes(lowerKeyword)) {
    return {
      field: 'title',
      fieldLabel: '名称',
      keyword: keyword,
      matchedText: node.title
    }
  }

  // 搜索URL（排除协议部分）
  if (node.url) {
    const urlWithoutProtocol = removeUrlProtocol(node.url)
    if (urlWithoutProtocol.toLowerCase().includes(lowerKeyword)) {
      return {
        field: 'url',
        fieldLabel: '地址',
        keyword: keyword,
        matchedText: node.url
      }
    }
  }

  // 搜索快捷键
  if (node.shortcut && node.shortcut.toLowerCase().includes(lowerKeyword)) {
    return {
      field: 'shortcut',
      fieldLabel: '快捷键',
      keyword: keyword,
      matchedText: node.shortcut
    }
  }

  // 搜索描述
  if (node.description && node.description.toLowerCase().includes(lowerKeyword)) {
    return {
      field: 'description',
      fieldLabel: '描述',
      keyword: keyword,
      matchedText: node.description
    }
  }

  return null
}

/**
 * 递归搜索节点并构建高亮映射
 * @param nodes 所有节点列表
 * @param keyword 搜索关键词
 * @returns 匹配的节点ID集合
 */
const searchNodesRecursive = (nodes: WebTreeNode[], keyword: string): Set<number> => {
  const matchedIds = new Set<number>()
  const newHighlightMap = new Map<number, HighlightInfo>()

  for (const node of nodes) {
    const matchInfo = matchNode(node, keyword)
    if (matchInfo) {
      matchedIds.add(node.id)
      newHighlightMap.set(node.id, matchInfo)
    }
  }

  highlightMap.value = newHighlightMap
  return matchedIds
}

/**
 * 获取节点的所有父节点ID
 * @param nodes 所有节点列表
 * @param nodeId 目标节点ID
 * @returns 父节点ID数组（从根到直接父节点）
 */
const getParentIds = (nodes: WebTreeNode[], nodeId: number): number[] => {
  const parentIds: number[] = []
  const node = nodes.find((n) => n.id === nodeId)
  if (!node || node.parentId === 0) return parentIds

  let currentId = node.parentId
  while (currentId !== 0 && currentId !== null) {
    parentIds.unshift(currentId)
    const parent = nodes.find((n) => n.id === currentId)
    if (!parent) break
    currentId = parent.parentId
  }
  return parentIds
}

/**
 * 构建包含父节点的完整树数据
 * @param allNodes 所有节点
 * @param matchedIds 匹配的节点ID集合
 * @returns 过滤后的节点列表
 */
const buildSearchResultTree = (allNodes: WebTreeNode[], matchedIds: Set<number>): WebTreeNode[] => {
  const resultIds = new Set<number>(matchedIds)

  // 为每个匹配的节点添加其所有父节点
  for (const id of matchedIds) {
    const parentIds = getParentIds(allNodes, id)
    for (const parentId of parentIds) {
      resultIds.add(parentId)
    }
  }

  // 返回所有相关节点
  return allNodes.filter((node) => resultIds.has(node.id))
}

/**
 * 展开指定节点及其所有子节点
 * @param tree 树形结构
 * @param nodeIds 需要展开的节点ID集合
 */
const expandNodes = (tree: WebTreeNodeView[], nodeIds: Set<number>): void => {
  for (const node of tree) {
    if (nodeIds.has(node.id)) {
      node.isExpanded = true
    }
    if (node.children) {
      expandNodes(node.children, nodeIds)
    }
  }
}

/**
 * 处理搜索
 * 使用防抖机制减少搜索请求频率
 */
const handleSearch = () => {
  // 清除之前的定时器
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  // 设置新的定时器，300毫秒后执行搜索
  searchDebounceTimer = setTimeout(async () => {
    const keyword = searchKeyword.value.trim()

    try {
      // 始终获取完整数据
      const allNodes = await getWebTreeByTypeId(typeId.value)

      if (keyword) {
        // 执行前端搜索，获取匹配的节点ID
        const matchedIds = searchNodesRecursive(allNodes, keyword)

        if (matchedIds.size === 0) {
          // 没有匹配结果
          flatNodeList.value = []
          treeData.value = []
        } else {
          // 构建包含父节点的完整树数据
          const resultNodes = buildSearchResultTree(allNodes, matchedIds)
          flatNodeList.value = resultNodes
          treeData.value = buildTree(resultNodes)

          // 展开所有匹配的节点及其父节点
          const expandIds = new Set<number>(matchedIds)
          for (const id of matchedIds) {
            const parentIds = getParentIds(allNodes, id)
            parentIds.forEach((pid) => expandIds.add(pid))
          }
          expandNodes(treeData.value, expandIds)
        }
      } else {
        // 无搜索关键词，加载全部数据
        highlightMap.value.clear()
        flatNodeList.value = allNodes
        treeData.value = buildTree(allNodes)
      }
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }, 300)
}

/**
 * 清除搜索
 * 清空搜索关键词并重新加载全部数据
 */
const clearSearch = async () => {
  searchKeyword.value = ''
  highlightMap.value.clear()
  await loadTreeData()
}

// ==================== 键盘事件处理 ====================

/**
 * 处理键盘事件
 * Enter键：打开选中的网页节点
 * @param event 键盘事件对象
 */
const handleKeydown = (event: KeyboardEvent) => {
  // 回车键打开网页
  if (event.key === 'Enter' && selectedNodeId.value > 0) {
    const node = flatNodeList.value.find((n) => n.id === selectedNodeId.value)
    if (node && node.nodeType === WebTreeNodeType.WEBSITE && node.url) {
      event.preventDefault()
      window.open(node.url, '_blank')
    }
  }
}

// ==================== 对话框操作 ====================

/**
 * 打开编辑对话框
 * @param node 要编辑的节点对象
 */
const openEditDialog = (node: WebTreeNodeView) => {
  // 填充编辑数据
  editNodeData.value = {
    id: node.id,
    nodeType: node.nodeType,
    title: node.title,
    url: node.url || undefined,
    shortcut: node.shortcut || undefined,
    description: node.description || undefined
  }
  dialogMode.value = 'edit'
  showDialog.value = true
}

// ==================== 删除操作 ====================

/**
 * 处理删除节点
 * @param node 要删除的节点对象
 */
const handleDeleteNode = async (node: WebTreeNodeView) => {
  // 判断节点是否有子节点
  const hasChildren = node.children && node.children.length > 0

  // 根据是否有子节点显示不同的确认消息
  const confirmMessage = hasChildren
    ? `确定要删除 "${node.title}" 及其所有子节点吗？`
    : `确定要删除 "${node.title}" 吗？`

  if (!confirm(confirmMessage)) {
    return
  }

  try {
    await removeWebTreeNode(node.id)
    // 如果删除的是当前选中的节点，清除选中状态
    if (selectedNodeId.value === node.id) {
      selectedNodeId.value = 0
    }
    await loadTreeData()
  } catch (error) {
    alert(error instanceof Error ? error.message : '删除失败')
  }
}
</script>

<style scoped>
/* 自定义滚动条样式 */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
