import { data } from '@renderer/data'
import useType from '@renderer/hooks/useType'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
/**
 * @description 搜索
 */
export default () => {
  const snippetsStore = useSnippetsStore()
  const {getTypeListByIdList} = useType()
  const handleSearch = () => {
    const search = snippetsStore.snippets.search.trim()
    if (search) {
      let result = data
      .filter((item) => {
        return item.content.toLowerCase().includes(search.toLowerCase())
      })
      const typeIdList = result.map((item) => item.typeId)
      snippetsStore.setTypeList(getTypeListByIdList(typeIdList))
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
  return {
    handleSearch
  }
}
