import { useSnippetsStore } from '@renderer/store/snippetsStore'
import useType from '@renderer/hooks/useType'
import useArticle from '@renderer/hooks/useArticle'
import useWebTree from '@renderer/hooks/useWebTree'

/**
 * @description 搜索
 */
export default () => {
  const snippetsStore = useSnippetsStore()
  const { getTypeListByIdList } = useType()
  const { searchArticle } = useArticle()
  const { searchWebTreeNodes } = useWebTree()

  const handleSearch = async () => {
    const search = snippetsStore.snippets.search.trim()
    if (search) {
      try {
        // 并行查询文章和网页
        const [articleResults, webResults] = await Promise.all([
          searchArticle(search),
          searchWebTreeNodes(search, 2) // typeId=2 是网页类型
        ])

        // 转换网页结果为 ContentEntity 格式
        const formattedWebResults: ContentEntity[] = webResults.map((node) => ({
          id: node.id,
          typeId: node.typeId,
          categoryId: node.categoryId || -1,
          title: node.title,
          content: node.url || node.description || '',
          icon: node.icon || undefined
        }))

        // 合并结果：文章在前，网页在后
        let combinedResults = [...articleResults, ...formattedWebResults]

        // 提取类型列表
        const typeIdList = combinedResults.map((item) => item.typeId)
        snippetsStore.setTypeList(await getTypeListByIdList(typeIdList))

        // 根据选中的类型筛选
        combinedResults = combinedResults.filter((item) => {
          if (snippetsStore.snippets.selectTypeId === 0) {
            return true
          } else {
            return item.typeId === snippetsStore.snippets.selectTypeId
          }
        })

        snippetsStore.setResultList(combinedResults)
      } catch (error) {
        console.error('搜索失败:', error)
        snippetsStore.setResultList([])
        snippetsStore.setTypeList([])
      }
    } else {
      snippetsStore.setTypeId(0)
      snippetsStore.setResultList([])
      snippetsStore.setTypeList([])
    }
  }

  // 根据分类id和类型id获取内容列表
  const getContentListByTypeIdAndCategoryId = async (typeId: number, categoryId: number) => {
    const { listArticleByTidAndCid, listAllArticle, listAllArticleNoCategory } = useArticle()
    if (categoryId === 0) {
      // 所以片段
      return await listAllArticle()
    } else if (categoryId === -1) {
      // 未分类
      return await listAllArticleNoCategory()
    } else {
      // 筛选类别
      return await listArticleByTidAndCid(typeId, categoryId)
    }
  }
  return {
    handleSearch,
    getContentListByTypeIdAndCategoryId
  }
}
