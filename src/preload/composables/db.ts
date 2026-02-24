import { ipcRenderer } from 'electron'
import { ipcEnum } from '../../enum/ipcEnum'

export function sql(
  sql: string,
  type: SqlActionType,
  params: Record<string, string | number> = {}
) {
  return ipcRenderer.invoke(ipcEnum.sql, sql, type, params)
}

export function getAllType() {
  return ipcRenderer.invoke(ipcEnum.getAllType)
}

export function getTypeListByIdList(idList: number[]) {
  return ipcRenderer.invoke(ipcEnum.getTypeListByIdList, idList)
}

export function getAllCategory() {
  return ipcRenderer.invoke(ipcEnum.getAllCategory)
}

export function getCategoryListByTid(tid: number) {
  return ipcRenderer.invoke(ipcEnum.listCategoryByTid, tid)
}

export function addCategory(typeId: number, categoryName: string) {
  return ipcRenderer.invoke(ipcEnum.addCategory, typeId, categoryName)
}

export function editCategory(cid: number, categoryTitle: string) {
  return ipcRenderer.invoke(ipcEnum.editCategory, cid, categoryTitle)
}

export function removeCategory(cid: number) {
  return ipcRenderer.invoke(ipcEnum.removeCategory, cid)
}

export function getArticleById(aid: number) {
  return ipcRenderer.invoke(ipcEnum.getArticleById, aid)
}

export function listArticleByTidAndCid(tid: number, cid: number) {
  return ipcRenderer.invoke(ipcEnum.listArticleByTidAndCid, tid, cid)
}

export function listAllArticle() {
  return ipcRenderer.invoke(ipcEnum.listAllArticle)
}

export function listAllArticleNoCategory() {
  return ipcRenderer.invoke(ipcEnum.listAllArticleNoCategory)
}

export function editArticle(article: ContentEntity) {
  return ipcRenderer.invoke(ipcEnum.editArticle, article)
}

export function removeArticle(aid: number) {
  return ipcRenderer.invoke(ipcEnum.removeArticle, aid)
}

export function addArticle(article: ContentEntity) {
  return ipcRenderer.invoke(ipcEnum.addArticle, article)
}

/**
 * 搜索文章
 * @param keyword 搜索关键词
 * @returns Promise<ContentEntity[]> 匹配的文章列表
 */
export function searchArticle(keyword: string) {
  return ipcRenderer.invoke(ipcEnum.searchArticle, keyword)
}

// ==================== 网页树相关 API ====================

/**
 * 获取指定类型的所有网页树节点
 * @param typeId 类型ID
 * @returns Promise<WebTreeNode[]> 节点列表
 */
export function getWebTreeByTypeId(typeId: number) {
  return ipcRenderer.invoke(ipcEnum.getWebTreeByTypeId, typeId)
}

/**
 * 获取指定类型和类别的所有网页树节点
 * @param typeId 类型ID
 * @param categoryId 类别ID
 * @returns Promise<WebTreeNode[]> 节点列表
 */
export function getWebTreeByTypeIdAndCategoryId(typeId: number, categoryId: number) {
  return ipcRenderer.invoke(ipcEnum.getWebTreeByTypeIdAndCategoryId, typeId, categoryId)
}

/**
 * 获取指定类型的未分类网页树节点（category_id 为 null）
 * @param typeId 类型ID
 * @returns Promise<WebTreeNode[]> 节点列表
 */
export function getWebTreeByTypeIdAndNullCategory(typeId: number) {
  return ipcRenderer.invoke(ipcEnum.getWebTreeByTypeIdAndNullCategory, typeId)
}

/**
 * 根据ID获取网页树节点
 * @param id 节点ID
 * @returns Promise<WebTreeNode | undefined> 节点实体
 */
export function getWebTreeNodeById(id: number) {
  return ipcRenderer.invoke(ipcEnum.getWebTreeNodeById, id)
}

/**
 * 添加网页树节点
 * @param node 节点数据
 * @returns Promise<number> 新节点ID
 */
export function addWebTreeNode(node: Omit<WebTreeNode, 'id' | 'createTime'>) {
  return ipcRenderer.invoke(ipcEnum.addWebTreeNode, node)
}

/**
 * 更新网页树节点
 * @param id 节点ID
 * @param updates 更新的字段
 * @returns Promise<number> 受影响的行数
 */
export function updateWebTreeNode(
  id: number,
  updates: Partial<Omit<WebTreeNode, 'id' | 'createTime'>>
) {
  return ipcRenderer.invoke(ipcEnum.updateWebTreeNode, id, updates)
}

/**
 * 删除网页树节点
 * @param id 节点ID
 * @returns Promise<number> 删除的节点数
 */
export function removeWebTreeNode(id: number) {
  return ipcRenderer.invoke(ipcEnum.removeWebTreeNode, id)
}

/**
 * 移动网页树节点
 * @param id 节点ID
 * @param newParentId 新的父节点ID
 * @returns Promise<number> 受影响的行数
 */
export function moveWebTreeNode(id: number, newParentId: number) {
  return ipcRenderer.invoke(ipcEnum.moveWebTreeNode, id, newParentId)
}

/**
 * 搜索网页树节点
 * @param keyword 搜索关键词
 * @param typeId 类型ID
 * @returns Promise<WebTreeNode[]> 匹配的节点列表
 */
export function searchWebTree(keyword: string, typeId: number, nodeType: number) {
  return ipcRenderer.invoke(ipcEnum.searchWebTree, keyword, typeId, nodeType)
}

export function searchWebTreeByShortcut(keyword: string, typeId: number, nodeType: number) {
  return ipcRenderer.invoke(ipcEnum.searchWebTreeByShortcut, keyword, typeId, nodeType)
}

/**
 * 批量更新网页树节点排序
 * @param orders 节点ID和排序号的映射数组
 * @returns Promise<number> 受影响的行数
 */
export function reorderWebTreeNodes(orders: { id: number; orderNum: number }[]) {
  return ipcRenderer.invoke(ipcEnum.reorderWebTreeNodes, orders)
}

/**
 * 将文件夹设置为目录
 * @param folderId 文件夹节点ID
 * @param folderName 文件夹名称
 * @param typeId 类型ID
 * @returns Promise<number> 新目录ID
 */
export function setFolderAsCategory(folderId: number, folderName: string, typeId: number) {
  return ipcRenderer.invoke(ipcEnum.setFolderAsCategory, folderId, folderName, typeId)
}

/**
 * 更新网页树节点的 category_id
 * @param id 节点ID
 * @param categoryId 类别ID
 * @returns Promise<number> 受影响的行数
 */
export function updateWebTreeNodeCategoryId(id: number, categoryId: number) {
  return ipcRenderer.invoke(ipcEnum.updateWebTreeNodeCategoryId, id, categoryId)
}

/**
 * 递归更新网页树节点及其所有子节点的 category_id
 * @param id 节点ID
 * @param categoryId 类别ID
 * @param typeId 类型ID
 * @returns Promise<number> 受影响的行数
 */
export function updateWebTreeNodeCategoryIdRecursive(
  id: number,
  categoryId: number,
  typeId: number
) {
  return ipcRenderer.invoke(ipcEnum.updateWebTreeNodeCategoryIdRecursive, id, categoryId, typeId)
}

/**
 * 获取网站图标
 * @param url 网站URL
 * @returns Promise<FaviconFetchResult> 图标获取结果
 */
export function fetchFavicon(url: string): Promise<FaviconFetchResult> {
  return ipcRenderer.invoke(ipcEnum.fetchFavicon, url)
}

/**
 * 导入Chrome书签
 * @param params 导入参数
 * @returns Promise<ImportResult> 导入结果
 */
export function importBookmarks(params: { typeId: number; nodes: BookmarkImportNode[] }): Promise<{
  success: boolean
  importedCount: number
  error?: string
}> {
  return ipcRenderer.invoke(ipcEnum.importBookmarks, params)
}

// ==================== 设置相关 API ====================

/**
 * 获取所有设置
 * @returns Promise<SettingEntity[]> 设置列表
 */
export function getAllSettings(): Promise<SettingEntity[]> {
  return ipcRenderer.invoke(ipcEnum.getAllSettings)
}

/**
 * 根据 key 获取设置
 * @param key 设置键
 * @returns Promise<SettingEntity | undefined> 设置实体
 */
export function getSettingByKey(key: string): Promise<SettingEntity | undefined> {
  return ipcRenderer.invoke(ipcEnum.getSettingByKey, key)
}

/**
 * 设置值（插入或更新）
 * @param key 设置键
 * @param value 设置值
 * @param remark 设置描述
 * @returns Promise<number> 受影响的行数
 */
export function setSetting(key: string, value: string, remark?: string): Promise<number> {
  return ipcRenderer.invoke(ipcEnum.setSetting, key, value, remark)
}

/**
 * 删除设置
 * @param key 设置键
 * @returns Promise<number> 受影响的行数
 */
export function deleteSetting(key: string): Promise<number> {
  return ipcRenderer.invoke(ipcEnum.deleteSetting, key)
}

/**
 * 重新加载快捷键
 * @returns Promise<void>
 */
export function reloadShortcut(): Promise<void> {
  return ipcRenderer.invoke(ipcEnum.reloadShortcut)
}
