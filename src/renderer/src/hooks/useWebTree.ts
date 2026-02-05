/**
 * @file useWebTree.ts
 * @description 网页树组合式函数模块
 *
 * 功能说明：
 * - 提供网页树的增删改查（CRUD）操作
 * - 支持数据转换（扁平列表与树形结构互转）
 * - 提供拖拽排序、节点移动等功能
 * - 包含数据验证和错误处理
 *
 * 数据结构：
 * - WebTreeNode: 数据库原始节点结构（扁平）
 * - WebTreeNodeView: 视图层节点结构（树形，包含UI状态）
 *
 * @example
 * const {
 *   buildTree,
 *   getWebTreeByTypeId,
 *   addWebTreeNode,
 *   updateWebTreeNode,
 *   // ... 其他方法
 * } = useWebTree()
 */
import { WebTreeNodeType } from '@renderer/enums'
import { processUrl } from '@renderer/composables/urlUtils'

/**
 * 节点查找结果类型
 * @interface NodeFindResult
 * @description 包含节点、父节点和在兄弟节点中的索引
 */
interface NodeFindResult {
  /** 找到的节点 */
  node: WebTreeNodeView
  /** 父节点，为null表示根级别 */
  parent: WebTreeNodeView | null
  /** 在兄弟节点数组中的索引 */
  index: number
}

/**
 * 网页树组合式函数
 * @function useWebTree
 * @description 提供网页树的完整操作能力，包括数据获取、转换、增删改查等
 *
 * @returns {Object} 包含所有网页树操作方法的对象
 */
export default function useWebTree() {
  // ==================== 私有工具函数 ====================

  /**
   * 递归查找节点及其父节点
   * @private
   * @description 内部工具函数，用于在树中定位节点
   *
   * @param {WebTreeNodeView[]} nodes - 当前搜索的节点数组
   * @param {number} nodeId - 要查找的节点ID
   * @param {WebTreeNodeView | null} parent - 当前节点的父节点
   * @returns {NodeFindResult | null} 查找结果，未找到返回null
   */
  const findNodeWithParentInternal = (
    nodes: WebTreeNodeView[],
    nodeId: number,
    parent: WebTreeNodeView | null = null
  ): NodeFindResult | null => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === nodeId) {
        return { node: nodes[i], parent, index: i }
      }
      if (nodes[i].children) {
        const found = findNodeWithParentInternal(nodes[i].children!, nodeId, nodes[i])
        if (found) return found
      }
    }
    return null
  }

  /**
   * 递归在树中查找父节点
   * @private
   * @description 内部工具函数，用于根据parentId查找目标父节点
   *
   * @param {WebTreeNodeView[]} tree - 树形结构
   * @param {number} parentId - 父节点ID
   * @returns {WebTreeNodeView | undefined} 找到的父节点
   */
  const findParentNodeInternal = (
    tree: WebTreeNodeView[],
    parentId: number
  ): WebTreeNodeView | undefined => {
    for (const node of tree) {
      if (node.id === parentId) {
        return node
      }
      if (node.children) {
        const found = findParentNodeInternal(node.children, parentId)
        if (found) return found
      }
    }
    return undefined
  }

  /**
   * 递归更新节点及其子节点的层级
   * @private
   * @description 内部工具函数，当节点移动到新父节点下时更新level
   *
   * @param {WebTreeNodeView} node - 要更新的节点
   * @param {number} newLevel - 新的层级
   */
  const updateNodeLevelsInternal = (node: WebTreeNodeView, newLevel: number): void => {
    node.level = newLevel
    if (node.children) {
      for (const child of node.children) {
        updateNodeLevelsInternal(child, newLevel + 1)
      }
    }
  }

  /**
   * 按orderNum将节点插入到正确位置
   * @private
   * @description 内部工具函数，使用二分查找确定插入位置
   *
   * @param {WebTreeNodeView[]} siblings - 兄弟节点数组
   * @param {WebTreeNodeView} node - 要插入的节点
   */
  const insertNodeByOrderNum = (siblings: WebTreeNodeView[], node: WebTreeNodeView): void => {
    const insertIndex = siblings.findIndex((n) => n.orderNum > node.orderNum)
    if (insertIndex === -1) {
      siblings.push(node)
    } else {
      siblings.splice(insertIndex, 0, node)
    }
  }

  // ==================== 公开API ====================

  /**
   * 将扁平节点列表转换为树形结构
   * @function buildTree
   * @description 递归构建树形结构，支持多级嵌套
   *
   * 转换逻辑：
   * 1. 筛选出指定父节点的所有子节点
   * 2. 按 orderNum 排序确保顺序正确
   * 3. 递归处理每个子节点的子节点
   * 4. 添加 UI 状态字段（isExpanded, isEditing）
   *
   * @param {WebTreeNode[]} nodes - 扁平节点列表
   * @param {number} [parentId=0] - 父节点ID，默认为0（根节点）
   * @param {number} [level=0] - 当前层级深度，用于递归计算缩进
   * @returns {WebTreeNodeView[]} 树形结构节点列表
   *
   * @example
   * const treeData = buildTree(flatNodeList)
   * // 返回: [{ id: 1, title: '文件夹', children: [...], isExpanded: true, level: 0 }]
   */
  const buildTree = (
    nodes: WebTreeNode[],
    parentId: number = 0,
    level: number = 0
  ): WebTreeNodeView[] => {
    const result: WebTreeNodeView[] = []

    // 筛选出当前父节点的所有子节点，并按排序号升序排列
    const children = nodes
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => a.orderNum - b.orderNum)

    for (const child of children) {
      // 递归构建子树
      const childNodes = buildTree(nodes, child.id, level + 1)

      // 构建视图层节点对象，添加UI状态
      const nodeView: WebTreeNodeView = {
        ...child,
        level,
        isExpanded: level < 1, // 默认展开第一层
        isEditing: false,
        children: childNodes.length > 0 ? childNodes : undefined
      }
      result.push(nodeView)
    }

    return result
  }

  /**
   * 获取指定类型的所有网页树节点
   * @function getWebTreeByTypeId
   * @description 从主进程API获取指定类型的所有节点数据
   *
   * @param {number} typeId - 类型ID
   * @returns {Promise<WebTreeNode[]>} 节点列表
   * @throws {Error} 当API调用失败时抛出错误
   */
  const getWebTreeByTypeId = async (typeId: number): Promise<WebTreeNode[]> => {
    try {
      return await window.api.getWebTreeByTypeId(typeId)
    } catch (error) {
      console.error('获取网页树失败:', error)
      throw new Error('获取网页树数据失败')
    }
  }

  /**
   * 获取指定类型和类别的所有网页树节点
   * @function getWebTreeByTypeIdAndCategoryId
   * @description 从主进程API获取指定类型和类别的所有节点数据
   *
   * @param {number} typeId - 类型ID
   * @param {number} categoryId - 类别ID
   * @returns {Promise<WebTreeNode[]>} 节点列表
   * @throws {Error} 当API调用失败时抛出错误
   */
  const getWebTreeByTypeIdAndCategoryId = async (
    typeId: number,
    categoryId: number
  ): Promise<WebTreeNode[]> => {
    try {
      return await window.api.getWebTreeByTypeIdAndCategoryId(typeId, categoryId)
    } catch (error) {
      console.error('获取网页树失败:', error)
      throw new Error('获取网页树数据失败')
    }
  }

  /**
   * 获取指定类型的未分类网页树节点（category_id 为 null）
   * @function getWebTreeByTypeIdAndNullCategory
   * @description 从主进程API获取指定类型的未分类节点数据
   *
   * @param {number} typeId - 类型ID
   * @returns {Promise<WebTreeNode[]>} 节点列表
   * @throws {Error} 当API调用失败时抛出错误
   */
  const getWebTreeByTypeIdAndNullCategory = async (typeId: number): Promise<WebTreeNode[]> => {
    try {
      return await window.api.getWebTreeByTypeIdAndNullCategory(typeId)
    } catch (error) {
      console.error('获取网页树失败:', error)
      throw new Error('获取网页树数据失败')
    }
  }

  /**
   * 根据ID获取单个节点
   * @function getWebTreeNodeById
   * @description 获取指定ID的节点详细信息
   *
   * @param {number} id - 节点ID
   * @returns {Promise<WebTreeNode | undefined>} 节点实体，不存在时返回 undefined
   * @throws {Error} 当API调用失败时抛出错误
   */
  const getWebTreeNodeById = async (id: number): Promise<WebTreeNode | undefined> => {
    try {
      return await window.api.getWebTreeNodeById(id)
    } catch (error) {
      console.error('获取节点失败:', error)
      throw new Error('获取节点数据失败')
    }
  }

  /**
   * 添加新节点
   * @function addWebTreeNode
   * @description 添加新的文件夹或网页节点
   *
   * 验证规则：
   * - 节点名称不能为空
   * - 网页节点必须提供URL
   * - URL 会自动补全协议并验证格式
   *
   * @param {Omit<WebTreeNode, 'id' | 'createTime'>} node - 节点数据（不包含ID和创建时间）
   * @returns {Promise<number>} 新节点ID
   * @throws {Error} 当验证失败或API调用失败时抛出错误
   */
  const addWebTreeNode = async (node: Omit<WebTreeNode, 'id' | 'createTime'>): Promise<number> => {
    // 数据验证：节点名称不能为空
    if (!node.title || node.title.trim() === '') {
      throw new Error('节点名称不能为空')
    }

    // 网页节点特殊验证
    if (node.nodeType === WebTreeNodeType.WEBSITE) {
      // 网页节点需要验证URL
      if (!node.url || node.url.trim() === '') {
        throw new Error('网页地址不能为空')
      }

      // 处理URL：自动补全协议并验证
      const result = processUrl(node.url)
      if (!result.isValid) {
        throw new Error(result.error || '网页地址格式不正确')
      }

      // 更新URL为处理后的值（包含自动补全的协议）
      node.url = result.url
    }

    try {
      return await window.api.addWebTreeNode(node)
    } catch (error) {
      console.error('添加节点失败:', error)
      throw new Error('添加节点失败')
    }
  }

  /**
   * 更新节点信息
   * @function updateWebTreeNode
   * @description 更新指定节点的字段信息
   *
   * 验证规则：
   * - 如果更新标题，不能为空
   * - 如果更新URL，会自动补全协议并验证格式
   *
   * @param {number} id - 节点ID
   * @param {Partial<Omit<WebTreeNode, 'id' | 'createTime'>>} updates - 要更新的字段
   * @returns {Promise<number>} 受影响的行数
   * @throws {Error} 当验证失败或API调用失败时抛出错误
   */
  const updateWebTreeNode = async (
    id: number,
    updates: Partial<Omit<WebTreeNode, 'id' | 'createTime'>>
  ): Promise<number> => {
    // 数据验证：标题不能为空
    if (updates.title !== undefined && updates.title.trim() === '') {
      throw new Error('节点名称不能为空')
    }

    // URL 验证和处理
    if (updates.url !== undefined && updates.url !== null && updates.url.trim() !== '') {
      const result = processUrl(updates.url)
      if (!result.isValid) {
        throw new Error(result.error || '网页地址格式不正确')
      }
      // 更新URL为处理后的值（包含自动补全的协议）
      updates.url = result.url
    }

    try {
      return await window.api.updateWebTreeNode(id, updates)
    } catch (error) {
      console.error('更新节点失败:', error)
      throw new Error('更新节点失败')
    }
  }

  /**
   * 更新节点的 category_id
   * @function updateWebTreeNodeCategoryId
   * @description 更新指定节点的 category_id
   *
   * @param {number} id - 节点ID
   * @param {number} categoryId - 新的类别ID
   * @returns {Promise<number>} 受影响的行数
   * @throws {Error} 当API调用失败时抛出错误
   */
  const updateWebTreeNodeCategoryId = async (id: number, categoryId: number): Promise<number> => {
    try {
      return await window.api.updateWebTreeNodeCategoryId(id, categoryId)
    } catch (error) {
      console.error('更新节点分类失败:', error)
      throw new Error('更新节点分类失败')
    }
  }

  /**
   * 递归更新节点及其所有子节点的 category_id
   * @function updateWebTreeNodeCategoryIdRecursive
   * @description 更新指定节点及其所有层级子节点的 category_id，确保分类一致性
   *
   * @param {number} id - 节点ID
   * @param {number} categoryId - 新的类别ID
   * @param {number} typeId - 类型ID
   * @returns {Promise<number>} 受影响的行数总数
   * @throws {Error} 当API调用失败时抛出错误
   */
  const updateWebTreeNodeCategoryIdRecursive = async (
    id: number,
    categoryId: number,
    typeId: number
  ): Promise<number> => {
    try {
      return await window.api.updateWebTreeNodeCategoryIdRecursive(id, categoryId, typeId)
    } catch (error) {
      console.error('递归更新节点分类失败:', error)
      throw new Error('递归更新节点分类失败')
    }
  }

  /**
   * 递归更新树中节点及其所有子节点的 category_id（前端状态更新）
   * @function updateNodeCategoryInTreeRecursive
   * @description 在前端树形结构中递归更新节点及其子节点的 categoryId
   *
   * @param {WebTreeNodeView[]} tree - 树形结构
   * @param {WebTreeNode[]} flatNodeList - 扁平节点列表
   * @param {number} nodeId - 节点ID
   * @param {number} categoryId - 新的类别ID
   * @returns {boolean} 是否更新成功
   */
  const updateNodeCategoryInTreeRecursive = (
    tree: WebTreeNodeView[],
    flatNodeList: WebTreeNode[],
    nodeId: number,
    categoryId: number
  ): boolean => {
    // 1. 在扁平列表中更新节点及其所有子节点的 categoryId
    const updateInFlatList = (parentId: number): number => {
      let count = 0
      const children = flatNodeList.filter((n) => n.parentId === parentId)
      for (const child of children) {
        child.categoryId = categoryId
        count++
        count += updateInFlatList(child.id)
      }
      return count
    }

    // 2. 更新目标节点本身
    const targetNode = flatNodeList.find((n) => n.id === nodeId)
    if (targetNode) {
      targetNode.categoryId = categoryId
    }

    // 3. 递归更新所有子节点
    updateInFlatList(nodeId)

    // 4. 在树形结构中更新
    const updateInTree = (nodes: WebTreeNodeView[]): boolean => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          // 找到目标节点，更新其 categoryId
          node.categoryId = categoryId
          // 递归更新其子节点
          const updateChildren = (children: WebTreeNodeView[] | undefined): void => {
            if (!children) return
            for (const child of children) {
              child.categoryId = categoryId
              updateChildren(child.children)
            }
          }
          updateChildren(node.children)
          return true
        }
        if (node.children) {
          if (updateInTree(node.children)) return true
        }
      }
      return false
    }

    return updateInTree(tree)
  }

  /**
   * 删除节点
   * @function removeWebTreeNode
   * @description 删除指定节点，会级联删除所有子节点
   *
   * @param {number} id - 节点ID
   * @returns {Promise<number>} 删除的节点数
   * @throws {Error} 当API调用失败时抛出错误
   */
  const removeWebTreeNode = async (id: number): Promise<number> => {
    try {
      return await window.api.removeWebTreeNode(id)
    } catch (error) {
      console.error('删除节点失败:', error)
      throw new Error('删除节点失败')
    }
  }

  /**
   * 移动节点到新的父节点
   * @function moveWebTreeNode
   * @description 将节点移动到新的父节点下，支持移动到根级别
   *
   * 验证规则：
   * - 不能将节点移动到自己下面
   * - 不能将父节点移动到自己的子节点中（防止循环引用）
   *
   * @param {number} id - 要移动的节点ID
   * @param {number} newParentId - 新的父节点ID（0表示根级别）
   * @returns {Promise<number>} 受影响的行数
   * @throws {Error} 当验证失败或API调用失败时抛出错误
   */
  const moveWebTreeNode = async (id: number, newParentId: number): Promise<number> => {
    // 防止将节点移动到自己下面
    if (id === newParentId) {
      throw new Error('不能将节点移动到自己下面')
    }

    // 移动到根级别不需要检查子节点关系
    if (newParentId === 0) {
      try {
        return await window.api.moveWebTreeNode(id, newParentId)
      } catch (error) {
        console.error('移动节点失败:', error)
        throw error
      }
    }

    try {
      // 检查目标父节点是否是当前节点的子节点
      const checkIsChild = async (parentId: number, targetId: number): Promise<boolean> => {
        const allNodes = await window.api.getWebTreeByTypeId(2) // 获取所有节点
        const children = allNodes.filter((n) => n.parentId === parentId)

        for (const child of children) {
          if (child.id === targetId) return true
          if (await checkIsChild(child.id, targetId)) return true
        }
        return false
      }

      if (await checkIsChild(id, newParentId)) {
        throw new Error('不能将节点移动到自己的子节点下面')
      }

      return await window.api.moveWebTreeNode(id, newParentId)
    } catch (error) {
      console.error('移动节点失败:', error)
      throw error
    }
  }

  /**
   * 搜索节点
   * @function searchWebTree
   * @description 根据关键词搜索节点
   *
   * @param {string} keyword - 搜索关键词
   * @param {number} typeId - 类型ID
   * @returns {Promise<WebTreeNode[]>} 匹配的节点列表
   * @throws {Error} 当API调用失败时抛出错误
   */
  const searchWebTree = async (keyword: string, typeId: number): Promise<WebTreeNode[]> => {
    if (!keyword || keyword.trim() === '') {
      return getWebTreeByTypeId(typeId)
    }

    try {
      return await window.api.searchWebTree(keyword.trim(), typeId)
    } catch (error) {
      console.error('搜索节点失败:', error)
      throw new Error('搜索节点失败')
    }
  }

  /**
   * 在树中查找节点
   * @function findNodeInTree
   * @description 递归在树形结构中查找指定ID的节点
   *
   * @param {WebTreeNodeView[]} tree - 树形结构
   * @param {number} id - 节点ID
   * @returns {WebTreeNodeView | undefined} 找到的节点，不存在返回 undefined
   */
  const findNodeInTree = (tree: WebTreeNodeView[], id: number): WebTreeNodeView | undefined => {
    for (const node of tree) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeInTree(node.children, id)
        if (found) return found
      }
    }
    return undefined
  }

  /**
   * 展开所有节点
   * @function expandAll
   * @description 递归展开树中的所有节点
   *
   * @param {WebTreeNodeView[]} tree - 树形结构
   */
  const expandAll = (tree: WebTreeNodeView[]): void => {
    for (const node of tree) {
      node.isExpanded = true
      if (node.children) {
        expandAll(node.children)
      }
    }
  }

  /**
   * 折叠所有节点
   * @function collapseAll
   * @description 递归折叠树中的所有节点
   *
   * @param {WebTreeNodeView[]} tree - 树形结构
   */
  const collapseAll = (tree: WebTreeNodeView[]): void => {
    for (const node of tree) {
      node.isExpanded = false
      if (node.children) {
        collapseAll(node.children)
      }
    }
  }

  /**
   * 获取节点的所有父节点ID路径
   * @function getParentPath
   * @description 从根节点到直接父节点的ID路径
   *
   * @param {WebTreeNode[]} nodes - 扁平节点列表
   * @param {number} nodeId - 目标节点ID
   * @returns {number[]} 父节点ID列表（从根到直接父节点）
   *
   * @example
   * const path = getParentPath(nodes, 5)
   * // 返回: [1, 2] 表示路径：根 -> 1 -> 2 -> 5
   */
  const getParentPath = (nodes: WebTreeNode[], nodeId: number): number[] => {
    const path: number[] = []
    let currentId = nodeId

    while (currentId !== 0) {
      const node = nodes.find((n) => n.id === currentId)
      if (!node) break
      if (node.parentId !== 0 && node.parentId !== null) {
        path.unshift(node.parentId)
      }
      currentId = node.parentId || 0
    }

    return path
  }

  /**
   * 获取节点的父节点路径名称
   * @function getParentPathNames
   * @description 用于展示的路径字符串，如："根节点 > 文件夹A > 文件夹B"
   *
   * @param {WebTreeNode[]} nodes - 扁平节点列表
   * @param {number} nodeId - 目标节点ID
   * @returns {string} 父节点路径名称
   */
  const getParentPathNames = (nodes: WebTreeNode[], nodeId: number): string => {
    if (nodeId === 0) return '根节点'

    const parentIds = getParentPath(nodes, nodeId)
    const names: string[] = ['根节点']

    for (const parentId of parentIds) {
      const parent = nodes.find((n) => n.id === parentId)
      if (parent) {
        names.push(parent.title)
      }
    }

    return names.join(' > ')
  }

  /**
   * 获取指定节点的直接父节点
   * @function getParentNode
   * @description 获取节点的直接父节点对象
   *
   * @param {WebTreeNode[]} nodes - 扁平节点列表
   * @param {number} nodeId - 目标节点ID
   * @returns {WebTreeNode | undefined} 父节点，根节点返回 undefined
   */
  const getParentNode = (nodes: WebTreeNode[], nodeId: number): WebTreeNode | undefined => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node || node.parentId === 0) return undefined
    return nodes.find((n) => n.id === node.parentId)
  }

  /**
   * 获取所有可作为父节点的文件夹节点
   * @function getFolderNodes
   * @description 获取所有文件夹类型的节点，可排除指定节点及其子节点
   *
   * 使用场景：
   * - 编辑节点时选择父节点
   * - 需要排除当前节点及其子节点（防止循环引用）
   *
   * @param {WebTreeNode[]} nodes - 扁平节点列表
   * @param {number} [excludeNodeId] - 需要排除的节点ID（用于编辑时排除当前节点及其子节点）
   * @returns {WebTreeNode[]} 文件夹节点列表
   */
  const getFolderNodes = (nodes: WebTreeNode[], excludeNodeId?: number): WebTreeNode[] => {
    // 获取需要排除的节点ID集合（包括当前节点及其所有子节点）
    const getExcludedIds = (id: number): number[] => {
      const excluded = [id]
      const children = nodes.filter((n) => n.parentId === id)
      for (const child of children) {
        excluded.push(...getExcludedIds(child.id))
      }
      return excluded
    }

    const excludedIds = excludeNodeId ? new Set(getExcludedIds(excludeNodeId)) : new Set<number>()

    return nodes.filter(
      (node) => node.nodeType === WebTreeNodeType.FOLDER && !excludedIds.has(node.id)
    )
  }

  /**
   * 批量更新节点排序
   * @function reorderWebTreeNodes
   * @description 批量更新多个节点的排序号
   *
   * @param {{ id: number; orderNum: number }[]} orders - 节点ID和排序号的映射数组
   * @returns {Promise<number>} 受影响的行数
   * @throws {Error} 当API调用失败时抛出错误
   */
  const reorderWebTreeNodes = async (
    orders: { id: number; orderNum: number }[]
  ): Promise<number> => {
    try {
      return await window.api.reorderWebTreeNodes(orders)
    } catch (error) {
      console.error('更新节点排序失败:', error)
      throw new Error('更新节点排序失败')
    }
  }

  /**
   * 计算新节点的父节点ID
   * @function calculateParentId
   * @description 根据当前选中的节点计算新节点应该放置的父节点ID
   *
   * 计算规则：
   * - 未选中任何节点（selectedNodeId = 0）-> 父节点为根节点（0）
   * - 选中文件夹节点 -> 父节点为该文件夹节点（作为其子节点）
   * - 选中网页节点 -> 父节点为该网页节点的父节点（与其同级）
   *
   * @param {number} selectedNodeId - 当前选中的节点ID（0表示未选中）
   * @param {WebTreeNode[]} flatNodeList - 扁平节点列表
   * @returns {number} 计算得到的父节点ID（0表示根节点）
   *
   * @example
   * // 未选中节点
   * calculateParentId(0, nodes) // 返回 0
   *
   * // 选中文件夹节点（id=5）
   * calculateParentId(5, nodes) // 返回 5
   *
   * // 选中网页节点（id=3, parentId=1）
   * calculateParentId(3, nodes) // 返回 1
   */
  const calculateParentId = (selectedNodeId: number, flatNodeList: WebTreeNode[]): number => {
    // 未选中任何节点 -> 根节点(0)
    if (selectedNodeId === 0) {
      return 0
    }

    const selectedNode = flatNodeList.find((n) => n.id === selectedNodeId)

    // 选中的节点不存在 -> 根节点(0)
    if (!selectedNode) {
      return 0
    }

    // 选中文件夹节点 -> 作为该文件夹的子节点
    if (selectedNode.nodeType === WebTreeNodeType.FOLDER) {
      return selectedNode.id
    }

    // 选中网页节点 -> 与该网页同级（使用其父节点）
    return selectedNode.parentId ?? 0
  }

  /**
   * 在树中查找父节点
   * @function findParentNodeInTree
   * @description 递归在树形结构中查找指定父节点ID的节点
   *
   * @param {WebTreeNodeView[]} tree - 树形结构
   * @param {number} parentId - 父节点ID
   * @returns {WebTreeNodeView | undefined} 找到的父节点，不存在返回 undefined
   */
  const findParentNodeInTree = (
    tree: WebTreeNodeView[],
    parentId: number
  ): WebTreeNodeView | undefined => {
    return findParentNodeInternal(tree, parentId)
  }

  /**
   * 将新节点局部插入到树中
   * @function insertNodeToTree
   * @description 不重新加载整个树，仅将新节点插入到正确的位置
   *
   * @param {WebTreeNodeView[]} tree - 当前树形结构（会被修改）
   * @param {WebTreeNode[]} flatNodeList - 当前扁平节点列表（会被修改）
   * @param {WebTreeNode} newNode - 新节点数据
   * @returns {boolean} 是否插入成功
   */
  const insertNodeToTree = (
    tree: WebTreeNodeView[],
    flatNodeList: WebTreeNode[],
    newNode: WebTreeNode
  ): boolean => {
    // 1. 将新节点添加到扁平列表
    flatNodeList.push(newNode)

    // 2. 构建视图层节点
    const newNodeView: WebTreeNodeView = {
      ...newNode,
      level: 0, // 临时值，会根据父节点重新计算
      isExpanded: false,
      isEditing: false,
      children: undefined
    }

    // 3. 根据 parentId 找到插入位置
    const parentId = newNode.parentId ?? 0

    if (parentId === 0) {
      // 插入到根级别
      newNodeView.level = 0
      insertNodeByOrderNum(tree, newNodeView)
      return true
    }

    // 4. 查找父节点并插入
    const parentNode = findParentNodeInternal(tree, parentId)
    if (!parentNode) {
      console.warn('未找到父节点，无法局部插入')
      return false
    }

    // 计算新节点的层级
    newNodeView.level = (parentNode.level ?? 0) + 1

    // 初始化父节点的 children 数组（如果不存在）
    if (!parentNode.children) {
      parentNode.children = []
    }

    // 按 orderNum 找到正确的插入位置
    insertNodeByOrderNum(parentNode.children, newNodeView)

    return true
  }

  /**
   * 更新节点在树中的位置（用于排序变更）
   * @function updateNodeOrderInTree
   * @description 当节点排序号改变时，在树中重新定位该节点，同时同步更新扁平列表
   *
   * @param {WebTreeNodeView[]} tree - 当前树形结构（会被修改）
   * @param {WebTreeNode[]} flatNodeList - 扁平节点列表（会被修改）
   * @param {number} nodeId - 节点ID
   * @param {number} newOrderNum - 新的排序号
   * @returns {boolean} 是否更新成功
   */
  const updateNodeOrderInTree = (
    tree: WebTreeNodeView[],
    flatNodeList: WebTreeNode[],
    nodeId: number,
    newOrderNum: number
  ): boolean => {
    // 找到节点及其父节点
    const result = findNodeWithParentInternal(tree, nodeId)
    if (!result) return false

    // 更新排序号
    result.node.orderNum = newOrderNum

    // 同步更新 flatNodeList 中的排序号
    const flatNode = flatNodeList.find((n) => n.id === nodeId)
    if (flatNode) {
      flatNode.orderNum = newOrderNum
    }

    // 从当前位置移除
    const siblings = result.parent ? result.parent.children! : tree
    siblings.splice(result.index, 1)

    // 重新插入到正确位置
    insertNodeByOrderNum(siblings, result.node)

    return true
  }

  /**
   * 在树中移动节点（跨级移动）
   * @function moveNodeInTree
   * @description 将节点从原位置移动到新父节点下，并更新排序位置
   *
   * @param {WebTreeNodeView[]} tree - 当前树形结构（会被修改）
   * @param {WebTreeNode[]} flatNodeList - 当前扁平节点列表（会被修改）
   * @param {number} nodeId - 要移动的节点ID
   * @param {number} newParentId - 新的父节点ID（0表示根级别）
   * @param {number} newOrderNum - 新的排序号
   * @param {number} [newCategoryId] - 新的类别ID（可选）
   * @returns {boolean} 是否移动成功
   */
  const moveNodeInTree = (
    tree: WebTreeNodeView[],
    flatNodeList: WebTreeNode[],
    nodeId: number,
    newParentId: number,
    newOrderNum: number,
    newCategoryId?: number
  ): boolean => {
    // 1. 在扁平列表中更新 parentId 和 orderNum
    const flatNode = flatNodeList.find((n) => n.id === nodeId)
    if (!flatNode) {
      console.warn('未找到要移动的节点')
      return false
    }
    flatNode.parentId = newParentId
    flatNode.orderNum = newOrderNum
    // 如果提供了新的 categoryId，同步更新
    if (newCategoryId !== undefined) {
      flatNode.categoryId = newCategoryId
    }

    // 2. 在树中找到节点及其当前父节点
    const result = findNodeWithParentInternal(tree, nodeId)
    if (!result) {
      console.warn('未在树中找到要移动的节点')
      return false
    }

    // 3. 从原位置移除
    const oldSiblings = result.parent ? result.parent.children! : tree
    const [movedNode] = oldSiblings.splice(result.index, 1)

    // 4. 更新节点的 parentId 和 orderNum
    movedNode.parentId = newParentId
    movedNode.orderNum = newOrderNum
    // 如果提供了新的 categoryId，同步更新树中的节点
    if (newCategoryId !== undefined) {
      movedNode.categoryId = newCategoryId
    }

    // 5. 插入到新位置
    if (newParentId === 0) {
      // 移动到根级别
      updateNodeLevelsInternal(movedNode, 0)
      insertNodeByOrderNum(tree, movedNode)
    } else {
      // 移动到新父节点下
      const newParentNode = findParentNodeInternal(tree, newParentId)
      if (!newParentNode) {
        console.warn('未找到目标父节点')
        // 恢复节点到原位置
        oldSiblings.splice(result.index, 0, movedNode)
        return false
      }

      // 初始化 children 数组（如果不存在）
      if (!newParentNode.children) {
        newParentNode.children = []
      }

      // 更新节点及其子节点的层级
      updateNodeLevelsInternal(movedNode, (newParentNode.level ?? 0) + 1)

      // 按 orderNum 插入到正确位置
      insertNodeByOrderNum(newParentNode.children, movedNode)
    }

    return true
  }

  // 返回所有方法
  return {
    buildTree,
    getWebTreeByTypeId,
    getWebTreeByTypeIdAndCategoryId,
    getWebTreeByTypeIdAndNullCategory,
    getWebTreeNodeById,
    addWebTreeNode,
    updateWebTreeNode,
    updateWebTreeNodeCategoryId,
    updateWebTreeNodeCategoryIdRecursive,
    updateNodeCategoryInTreeRecursive,
    removeWebTreeNode,
    moveWebTreeNode,
    searchWebTree,
    findNodeInTree,
    expandAll,
    collapseAll,
    getParentPath,
    getParentPathNames,
    getParentNode,
    getFolderNodes,
    reorderWebTreeNodes,
    calculateParentId,
    findParentNodeInTree,
    insertNodeToTree,
    updateNodeOrderInTree,
    moveNodeInTree
  }
}
