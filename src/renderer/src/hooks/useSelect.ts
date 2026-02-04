import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { onMounted, onUnmounted, ref } from 'vue'
import useSearch from './useSearch'

/**
 * @description 选择类型、结果、输入框的事件处理
 */
export default () => {
  const snippetsStore = useSnippetsStore()
  const { handleSearch } = useSearch()

  const section = ref<HTMLDivElement>()
  const items = ref<Map<number, HTMLDivElement>>(new Map())

  const setItemRef = (el, itemId) => {
    if (el) {
      items.value.set(itemId, el)
    }
  }

  const getItemRef = (id: number): HTMLDivElement | undefined => {
    return items.value.get(id)
  }

  const setSectionRef = (el) => {
    if (el) {
      section.value = el
    }
  }

  const handleKeyEvent = (e: KeyboardEvent) => {
    // console.log('keyEvent', e.code)
    switch (e.code) {
      case 'ArrowUp': {
        const data = snippetsStore.snippets.resultList
        if (data.length === 0) return
        let id = snippetsStore.snippets.selectId
        const index = data.findIndex((item) => item.id === id)
        id = data[index - 1]?.id || id
        // 如果当前焦点在输入框
        if (snippetsStore.snippets.writeFlag) {
          snippetsStore.setResultFlag(true)
          id = data[data.length - 1].id
          const itemRef = getItemRef(id)
          if (!itemRef) return
          // 滚动条滚动到指定位置
          section.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * 5)
          snippetsStore.setId(id)
          return
        }
        // 如果当前焦点在类别框
        if (snippetsStore.snippets.typeFlag) {
          snippetsStore.setWriteFlag(true)
          return
        }
        // 如果选项已经到达最上面
        if (index - 1 < 0) {
          snippetsStore.setTypeFlag(true)
          return
        }
        const itemRef = getItemRef(id)
        if (!itemRef) return
        // 滚动条滚动到指定位置
        section.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * 5)
        snippetsStore.setId(id)
        break
      }
      case 'ArrowDown': {
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
        let id = snippetsStore.snippets.selectId
        const index = data.findIndex((item) => item.id === id)
        id = data[index + 1]?.id || data[0].id
        const itemRef = getItemRef(id)
        if (!itemRef) return
        // 滚动条滚动到指定位置
        section.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * 5)
        // 向下选择时，关闭输入框的编辑模式
        snippetsStore.setWriteFlag(false)
        snippetsStore.setId(id)
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
          return
        }
        let id = snippetsStore.snippets.selectTypeId
        const index = data.findIndex((item) => item.id === id)
        id = data[index + 1]?.id || 0
        snippetsStore.setTypeId(id)
        handleSearch()
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
    setSectionRef
  }
}
