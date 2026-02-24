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
    if (targetIndex === 0 || sortedSiblings.length === 0) {
      // 目标是第一个或列表为空，新排序号比第一个小
      return (sortedSiblings[0]?.orderNum ?? 0) - 1
    }
    // 取前一个节点和目标节点的中间值
    const prevNode = sortedSiblings[targetIndex - 1]
    return (prevNode.orderNum + targetNode.orderNum) / 2
  } else {
    // 插入到目标节点之后
    if (
      targetIndex === -1 ||
      targetIndex === sortedSiblings.length - 1 ||
      sortedSiblings.length === 0
    ) {
      // 目标是最后一个或不在列表中或列表为空，新排序号比最后一个大
      const lastOrderNum = sortedSiblings[sortedSiblings.length - 1]?.orderNum ?? 0
      return lastOrderNum + 1
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

/**
 * 网页树相关操作 Hook
 */
export default () => {
  /**
   * 搜索网页树节点
   * @param keyword 搜索关键词
   * @param typeId 类型ID
   * @param nodeType 节点类型
   * @returns Promise<WebTreeNode[]> 匹配的节点列表
   */
  const searchWebTreeNodes = async (
    keyword: string,
    typeId: number,
    nodeType: number
  ): Promise<WebTreeNode[]> => {
    return await window.api.searchWebTree(keyword, typeId, nodeType)
  }

  const searchWebTreeNodesByShortcut = async (
    keyword: string,
    typeId: number,
    nodeType: number
  ): Promise<WebTreeNode[]> => {
    return await window.api.searchWebTreeByShortcut(keyword, typeId, nodeType)
  }

  /**
   * 构建树形结构
   * @param flatList 扁平节点列表
   * @returns WebTreeNodeView[] 树形结构
   */
  const buildTree = (flatList: WebTreeNode[]): WebTreeNodeView[] => {
    const nodeMap = new Map<number, WebTreeNodeView>()
    const roots: WebTreeNodeView[] = []

    // 首先创建所有节点的映射
    flatList.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [] })
    })

    // 然后构建树形结构
    flatList.forEach((node) => {
      const viewNode = nodeMap.get(node.id)!
      if (node.parentId === 0 || !nodeMap.has(node.parentId)) {
        // 根节点
        roots.push(viewNode)
      } else {
        // 子节点
        const parent = nodeMap.get(node.parentId)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(viewNode)
        }
      }
    })

    // 对每个层级的子节点按 orderNum 排序
    const sortChildren = (nodes: WebTreeNodeView[]) => {
      nodes.sort((a, b) => a.orderNum - b.orderNum)
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortChildren(node.children)
        }
      })
    }
    sortChildren(roots)

    return roots
  }

  /**
   * 展开所有节点
   * @param treeData 树数据
   */
  const expandAll = (treeData: WebTreeNodeView[]) => {
    const expand = (nodes: WebTreeNodeView[]) => {
      nodes.forEach((node) => {
        node.isExpanded = true
        if (node.children && node.children.length > 0) {
          expand(node.children)
        }
      })
    }
    expand(treeData)
  }

  /**
   * 收起所有节点
   * @param treeData 树数据
   */
  const collapseAll = (treeData: WebTreeNodeView[]) => {
    const collapse = (nodes: WebTreeNodeView[]) => {
      nodes.forEach((node) => {
        node.isExpanded = false
        if (node.children && node.children.length > 0) {
          collapse(node.children)
        }
      })
    }
    collapse(treeData)
  }

  /**
   * 插入节点到树中
   * @param treeData 树数据
   * @param flatList 扁平列表
   * @param newNode 新节点
   * @returns boolean 是否成功
   */
  const insertNodeToTree = (
    treeData: WebTreeNodeView[],
    flatList: WebTreeNode[],
    newNode: WebTreeNode
  ): boolean => {
    // 添加到扁平列表
    flatList.push(newNode)

    // 创建视图节点
    const viewNode: WebTreeNodeView = { ...newNode, children: [] }

    if (newNode.parentId === 0) {
      // 根节点
      treeData.push(viewNode)
      // 排序
      treeData.sort((a, b) => a.orderNum - b.orderNum)
      return true
    }

    // 查找父节点
    const findParent = (nodes: WebTreeNodeView[]): WebTreeNodeView | null => {
      for (const node of nodes) {
        if (node.id === newNode.parentId) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = findParent(node.children)
          if (found) return found
        }
      }
      return null
    }

    const parent = findParent(treeData)
    if (parent) {
      parent.children = parent.children || []
      parent.children.push(viewNode)
      // 排序
      parent.children.sort((a, b) => a.orderNum - b.orderNum)
      return true
    }

    return false
  }

  /**
   * 查找父节点
   * @param treeData 树数据
   * @param nodeId 节点ID
   * @returns WebTreeNodeView | null 父节点
   */
  const findParentNodeInTree = (
    treeData: WebTreeNodeView[],
    nodeId: number
  ): WebTreeNodeView | null => {
    const find = (
      nodes: WebTreeNodeView[],
      parent: WebTreeNodeView | null
    ): WebTreeNodeView | null => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          return parent
        }
        if (node.children && node.children.length > 0) {
          const found = find(node.children, node)
          if (found) return found
        }
      }
      return null
    }
    return find(treeData, null)
  }

  /**
   * 更新节点顺序
   * @param treeData 树数据
   * @param flatList 扁平列表
   * @param nodeId 节点ID
   * @param newOrderNum 新排序号
   * @returns boolean 是否成功
   */
  const updateNodeOrderInTree = (
    treeData: WebTreeNodeView[],
    flatList: WebTreeNode[],
    nodeId: number,
    newOrderNum: number
  ): boolean => {
    // 更新扁平列表
    const node = flatList.find((n) => n.id === nodeId)
    if (node) {
      node.orderNum = newOrderNum
    }

    // 更新树中的节点，并重新排序同级节点
    const updateInTree = (nodes: WebTreeNodeView[]): boolean => {
      for (const n of nodes) {
        if (n.id === nodeId) {
          n.orderNum = newOrderNum
          // 找到节点后，对当前数组（同级节点）进行排序
          nodes.sort((a, b) => a.orderNum - b.orderNum)
          return true
        }
        if (n.children && n.children.length > 0) {
          if (updateInTree(n.children)) {
            return true
          }
        }
      }
      return false
    }

    return updateInTree(treeData)
  }

  /**
   * 在树中移动节点
   * @param treeData 树数据
   * @param flatList 扁平列表
   * @param nodeId 节点ID
   * @param targetId 目标节点ID
   * @param newOrderNum 新排序号
   * @param newCategoryId 新分类ID
   * @returns boolean 是否成功
   */
  const moveNodeInTree = (
    treeData: WebTreeNodeView[],
    flatList: WebTreeNode[],
    nodeId: number,
    targetId: number,
    newOrderNum: number,
    newCategoryId?: number
  ): boolean => {
    // 从扁平列表中找到节点
    const nodeIndex = flatList.findIndex((n) => n.id === nodeId)
    if (nodeIndex === -1) return false

    const node = flatList[nodeIndex]

    // 更新节点信息
    node.parentId = targetId
    node.orderNum = newOrderNum
    if (newCategoryId !== undefined) {
      node.categoryId = newCategoryId
    }

    // 从树中移除节点
    const removeFromTree = (nodes: WebTreeNodeView[]): WebTreeNodeView | null => {
      const index = nodes.findIndex((n) => n.id === nodeId)
      if (index !== -1) {
        return nodes.splice(index, 1)[0]
      }
      for (const n of nodes) {
        if (n.children && n.children.length > 0) {
          const removed = removeFromTree(n.children)
          if (removed) return removed
        }
      }
      return null
    }

    // 添加到新位置
    const addToTree = (nodes: WebTreeNodeView[], viewNode: WebTreeNodeView): boolean => {
      // 如果目标ID是0，添加到根节点
      if (targetId === 0) {
        nodes.push(viewNode)
        nodes.sort((a, b) => a.orderNum - b.orderNum)
        return true
      }

      for (const n of nodes) {
        if (n.id === targetId) {
          n.children = n.children || []
          n.children.push(viewNode)
          n.children.sort((a, b) => a.orderNum - b.orderNum)
          return true
        }
        if (n.children && n.children.length > 0) {
          if (addToTree(n.children, viewNode)) {
            return true
          }
        }
      }
      return false
    }

    // 先从旧位置移除
    const viewNode = removeFromTree(treeData)
    if (!viewNode) return false

    // 更新视图节点
    viewNode.parentId = targetId
    viewNode.orderNum = newOrderNum
    if (newCategoryId !== undefined) {
      viewNode.categoryId = newCategoryId
    }

    // 添加到新位置
    return addToTree(treeData, viewNode)
  }

  /**
   * 递归更新树中节点的 category_id
   * @param treeData 树数据
   * @param flatList 扁平列表
   * @param nodeId 节点ID
   * @param categoryId 分类ID
   */
  const updateNodeCategoryInTreeRecursive = (
    treeData: WebTreeNodeView[],
    flatList: WebTreeNode[],
    nodeId: number,
    categoryId: number
  ) => {
    // 更新扁平列表
    const updateFlatList = (id: number) => {
      const node = flatList.find((n) => n.id === id)
      if (node) {
        node.categoryId = categoryId
      }
    }

    // 递归更新树
    const updateTree = (nodes: WebTreeNodeView[]) => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          // 更新当前节点
          node.categoryId = categoryId
          updateFlatList(nodeId)
          // 递归更新子节点
          const updateChildren = (children: WebTreeNodeView[]) => {
            children.forEach((child) => {
              child.categoryId = categoryId
              updateFlatList(child.id)
              if (child.children && child.children.length > 0) {
                updateChildren(child.children)
              }
            })
          }
          if (node.children && node.children.length > 0) {
            updateChildren(node.children)
          }
          return true
        }
        if (node.children && node.children.length > 0) {
          if (updateTree(node.children)) {
            return true
          }
        }
      }
      return false
    }

    updateTree(treeData)
  }

  /**
   * 计算父节点ID
   * @param currentSelectedId 当前选中节点ID
   * @param flatList 扁平列表
   * @returns number 父节点ID
   */
  const calculateParentId = (currentSelectedId: number | null, flatList: WebTreeNode[]): number => {
    if (!currentSelectedId) return 0

    const selectedNode = flatList.find((n) => n.id === currentSelectedId)
    if (!selectedNode) return 0

    // 如果选中的是文件夹，则作为父节点
    if (selectedNode.nodeType === 0) {
      return selectedNode.id
    }

    // 如果选中的是网页，则使用其 parentId
    return selectedNode.parentId
  }

  /**
   * 获取指定类型的网页树
   * @param typeId 类型ID
   * @returns Promise<WebTreeNode[]> 节点列表
   */
  const getWebTreeByTypeId = async (typeId: number): Promise<WebTreeNode[]> => {
    return await window.api.getWebTreeByTypeId(typeId)
  }

  /**
   * 获取指定类型和类别的网页树
   * @param typeId 类型ID
   * @param categoryId 类别ID
   * @returns Promise<WebTreeNode[]> 节点列表
   */
  const getWebTreeByTypeIdAndCategoryId = async (
    typeId: number,
    categoryId: number
  ): Promise<WebTreeNode[]> => {
    return await window.api.getWebTreeByTypeIdAndCategoryId(typeId, categoryId)
  }

  /**
   * 获取指定类型且无类别的网页树
   * @param typeId 类型ID
   * @returns Promise<WebTreeNode[]> 节点列表
   */
  const getWebTreeByTypeIdAndNullCategory = async (typeId: number): Promise<WebTreeNode[]> => {
    return await window.api.getWebTreeByTypeIdAndNullCategory(typeId)
  }

  /**
   * 更新网页树节点
   * @param id 节点ID
   * @param updates 更新内容
   * @returns Promise<number> 影响的行数
   */
  const updateWebTreeNode = async (
    id: number,
    updates: Partial<Omit<WebTreeNode, 'id' | 'createTime'>>
  ): Promise<number> => {
    return await window.api.updateWebTreeNode(id, updates)
  }

  /**
   * 递归更新节点及其子节点的类别ID
   * @param id 节点ID
   * @param categoryId 类别ID
   * @param typeId 类型ID
   * @returns Promise<number> 影响的行数
   */
  const updateWebTreeNodeCategoryIdRecursive = async (
    id: number,
    categoryId: number,
    typeId: number
  ): Promise<number> => {
    return await window.api.updateWebTreeNodeCategoryIdRecursive(id, categoryId, typeId)
  }

  /**
   * 删除网页树节点
   * @param id 节点ID
   * @returns Promise<number> 影响的行数
   */
  const removeWebTreeNode = async (id: number): Promise<number> => {
    return await window.api.removeWebTreeNode(id)
  }

  /**
   * 移动网页树节点
   * @param id 节点ID
   * @param newParentId 新父节点ID
   * @returns Promise<number> 影响的行数
   */
  const moveWebTreeNode = async (id: number, newParentId: number): Promise<number> => {
    return await window.api.moveWebTreeNode(id, newParentId)
  }

  /**
   * 重新排序网页树节点
   * @param orders 排序信息列表
   * @returns Promise<number> 影响的行数
   */
  const reorderWebTreeNodes = async (
    orders: { id: number; orderNum: number }[]
  ): Promise<number> => {
    return await window.api.reorderWebTreeNodes(orders)
  }

  /**
   * 获取父节点的路径名称
   * @param nodes 扁平节点列表
   * @param parentId 父节点ID
   * @returns string 父节点路径字符串
   */
  const getParentPathNames = (nodes: WebTreeNode[], parentId: number): string => {
    if (parentId === 0) return '根节点'

    const parentNode = nodes.find((n) => n.id === parentId)
    if (!parentNode) return '根节点'

    // 构建完整路径数组
    const pathNames: string[] = [parentNode.title]
    let currentId = parentNode.parentId ?? 0

    // 向上遍历获取所有父节点名称
    while (currentId !== 0) {
      const node = nodes.find((n) => n.id === currentId)
      if (!node) break
      pathNames.unshift(node.title)
      currentId = node.parentId ?? 0
    }

    // 添加根节点
    pathNames.unshift('根节点')

    // 根据层级数量决定显示方式
    if (pathNames.length <= 3) {
      return pathNames.join(' > ')
    } else {
      // 超过3级，显示为：根节点 > ... > 父节点
      const root = pathNames[0]
      const parent = pathNames[pathNames.length - 1]
      return `${root} > ... > ${parent}`
    }
  }

  /**
   * 将文件夹设置为目录
   * @param folderId 文件夹节点ID
   * @param folderName 文件夹名称
   * @param typeId 类型ID
   * @returns Promise<number> 新目录ID
   */
  const setFolderAsCategory = async (
    folderId: number,
    folderName: string,
    typeId: number
  ): Promise<number> => {
    return await window.api.setFolderAsCategory(folderId, folderName, typeId)
  }

  return {
    searchWebTreeNodes,
    searchWebTreeNodesByShortcut,
    buildTree,
    expandAll,
    collapseAll,
    insertNodeToTree,
    findParentNodeInTree,
    updateNodeOrderInTree,
    moveNodeInTree,
    updateNodeCategoryInTreeRecursive,
    calculateParentId,
    getWebTreeByTypeId,
    getWebTreeByTypeIdAndCategoryId,
    getWebTreeByTypeIdAndNullCategory,
    updateWebTreeNode,
    updateWebTreeNodeCategoryIdRecursive,
    removeWebTreeNode,
    moveWebTreeNode,
    reorderWebTreeNodes,
    getParentPathNames,
    setFolderAsCategory
  }
}
