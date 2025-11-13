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
      getAllType: () => Promise<TypeEntity[]>
      getTypeListByIdList: (idList: number[]) => Promise<TypeEntity[]>
      getAllCategory: () => Promise<categoryEntity[]>
      addCategory: (typeId: number, categoryName: string) => number
      editCategory: (cid: number, categoryTitle: string) => number
      removeCategory: (cid: number) => number
      getArticleById: (aid: number) => Promise<articleEntity>
      listArticleByTidAndCid: (tid: number,cid: number) => Promise<ContentEntity[]>
      listAllArticle: () => Promise<articleEntity[]>
      listAllArticleNoCategory: () => Promise<articleEntity[]>
    }
  }
}
