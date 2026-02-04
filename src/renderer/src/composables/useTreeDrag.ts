/**
 * @file useTreeDrag.ts
 * @description 树节点拖拽共享状态管理模块
 *
 * 功能说明：
 * - 提供 WebTree 和 TreeNode 组件之间的拖拽状态共享机制
 * - 解决原生 HTML5 拖拽 API 中 dataTransfer 在 dragover 事件阶段无法读取的问题
 * - 提供拖拽位置计算、排序号计算等核心算法
 *
 * 使用方式：
 * - 在 WebTree.vue 中使用 provide 提供拖拽状态
 * - 在 TreeNode.vue 中使用 inject 注入拖拽状态
 *
 * @example
 * // 在父组件中提供状态
 * provide(DraggingNodeKey, { draggingNode: readonly(draggingNode), setDraggingNode })
 *
 * // 在子组件中注入状态
 * const draggingState = inject<DraggingNodeState>(DraggingNodeKey)
 */
import type { Ref } from 'vue'

/**
 * 拖拽放置位置类型
 * @description 定义节点可以被放置的相对位置
 * - 'before': 放置在目标节点之前（同级排序）
 * - 'after': 放置在目标节点之后（同级排序）
 * - 'inside': 放置到目标节点内部（作为子节点）
 * - null: 无有效放置位置
 */
export type DropPosition = 'before' | 'after' | 'inside' | null

/**
 * 拖拽节点注入键
 * @description 用于 Vue provide/inject 机制的注入键标识符
 * 使用 Symbol 确保键的唯一性，避免命名冲突
 */
export const DraggingNodeKey = Symbol('draggingNode')

/**
 * 拖拽位置注入键
 * @description 用于 Vue provide/inject 机制的注入键标识符
 * 用于在组件树中共享当前的拖拽放置位置状态
 */
export const DropPositionKey = Symbol('dropPosition')

/**
 * 高亮映射注入键
 * @description 用于 Vue provide/inject 机制的注入键标识符
 * 用于在搜索时传递高亮信息到子组件
 */
export const HighlightMapKey = Symbol('highlightMap')

/**
 * 拖拽节点状态接口
 * @interface DraggingNodeState
 * @description 定义拖拽节点状态的类型结构
 *
 * @property {Readonly<Ref<WebTreeNodeView | null>>} draggingNode - 当前正在拖拽的节点引用
 * @property {(node: WebTreeNodeView | null) => void} setDraggingNode - 设置拖拽节点的方法
 */
export interface DraggingNodeState {
  /** 当前正在拖拽的节点，为 null 时表示没有拖拽操作 */
  draggingNode: Readonly<Ref<WebTreeNodeView | null>>
  /** 设置当前拖拽节点的方法 */
  setDraggingNode: (node: WebTreeNodeView | null) => void
}

/**
 * 拖拽位置状态接口
 * @interface DropPositionState
 * @description 定义拖拽放置位置状态的类型结构
 *
 * @property {Readonly<Ref<DropPosition>>} dropPosition - 当前放置位置的引用
 * @property {(position: DropPosition) => void} setDropPosition - 设置放置位置的方法
 */
export interface DropPositionState {
  /** 当前的放置位置，null 表示无有效位置 */
  dropPosition: Readonly<Ref<DropPosition>>
  /** 设置当前放置位置的方法 */
  setDropPosition: (position: DropPosition) => void
}

/**
 * 高亮映射状态接口
 * @interface HighlightMapState
 * @description 定义搜索高亮信息映射的类型结构
 *
 * @property {(nodeId: number) => HighlightInfo | undefined} getHighlightInfo - 获取节点高亮信息的方法
 */
export interface HighlightMapState {
  /** 根据节点ID获取对应的高亮信息 */
  getHighlightInfo: (nodeId: number) => HighlightInfo | undefined
}

/**
 * 计算拖拽放置位置
 * @function calculateDropPosition
 * @description 根据鼠标在目标元素上的垂直位置计算放置位置
 *
 * 算法说明：
 * - 将目标元素高度分为三个区域：上25%、中50%、下25%
 * - 鼠标在上25%区域：放置到目标节点之前（before）
 * - 鼠标在下25%区域：放置到目标节点之后（after）
 * - 鼠标在中间50%区域：放置到目标节点内部（inside）
 *
 * @param {DragEvent} event - 拖拽事件对象，包含鼠标位置信息
 * @param {HTMLElement} targetElement - 目标元素，作为放置位置的参考
 * @returns {DropPosition} 计算得到的放置位置
 *
 * @example
 * const position = calculateDropPosition(dragEvent, nodeElement)
 * // 可能返回: 'before', 'after', 'inside' 或 null
 */
export const calculateDropPosition = (
  event: DragEvent,
  targetElement: HTMLElement
): DropPosition => {
  const rect = targetElement.getBoundingClientRect()
  const offsetY = event.clientY - rect.top
  const height = rect.height

  // 上 25% 区域：放置到目标节点之前
  if (offsetY < height * 0.25) {
    return 'before'
  }

  // 下 25% 区域：放置到目标节点之后
  if (offsetY > height * 0.75) {
    return 'after'
  }

  // 中间 50% 区域：放置到目标节点内部（作为子节点）
  return 'inside'
}

/**
 * 检查两个节点是否为同级节点
 * @function isSiblingNodes
 * @description 通过比较两个节点的 parentId 判断是否同级
 *
 * @param {WebTreeNode} node1 - 第一个节点
 * @param {WebTreeNode} node2 - 第二个节点
 * @returns {boolean} 是否为同级节点（具有相同的父节点ID）
 *
 * @example
 * const isSibling = isSiblingNodes(nodeA, nodeB)
 * // 如果 nodeA.parentId === nodeB.parentId，返回 true
 */
export const isSiblingNodes = (node1: WebTreeNode, node2: WebTreeNode): boolean => {
  return node1.parentId === node2.parentId
}

/**
 * 计算新的排序号（同级排序）
 * @function calculateNewOrderNum
 * @description 在同级节点之间插入时计算合适的排序号
 *
 * 算法说明：
 * - 排序号采用数值型，支持小数，便于在中间插入
 * - 插入到第一个之前：新排序号 = 第一个排序号 - 1
 * - 插入到最后一个之后：新排序号 = 最后一个排序号 + 1
 * - 插入到中间：新排序号 = (前节点排序号 + 后节点排序号) / 2
 *
 * @param {WebTreeNode[]} siblings - 同级节点列表（不包含被拖拽的节点）
 * @param {WebTreeNode} targetNode - 目标节点（作为插入位置的参考）
 * @param {'before' | 'after'} position - 插入位置（之前或之后）
 * @returns {number} 计算得到的新排序号
 *
 * @example
 * const newOrder = calculateNewOrderNum(siblings, targetNode, 'before')
 */
export const calculateNewOrderNum = (
  siblings: WebTreeNode[],
  targetNode: WebTreeNode,
  position: 'before' | 'after'
): number => {
  // 按排序号升序排序，确保顺序正确
  const sortedSiblings = [...siblings].sort((a, b) => a.orderNum - b.orderNum)
  const targetIndex = sortedSiblings.findIndex((n) => n.id === targetNode.id)

  if (position === 'before') {
    // 插入到目标节点之前
    if (targetIndex === 0) {
      // 目标是第一个，新排序号比第一个小
      return sortedSiblings[0]?.orderNum - 1 || 0
    }
    // 取前一个节点和目标节点的中间值
    const prevNode = sortedSiblings[targetIndex - 1]
    return (prevNode.orderNum + targetNode.orderNum) / 2
  } else {
    // 插入到目标节点之后
    if (targetIndex === sortedSiblings.length - 1) {
      // 目标是最后一个，新排序号比最后一个大
      return sortedSiblings[sortedSiblings.length - 1]?.orderNum + 1 || 0
    }
    // 取目标节点和后一个节点的中间值
    const nextNode = sortedSiblings[targetIndex + 1]
    return (targetNode.orderNum + nextNode.orderNum) / 2
  }
}

/**
 * 计算节点移动到新父节点后的排序号（跨级拖拽）
 * @function calculateNewOrderNumForMove
 * @description 用于跨级拖拽时确定节点在新位置的排序
 *
 * 算法说明：
 * - 使用 1000 作为间隔基数，留出足够的插入空间
 * - inside 位置：放到目标文件夹子节点的最后
 * - before/after 位置：与同级排序逻辑相同，但使用更大的间隔
 *
 * @param {WebTreeNode[]} targetSiblings - 目标位置的同级节点列表
 * @param {WebTreeNode} targetNode - 目标节点（作为参考位置）
 * @param {'before' | 'after' | 'inside'} position - 放置位置
 * @returns {number} 计算得到的新排序号
 *
 * @example
 * const newOrder = calculateNewOrderNumForMove(targetSiblings, targetNode, 'inside')
 */
export const calculateNewOrderNumForMove = (
  targetSiblings: WebTreeNode[],
  targetNode: WebTreeNode,
  position: 'before' | 'after' | 'inside'
): number => {
  // 按排序号升序排序
  const sortedSiblings = [...targetSiblings].sort((a, b) => a.orderNum - b.orderNum)

  // 如果是 inside 位置（拖到节点上），放在目标节点子节点的最后
  if (position === 'inside') {
    if (sortedSiblings.length === 0) {
      // 空文件夹，从1000开始
      return 1000
    }
    const lastNode = sortedSiblings[sortedSiblings.length - 1]
    // 间隔1000，留出插入空间
    return lastNode.orderNum + 1000
  }

  // before 或 after 位置
  const targetIndex = sortedSiblings.findIndex((n) => n.id === targetNode.id)

  if (position === 'before') {
    // 插入到目标节点之前
    if (targetIndex === 0 || sortedSiblings.length === 0) {
      // 目标是第一个或列表为空，新排序号比第一个小
      return sortedSiblings[0]?.orderNum - 1000 || 0
    }
    // 取前一个节点和目标节点的中间值
    const prevNode = sortedSiblings[targetIndex - 1]
    return (prevNode.orderNum + targetNode.orderNum) / 2
  } else {
    // 插入到目标节点之后
    if (targetIndex === -1 || targetIndex === sortedSiblings.length - 1) {
      // 目标是最后一个或不在列表中，新排序号比最后一个大
      return sortedSiblings[sortedSiblings.length - 1]?.orderNum + 1000 || 1000
    }
    // 取目标节点和后一个节点的中间值
    const nextNode = sortedSiblings[targetIndex + 1]
    return (targetNode.orderNum + nextNode.orderNum) / 2
  }
}
