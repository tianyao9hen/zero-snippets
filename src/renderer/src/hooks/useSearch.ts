import { data } from '@renderer/data'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
/**
 * @description 搜索
 */
export default () => {
  const snippetsStore = useSnippetsStore()
  const handleSearch = () => {
    const search = snippetsStore.snippets.search.trim()
    if (search) {
      const result = data.filter((item) => {
        return item.content.toLowerCase().includes(search.toLowerCase())
      })
      snippetsStore.setResult(result)
    } else {
      snippetsStore.setResult([])
    }
  }
  return {
    handleSearch
  }
}
