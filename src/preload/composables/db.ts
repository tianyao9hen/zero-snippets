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

export function addCategory(typeId: number, categoryName: string) {
  return ipcRenderer.invoke(ipcEnum.addCategory, typeId, categoryName)
}

export function editCategory(cid: number, categoryTitle: string) {
  return ipcRenderer.invoke(ipcEnum.editCategory, cid, categoryTitle)
}

export function removeCategory(cid: number) {
  return ipcRenderer.invoke(ipcEnum.removeCategory, cid)
}
