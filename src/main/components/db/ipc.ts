import { ipcMain, IpcMainInvokeEvent } from 'electron'
import * as execute from './sql'
import { findAll as findAllType, findListByIdList as findTypeListByIdList } from './sql/typeSql'
import {
  findAll as findAllCategory,
  listByTid as listCategoryByTid,
  add as addCategory,
  edit as editCategory,
  remove as removeCategory
} from './sql/categorySql'
import {
  getById as getArticleById,
  listByTidAndCid as listArticleByTidAndCid,
  listAll as listAllArticle,
  listAllNoCategory as listAllArticleNoCategory,
  edit as editArticle,
  remove as removeArticle,
  add as addArticle
} from './sql/articleSql'
import {
  findAllByTypeId as findWebTreeByTypeId,
  findAllByTypeIdAndCategoryId as findWebTreeByTypeIdAndCategoryId,
  findAllByTypeIdAndNullCategory as findWebTreeByTypeIdAndNullCategory,
  findById as findWebTreeNodeById,
  add as addWebTreeNode,
  update as updateWebTreeNode,
  remove as removeWebTreeNode,
  moveNode as moveWebTreeNode,
  search as searchWebTree,
  updateOrders as updateWebTreeOrders,
  updateCategoryId as updateWebTreeNodeCategoryId,
  updateCategoryIdRecursive as updateWebTreeNodeCategoryIdRecursive
} from './sql/webTreeSql'
import { fetchFavicon } from '../favicon'
import { ipcEnum } from '../../../enum/ipcEnum'

ipcMain.handle(
  ipcEnum.sql,
  (_event: IpcMainInvokeEvent, sql: string, type: SqlActionType, params = {}) => {
    return execute[type](sql, params)
  }
)

ipcMain.handle(ipcEnum.getAllType, () => {
  return findAllType()
})

ipcMain.handle(ipcEnum.getTypeListByIdList, (_event: IpcMainInvokeEvent, idList: number[]) => {
  return findTypeListByIdList(idList)
})

ipcMain.handle(ipcEnum.getAllCategory, () => {
  return findAllCategory()
})

ipcMain.handle(ipcEnum.listCategoryByTid, (_event: IpcMainInvokeEvent, tid: number) => {
  return listCategoryByTid(tid)
})

ipcMain.handle(
  ipcEnum.addCategory,
  (_event: IpcMainInvokeEvent, typeId: number, categoryName: string) => {
    return addCategory(typeId, categoryName)
  }
)

ipcMain.handle(
  ipcEnum.editCategory,
  (_event: IpcMainInvokeEvent, categoryId: number, categoryTitle: string) => {
    return editCategory(categoryId, categoryTitle)
  }
)

ipcMain.handle(ipcEnum.removeCategory, (_event: IpcMainInvokeEvent, categoryId: number) => {
  return removeCategory(categoryId)
})

ipcMain.handle(ipcEnum.getArticleById, (_event: IpcMainInvokeEvent, articleId: number) => {
  return getArticleById(articleId)
})

ipcMain.handle(
  ipcEnum.listArticleByTidAndCid,
  (_event: IpcMainInvokeEvent, typeId: number, categoryId: number) => {
    return listArticleByTidAndCid(typeId, categoryId)
  }
)

ipcMain.handle(ipcEnum.listAllArticle, () => {
  return listAllArticle()
})

ipcMain.handle(ipcEnum.listAllArticleNoCategory, () => {
  return listAllArticleNoCategory()
})

ipcMain.handle(ipcEnum.editArticle, (_event: IpcMainInvokeEvent, article: ContentEntity) => {
  return editArticle(article)
})

ipcMain.handle(ipcEnum.removeArticle, (_event: IpcMainInvokeEvent, articleId: number) => {
  return removeArticle(articleId)
})

ipcMain.handle(ipcEnum.addArticle, (_event: IpcMainInvokeEvent, article: ContentEntity) => {
  return addArticle(article)
})

// ==================== 网页树相关 IPC 处理 ====================

/**
 * 获取指定类型的所有网页树节点
 */
ipcMain.handle(ipcEnum.getWebTreeByTypeId, (_event: IpcMainInvokeEvent, typeId: number) => {
  return findWebTreeByTypeId(typeId)
})

/**
 * 获取指定类型和类别的所有网页树节点
 */
ipcMain.handle(
  ipcEnum.getWebTreeByTypeIdAndCategoryId,
  (_event: IpcMainInvokeEvent, typeId: number, categoryId: number) => {
    return findWebTreeByTypeIdAndCategoryId(typeId, categoryId)
  }
)

/**
 * 获取指定类型的未分类网页树节点（category_id 为 null）
 */
ipcMain.handle(
  ipcEnum.getWebTreeByTypeIdAndNullCategory,
  (_event: IpcMainInvokeEvent, typeId: number) => {
    return findWebTreeByTypeIdAndNullCategory(typeId)
  }
)

/**
 * 根据ID获取网页树节点
 */
ipcMain.handle(ipcEnum.getWebTreeNodeById, (_event: IpcMainInvokeEvent, id: number) => {
  return findWebTreeNodeById(id)
})

/**
 * 添加网页树节点
 */
ipcMain.handle(
  ipcEnum.addWebTreeNode,
  (_event: IpcMainInvokeEvent, node: Omit<WebTreeNode, 'id' | 'createTime'>) => {
    return addWebTreeNode(node)
  }
)

/**
 * 更新网页树节点
 */
ipcMain.handle(
  ipcEnum.updateWebTreeNode,
  (
    _event: IpcMainInvokeEvent,
    id: number,
    updates: Partial<Omit<WebTreeNode, 'id' | 'createTime'>>
  ) => {
    return updateWebTreeNode(id, updates)
  }
)

/**
 * 删除网页树节点（级联删除子节点）
 */
ipcMain.handle(ipcEnum.removeWebTreeNode, (_event: IpcMainInvokeEvent, id: number) => {
  return removeWebTreeNode(id)
})

/**
 * 移动网页树节点到新的父节点
 */
ipcMain.handle(
  ipcEnum.moveWebTreeNode,
  (_event: IpcMainInvokeEvent, id: number, newParentId: number) => {
    return moveWebTreeNode(id, newParentId)
  }
)

/**
 * 更新网页树节点的 category_id
 */
ipcMain.handle(
  ipcEnum.updateWebTreeNodeCategoryId,
  (_event: IpcMainInvokeEvent, id: number, categoryId: number) => {
    return updateWebTreeNodeCategoryId(id, categoryId)
  }
)

/**
 * 递归更新网页树节点及其所有子节点的 category_id
 */
ipcMain.handle(
  ipcEnum.updateWebTreeNodeCategoryIdRecursive,
  (_event: IpcMainInvokeEvent, id: number, categoryId: number, typeId: number) => {
    return updateWebTreeNodeCategoryIdRecursive(id, categoryId, typeId)
  }
)

/**
 * 搜索网页树节点
 */
ipcMain.handle(
  ipcEnum.searchWebTree,
  (_event: IpcMainInvokeEvent, keyword: string, typeId: number) => {
    return searchWebTree(keyword, typeId)
  }
)

/**
 * 批量更新网页树节点排序
 */
ipcMain.handle(
  ipcEnum.reorderWebTreeNodes,
  (_event: IpcMainInvokeEvent, orders: { id: number; orderNum: number }[]) => {
    return updateWebTreeOrders(orders)
  }
)

/**
 * 获取网站图标
 */
ipcMain.handle(ipcEnum.fetchFavicon, (_event: IpcMainInvokeEvent, url: string) => {
  return fetchFavicon(url)
})
