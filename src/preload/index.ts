import { contextBridge, clipboard, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { showMainMenu } from './composables/menu'
import { setIgnoreMouseEvent } from './composables/setIgnoreMouseEvent'
import { showWindowExclusive } from './composables/window'
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
  searchArticle,
  getWebTreeByTypeId,
  getWebTreeByTypeIdAndCategoryId,
  getWebTreeByTypeIdAndNullCategory,
  getWebTreeNodeById,
  addWebTreeNode,
  updateWebTreeNode,
  removeWebTreeNode,
  moveWebTreeNode,
  searchWebTree,
  searchWebTreeByShortcut,
  reorderWebTreeNodes,
  setFolderAsCategory,
  updateWebTreeNodeCategoryId,
  updateWebTreeNodeCategoryIdRecursive,
  fetchFavicon,
  importBookmarks,
  getAllSettings,
  getSettingByKey,
  setSetting,
  deleteSetting,
  reloadShortcut
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
  searchArticle,
  getWebTreeByTypeId,
  getWebTreeByTypeIdAndCategoryId,
  getWebTreeByTypeIdAndNullCategory,
  getWebTreeNodeById,
  addWebTreeNode,
  updateWebTreeNode,
  removeWebTreeNode,
  moveWebTreeNode,
  searchWebTree,
  searchWebTreeByShortcut,
  reorderWebTreeNodes,
  setFolderAsCategory,
  updateWebTreeNodeCategoryId,
  updateWebTreeNodeCategoryIdRecursive,
  fetchFavicon,
  importBookmarks,
  showWindowExclusive,
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  getAllSettings,
  getSettingByKey,
  setSetting,
  deleteSetting,
  reloadShortcut
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
