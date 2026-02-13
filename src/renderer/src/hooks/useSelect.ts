import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { onMounted, onUnmounted, ref } from 'vue'
import useSearch from './useSearch'

/**
 * @description 选择类型、结果、输入框的事件处理
 */
export default () => {
  const snippetsStore = useSnippetsStore()
  const { handleSearch } = useSearch()
  let scrollTopHeightCount = 5

  const section = ref<HTMLDivElement>()
  const items = ref<Map<string, HTMLDivElement>>(new Map())

  const setItemRef = (el, uniqueId: string) => {
    if (el) {
      items.value.set(uniqueId, el)
    }
  }

  const getItemRef = (uniqueId: string): HTMLDivElement | undefined => {
    return items.value.get(uniqueId)
  }

  const setSectionRef = (el) => {
    if (el) {
      section.value = el
    }
  }

  const selectTypeById = (tid: number) => {
    snippetsStore.setTypeFlag(true)
    section.value?.scrollTo(0, 0)
    const data = snippetsStore.snippets.typeList
    if (data.length === 0) {
      snippetsStore.setTypeId(0)
      return
    }
    snippetsStore.setTypeId(tid)
    handleSearch()
  }

  const selectItemByUniqueId = (uniqueId: string) => {
    const itemRef = getItemRef(uniqueId)
    if (!itemRef) return
    const oldUniqueId = snippetsStore.snippets.selectId
    if (oldUniqueId) {
      const oldItemRef = getItemRef(oldUniqueId)
      if (oldItemRef) {
        console.log(oldItemRef.offsetTop - itemRef.offsetTop, itemRef.offsetHeight)
        const num = itemRef.offsetTop - oldItemRef.offsetTop
        if (num > 0) {
          // 选择了下面的一个选项
          const scrollNum = Math.ceil(num / itemRef.offsetHeight)
          scrollTopHeightCount += scrollNum
        } else if (num < 0) {
          // 选择了下面的一个选项
          const scrollNum = Math.ceil(num / itemRef.offsetHeight)
          scrollTopHeightCount += scrollNum
        }
      }
    }
    // 向下选择时，关闭输入框的编辑模式，同时设置结果列表为焦点状态
    snippetsStore.setResultFlag(true) // 新增：确保焦点在结果列表
    // 滚动条滚动到指定位置
    // section.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * 5)
    // itemRef.focus({ preventScroll: true })
    // 阻止浏览器自动滚动
    snippetsStore.setId(uniqueId)
  }

  const handleKeyEvent = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowUp': {
        e.preventDefault() // 阻止默认行为
        const data = snippetsStore.snippets.resultList
        if (data.length === 0) return
        let uniqueId = snippetsStore.snippets.selectId
        const index = data.findIndex((item) => item.uniqueId === uniqueId)
        uniqueId = data[index - 1]?.uniqueId || uniqueId
        // 如果当前焦点在输入框
        if (snippetsStore.snippets.writeFlag) {
          snippetsStore.setResultFlag(true)
          uniqueId = data[data.length - 1].uniqueId
          const itemRef = getItemRef(uniqueId)
          if (!itemRef) return
          // 滚动条滚动到指定位置
          section.value?.scrollTo(
            0,
            itemRef.offsetTop - itemRef.offsetHeight * scrollTopHeightCount
          )
          snippetsStore.setId(uniqueId)
          return
        }
        // 如果当前焦点在类别框
        if (snippetsStore.snippets.typeFlag) {
          snippetsStore.setWriteFlag(true)
          scrollTopHeightCount = 5
          return
        }
        // 如果选项已经到达最上面
        if (index - 1 < 0) {
          snippetsStore.setTypeFlag(true)
          scrollTopHeightCount = 5
          return
        }
        const itemRef = getItemRef(uniqueId)
        if (!itemRef) return
        // 滚动条滚动到指定位置
        section.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * scrollTopHeightCount)
        snippetsStore.setId(uniqueId)
        break
      }
      case 'ArrowDown': {
        e.preventDefault() // 阻止默认行为
        // 如果当前焦点在输入框
        if (snippetsStore.snippets.writeFlag) {
          snippetsStore.setTypeFlag(true)
          return
        }
        // 如果当前焦点在类型列表
        if (snippetsStore.snippets.typeFlag) {
          snippetsStore.setResultFlag(true)
          return
        }
        const data = snippetsStore.snippets.resultList
        if (data.length === 0) return
        let uniqueId = snippetsStore.snippets.selectId
        const index = data.findIndex((item) => item.uniqueId === uniqueId)
        if (!data[index + 1]) {
          // 如果已经到达最下面，将滚动条最高滚动数量调整回默认值
          scrollTopHeightCount = 5
        }
        uniqueId = data[index + 1]?.uniqueId || data[0].uniqueId
        const itemRef = getItemRef(uniqueId)
        if (!itemRef) return
        snippetsStore.setId(uniqueId)
        section.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * scrollTopHeightCount)
        break
      }
      case 'ArrowLeft': {
        if (snippetsStore.snippets.writeFlag) {
          return
        }
        snippetsStore.setTypeFlag(true)
        section.value?.scrollTo(0, 0)
        const data = snippetsStore.snippets.typeList
        if (data.length === 0) {
          snippetsStore.setTypeId(0)
          return
        }
        let id = snippetsStore.snippets.selectTypeId
        const index = data.findIndex((item) => item.id === id)
        id = data[index + 1]?.id || 0
        snippetsStore.setTypeId(id)
        handleSearch()
        break
      }
      case 'ArrowRight': {
        if (snippetsStore.snippets.writeFlag) {
          return
        }
        snippetsStore.setTypeFlag(true)
        section.value?.scrollTo(0, 0)
        const data = snippetsStore.snippets.typeList
        if (data.length === 0) {
          snippetsStore.setTypeId(0)
        }
        let id = snippetsStore.snippets.selectTypeId
        const index = data.findIndex((item) => item.id === id)
        id = data[index - 1 >= -1 ? index - 1 : data.length - 1]?.id || 0
        snippetsStore.setTypeId(id)
        handleSearch()
        break
      }
      case 'Backspace': {
        if (!snippetsStore.snippets.writeFlag) {
          snippetsStore.setWriteFlag(true)
          return
        }
        break
      }
      case 'Enter': {
        const data = snippetsStore.snippets.resultList
        const uniqueId = snippetsStore.snippets.selectId
        const selectedItem = data.find((item) => item.uniqueId === uniqueId)
        if (selectedItem) {
          if (selectedItem.typeId === 1) {
            // 文章类型，打开 content 窗口
            const path = `/content/1/category/${selectedItem.categoryId}/catelog/${selectedItem.id}/article`
            window.api.showWindowExclusive('content', path)
          } else if (selectedItem.typeId === 2 && selectedItem.url) {
            // 网页类型，使用浏览器打开 URL
            window.api.openExternal(selectedItem.url)
          }
        }
        break
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyEvent)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyEvent)
  })

  return {
    setItemRef,
    setSectionRef,
    selectTypeById,
    selectItemByUniqueId
  }
}
