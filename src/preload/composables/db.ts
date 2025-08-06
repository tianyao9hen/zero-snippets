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
