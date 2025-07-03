import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { onMounted, onUnmounted, ref } from 'vue'

export default () => {
  const snippetsStore = useSnippetsStore()

  const section = ref<HTMLDivElement>()
  const items = ref<HTMLDivElement[]>([])

  const setItemRef = (el) => {
    if (el) {
      items.value.push(el)
    }
  }

  const getItemRef = (id: number): HTMLDivElement | undefined => {
    return items.value.find((item) => item.tabIndex === id)
  }

  const setSectionRef = (el) => {
    if (el) {
      section.value = el
    }
  }

  const handleKeyEvent = (e: KeyboardEvent) => {
    console.log('keyEvent', e.code)
    switch (e.code) {
      case 'ArrowUp': {
        const data = snippetsStore.snippets.result
        if (data.length === 0) return
        let id = snippetsStore.snippets.selectId
        const index = data.findIndex((item) => item.id === id)
        id = data[index - 1]?.id || id
        if(index-1 < 0){
          // 选项已经到达最上面，则将输入框置为可编辑状态，进入输入模式
          snippetsStore.snippets.writeFlag = true
          return
        }
        const itemRef = getItemRef(id)
        if (!itemRef) return
        // 滚动条滚动到指定位置
        section.value?.scrollTo(0, itemRef.offsetTop - 200)
        snippetsStore.setId(id)
        break
      }
      case 'ArrowDown': {
        const data = snippetsStore.snippets.result
        if (data.length === 0) return
        let id = snippetsStore.snippets.selectId
        const index = data.findIndex((item) => item.id === id)
        id = data[index + 1]?.id || data[0].id
        const itemRef = getItemRef(id)
        if (!itemRef) return
        // 滚动条滚动到指定位置
        section.value?.scrollTo(0, itemRef.offsetTop - 200)
        // 向下选择时，关闭输入框的编辑模式
        snippetsStore.snippets.writeFlag = false
        snippetsStore.setId(id)
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
