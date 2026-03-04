import { contextBridge, clipboard } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { showMainMenu } from './composables/menu'
import { setIgnoreMouseEvent } from './composables/setIgnoreMouseEvent'
import { showWindow, showWindowExclusive, hideWindow, openExternal } from './composables/window'
import { getAutoLaunchStatus, toggleAutoLaunch } from './composables/autoLaunch'
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
  reloadShortcut,
  addNote,
  editNote,
  removeNote,
  listAllNote,
  getNoteById,
  listCommands,
  searchCommands,
  addCommand,
  updateCommand,
  removeCommand,
  getRunningCommands,
  getCommandLogs,
  runCommand,
  runUnifiedCommands,
  stopCommand,
  stopUnifiedCommands,
  dismissCommandInstance
} from './composables/db'
import { uploadToOss } from './composables/ossService'

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
  showWindow,
  showWindowExclusive,
  hideWindow,
  openExternal,
  getAllSettings,
  getSettingByKey,
  setSetting,
  deleteSetting,
  reloadShortcut,
  addNote,
  editNote,
  removeNote,
  listAllNote,
  getNoteById,
  // 开机自启动 API
  getAutoLaunchStatus,
  toggleAutoLaunch,
  uploadToOss,
  // 命令配置与执行 API
  listCommands,
  searchCommands,
  addCommand,
  updateCommand,
  removeCommand,
  getRunningCommands,
  getCommandLogs,
  runCommand,
  runUnifiedCommands,
  stopCommand,
  stopUnifiedCommands,
  dismissCommandInstance
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
