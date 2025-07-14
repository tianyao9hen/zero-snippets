import { defineStore } from 'pinia'
import { ref } from 'vue'

// 检索页面
type SnippetsStoreType = {
  search: string // 检索文字列
  resultList: ContentType[]  // 検索結果
  selectId: number // 选中的id
  writeFlag: boolean // 是否输入开关
  typeFlag: boolean // 是否选择类型开关
  resultFlag: boolean // 是否选择结果开关
  selectTypeId: number // 选中的类型id
  typeList: ContentTypeType[] // 类型列表
}

// 内容页面
type ContentStoreType = {
  selectTypeId: number // 选择的类型id
  selectCategoryId: number // 选择的种类id
}

export const useSnippetsStore = defineStore('snippets', () => {
  const snippets = ref<SnippetsStoreType>({
    search: '',
    resultList: [],
    selectId: 0,
    writeFlag: true,
    typeFlag: false,
    resultFlag: false,
    selectTypeId: 0,
    typeList: []
  })

  const content = ref<ContentStoreType>({
    selectTypeId: 0,
    selectCategoryId: 0
  })

  function setId(id: number) {
    snippets.value.selectId = id
  }

  function setTypeId(id: number) {
    snippets.value.selectTypeId = id
  }

  function setContentTypeId(id: number){
    content.value.selectTypeId = id
  }

  function setResultList(result: ContentType[]) {
    snippets.value.resultList = result
    if (result.length > 0) {
      snippets.value.selectId = result[0].id
    } else {
      snippets.value.selectId = 0
    }
  }

  function setTypeList(typeList: ContentTypeType[]) {
    snippets.value.typeList = typeList
  }

  function setTypeFlag(flag: boolean){
    if(flag){
      snippets.value.writeFlag = false
      snippets.value.resultFlag = false
    }
    snippets.value.typeFlag = flag
  }

  function setWriteFlag(flag: boolean){
    if(flag){
      snippets.value.typeFlag = false
      snippets.value.resultFlag = false
    }
    snippets.value.writeFlag = flag
  }

  function setResultFlag(flag: boolean){
    if(flag){
      snippets.value.typeFlag = false
      snippets.value.writeFlag = false
    }
    snippets.value.resultFlag = flag
  }

  function choiceCategory(id: number){
    content.value.selectCategoryId = id
  }

  return {
    snippets,
    content,
    setId,
    setResultList,
    setTypeList,
    setTypeId,
    setContentTypeId,
    setTypeFlag,
    setWriteFlag,
    setResultFlag,
    choiceCategory
  }
})
