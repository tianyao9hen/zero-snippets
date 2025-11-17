import { ipcMain, IpcMainInvokeEvent } from 'electron'
import * as execute from './sql'
import { findAll as findAllType, findListByIdList as findTypeListByIdList } from './sql/typeSql'
import {
  findAll as findAllCategory,
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
