import { ipcMain, IpcMainInvokeEvent } from 'electron'
import * as execute from './sql'
import { findAll as findAllType, findListByIdList as findTypeListByIdList } from './sql/typeSql'
import { findAll as findAllCategory, add as addCategory, edit as editCategory, remove as removeCategory } from './sql/categorySql'
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

ipcMain.handle(ipcEnum.addCategory, (_event: IpcMainInvokeEvent, typeId: number, categoryName: string) => {
  return addCategory(typeId, categoryName)
})

ipcMain.handle(ipcEnum.editCategory, (_event: IpcMainInvokeEvent, categoryId: number, categoryTitle: string) => {
  return editCategory(categoryId, categoryTitle)
})

ipcMain.handle(ipcEnum.removeCategory, (_event: IpcMainInvokeEvent, categoryId: number) => {
  return removeCategory(categoryId)
})
