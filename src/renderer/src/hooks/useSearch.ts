import { data } from '@renderer/data'
import useType from '@renderer/hooks/useType'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import useArticle from '@renderer/hooks/useArticle'
/**
 * @description 搜索
 */
export default () => {
  const snippetsStore = useSnippetsStore()
  const { getTypeListByIdList } = useType()
  const handleSearch = async () => {
    const search = snippetsStore.snippets.search.trim()
    if (search) {
      let result = data.filter((item) => {
        return item.content.toLowerCase().includes(search.toLowerCase())
      })
      const typeIdList = result.map((item) => item.typeId)
      snippetsStore.setTypeList(await getTypeListByIdList(typeIdList))
      result = result.filter((item) => {
        if (snippetsStore.snippets.selectTypeId === 0) {
          return true
        } else {
          return item.typeId === snippetsStore.snippets.selectTypeId
        }
      })
      snippetsStore.setResultList(result)
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
