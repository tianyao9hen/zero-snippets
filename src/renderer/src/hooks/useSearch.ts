import { data, types } from '@renderer/data'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
/**
 * @description 搜索
 */
export default () => {
  const snippetsStore = useSnippetsStore()
  const handleSearch = () => {
    const search = snippetsStore.snippets.search.trim()
    if (search) {
      const result = data
      .filter((item) => {
        if(snippetsStore.snippets.selectTypeId === 0){
          return true;
        }else{
          return item.typeId === snippetsStore.snippets.selectTypeId
        }
      })
      .filter((item) => {
        return item.content.toLowerCase().includes(search.toLowerCase())
      })
      snippetsStore.setResultList(result)
      snippetsStore.setTypeList(types)
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
