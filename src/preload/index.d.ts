import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      showMainMenu: () => void
      setIgnoreMouseEvent: (ignore: boolean, options?: { forward: boolean }) => void
      sql: <T>(
        sql: string,
        type: SqlActionType,
        params?: Record<string, string | number>
      ) => Promise<T>
      getAllType: () => Promise<typeEntity[]>
      getTypeListByIdList: (idList: number[]) => Promise<typeEntity[]>
      getAllCategory: () => Promise<categoryEntity[]>
      addCategory: (typeId: number, categoryName: string) => number
      editCategory: (cid: number, categoryTitle: string) => number
      removeCategory: (cid: number) => number
    }
  }
}
