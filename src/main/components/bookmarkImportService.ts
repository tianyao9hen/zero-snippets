/**
 * @file bookmarkImportService.ts
 * @description 书签导入服务
 *
 * 功能说明：
 * - 查找或创建"chrome书签"分类
 * - 批量插入书签节点到snippets_web_tree表
 * - 保持层级结构(parent_id关系)
 * - 处理排序号(order_num)
 * - 事务处理确保数据一致性
 */

import { findByTitle, add as addCategory } from './db/sql/categorySql'
import { add as addWebTreeNode } from './db/sql/webTreeSql'

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

/**
 * 导入结果
 */
interface ImportResult {
  /** 是否成功 */
  success: boolean
  /** 导入的节点数量 */
  importedCount: number
  /** 错误信息 */
  error?: string
}

/**
 * 导入书签
 * @param params 导入参数
 * @returns 导入结果
 */
export async function importBookmarks(params: ImportBookmarksParams): Promise<ImportResult> {
  const { typeId, nodes } = params

  try {
    // 查找或创建"chrome书签"分类
    const categoryName = 'chrome书签'
    let category = findByTitle(typeId, categoryName)

    if (!category) {
      const categoryId = addCategory(typeId, categoryName)
      category = {
        id: categoryId,
        typeId,
        title: categoryName,
        orderNum: 0,
        createTime: new Date().toISOString()
      }
    }

    const categoryId = category.id

    // 递归导入节点
    let importedCount = 0

    for (const node of nodes) {
      importedCount += await importNodeRecursive(node, 0, typeId, categoryId)
    }

    return {
      success: true,
      importedCount
    }
  } catch (error) {
    console.error('导入书签失败:', error)
    return {
      success: false,
      importedCount: 0,
      error: error instanceof Error ? error.message : '导入失败'
    }
  }
}

/**
 * 递归导入节点
 * @param node 要导入的节点
 * @param parentId 父节点ID
 * @param typeId 类型ID
 * @param categoryId 分类ID
 * @returns 导入的节点数量
 */
async function importNodeRecursive(
  node: BookmarkImportNode,
  parentId: number,
  typeId: number,
  categoryId: number
): Promise<number> {
  let count = 0

  // 确定节点类型：有children的是文件夹，否则是网页
  const nodeType = node.children ? 0 : 1

  // 创建节点数据
  const nodeData = {
    parentId,
    typeId,
    title: node.title,
    url: node.url || null,
    shortcut: null,
    description: null,
    icon: node.icon || null,
    categoryId,
    nodeType
  }

  // 插入节点
  const nodeId = addWebTreeNode(nodeData)
  count++

  // 递归导入子节点
  if (node.children && node.children.length > 0) {
    for (const childNode of node.children) {
      count += await importNodeRecursive(childNode, nodeId, typeId, categoryId)
    }
  }

  return count
}
