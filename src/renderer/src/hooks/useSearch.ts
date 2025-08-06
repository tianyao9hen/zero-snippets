import { data } from '@renderer/data'
import useType from '@renderer/hooks/useType'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
/**
 * @description 搜索
 */
export default () => {
  const snippetsStore = useSnippetsStore()
  const {getTypeListByIdList} = useType()
  const handleSearch = async () => {
    const search = snippetsStore.snippets.search.trim()
    if (search) {
      let result = data
      .filter((item) => {
        return item.content.toLowerCase().includes(search.toLowerCase())
      })
      const typeIdList = result.map((item) => item.typeId)
      snippetsStore.setTypeList(await getTypeListByIdList(typeIdList))
      result = result.filter((item) => {
        if(snippetsStore.snippets.selectTypeId === 0){
          return true;
        }else{
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
  const getContentListByTypeIdAndCategoryId = (typeId: number, categoryId: number) => {
    return data.filter((item) => {
      if(typeId){
        return item.typeId === typeId
      }
    }).filter((item) => {
      if(categoryId === 0){
        return true
      }
      if(categoryId === -1) {
        return !item.categoryId
      }
      if(categoryId){
        return item.categoryId === categoryId
      }
    })
  }
  return {
    handleSearch,
    getContentListByTypeIdAndCategoryId
  }
}
