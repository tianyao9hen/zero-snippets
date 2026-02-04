import { ElectronAPI } from '@electron-toolkit/preload'

type FaviconFetchResult = {
  url: string | null
  success: boolean
  error?: string
}

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
      getCategoryListByTid: (tid: number) => Promise<categoryEntity[]>
      addCategory: (typeId: number, categoryName: string) => number
      editCategory: (cid: number, categoryTitle: string) => number
      removeCategory: (cid: number) => number
      getArticleById: (aid: number) => Promise<articleEntity>
      listArticleByTidAndCid: (tid: number, cid: number) => Promise<ContentEntity[]>
      listAllArticle: () => Promise<articleEntity[]>
      listAllArticleNoCategory: () => Promise<articleEntity[]>
      editArticle: (article: articleEntity) => number
      removeArticle: (aid: number) => number
      addArticle: (article: articleEntity) => number
      // 网页树相关 API
      getWebTreeByTypeId: (typeId: number) => Promise<WebTreeNode[]>
      getWebTreeNodeById: (id: number) => Promise<WebTreeNode | undefined>
      addWebTreeNode: (node: Omit<WebTreeNode, 'id' | 'createTime'>) => Promise<number>
      updateWebTreeNode: (
        id: number,
        updates: Partial<Omit<WebTreeNode, 'id' | 'createTime'>>
      ) => Promise<number>
      removeWebTreeNode: (id: number) => Promise<number>
      moveWebTreeNode: (id: number, newParentId: number) => Promise<number>
      searchWebTree: (keyword: string, typeId: number) => Promise<WebTreeNode[]>
      reorderWebTreeNodes: (orders: { id: number; orderNum: number }[]) => Promise<number>
      // 图标获取 API
      fetchFavicon: (url: string) => Promise<FaviconFetchResult>
    }
  }
}
