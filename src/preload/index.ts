import { contextBridge, clipboard } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { showMainMenu } from './composables/menu'
import { setIgnoreMouseEvent } from './composables/setIgnoreMouseEvent'
import {
  sql,
  getAllType,
  getTypeListByIdList,
  getAllCategory,
  getCategoryListByTid,
  addCategory,
  editCategory,
  removeCategory,
  getArticleById,
  listArticleByTidAndCid,
  listAllArticle,
  listAllArticleNoCategory,
  editArticle,
  removeArticle,
  addArticle,
  getWebTreeByTypeId,
  getWebTreeByTypeIdAndCategoryId,
  getWebTreeByTypeIdAndNullCategory,
  getWebTreeNodeById,
  addWebTreeNode,
  updateWebTreeNode,
  removeWebTreeNode,
  moveWebTreeNode,
  searchWebTree,
  reorderWebTreeNodes,
  updateWebTreeNodeCategoryId,
  updateWebTreeNodeCategoryIdRecursive,
  fetchFavicon
} from './composables/db'

// Custom APIs for renderer
const api = {
  showMainMenu,
  setIgnoreMouseEvent,
  readClipboardText: () => clipboard.readText(),
  sql,
  getAllType,
  getTypeListByIdList,
  getAllCategory,
  getCategoryListByTid,
  addCategory,
  editCategory,
  removeCategory,
  getArticleById,
  listArticleByTidAndCid,
  listAllArticle,
  listAllArticleNoCategory,
  editArticle,
  removeArticle,
  addArticle,
  getWebTreeByTypeId,
  getWebTreeByTypeIdAndCategoryId,
  getWebTreeByTypeIdAndNullCategory,
  getWebTreeNodeById,
  addWebTreeNode,
  updateWebTreeNode,
  removeWebTreeNode,
  moveWebTreeNode,
  searchWebTree,
  reorderWebTreeNodes,
  updateWebTreeNodeCategoryId,
  updateWebTreeNodeCategoryIdRecursive,
  fetchFavicon
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
