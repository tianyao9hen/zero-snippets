import { defineStore } from 'pinia'
import { ref } from 'vue'

type SnippetsStore = {
  search: string // 検索文字列
  result: ContentType[]  // 検索結果
  selectId: number // 选中的id
  writeFlag: boolean // 是否输入开关
}

export const useSnippetsStore = defineStore('snippets', () => {
  const snippets = ref<SnippetsStore>({
    search: '',
    result: [],
    selectId: 0,
    writeFlag: true
  })

  function setId(id: number) {
    snippets.value.selectId = id
  }

  function setResult(result: ContentType[]) {
    snippets.value.result = result
    if (result.length > 0) {
      snippets.value.selectId = result[0].id
    } else {
      snippets.value.selectId = 0
    }
  }

  return {
    snippets,
    setId,
    setResult
  }
})
