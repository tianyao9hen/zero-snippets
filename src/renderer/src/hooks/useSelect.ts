import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { onMounted, onUnmounted, ref } from 'vue'
import useSearch from './useSearch'

/**
 * @description 选择类型、结果、输入框的事件处理
 * @param enableKeyboard 是否启用键盘事件监听，默认为 true
 */
export default (enableKeyboard = true) => {
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

  /**
   * 处理命令类型结果的回车行为：
   * 1. 统一执行项：如果当前已有允许统一执行的命令在运行，则执行统一中止；否则执行统一执行并打开日志窗口。
   * 2. 单条命令项：如果该命令当前正在运行，则中止命令；否则执行命令并打开日志窗口。
   */
  const handleCommandEnter = async (selectedItem: ContentEntity) => {
    try {
      const runningList = await window.api.getRunningCommands()

      if (selectedItem.uniqueId === 'command-unified') {
        const hasUnifiedRunning = runningList.some((item) => item.allowUnified && !item.exited)

        if (hasUnifiedRunning) {
          await window.api.stopUnifiedCommands()
        } else {
          await window.api.runUnifiedCommands()
          window.api.showWindowExclusive('commandLog', '/command-log')
        }
      } else if (selectedItem.id > 0) {
        const instance = runningList.find((item) => item.commandId === selectedItem.id)
        const isRunning = instance && !instance.exited

        if (isRunning) {
          await window.api.stopCommand(selectedItem.id)
        } else {
          await window.api.runCommand(selectedItem.id)
          window.api.showWindowExclusive('commandLog', '/command-log')
        }
      }
    } catch (error) {
      console.error('处理命令执行/中止失败:', error)
    }
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
        const data = snippetsStore.snippets.resultList
        const uniqueId = snippetsStore.snippets.selectId
        const selectedItem = data.find((item) => item.uniqueId === uniqueId)
        if (selectedItem) {
          if (selectedItem.typeId === 1) {
            // 文章类型，打开 content 窗口
            const path = `/content/1/category/${selectedItem.categoryId}/catelog/${selectedItem.id}/article`
            window.api.showWindowExclusive('content', path)
          } else if (selectedItem.typeId === 2) {
            // 网页类型，判断是否有参数URL
            const search = snippetsStore.snippets.search.trim()
            // 如果存在参数且选中项有 paramUrl
            if (search.includes(' ') && selectedItem.paramUrl) {
              // 提取参数（第一个空格后的所有内容）
              const params = search.substring(search.indexOf(' ') + 1).trim()
              if (params) {
                // 替换 {} 占位符
                let targetUrl = selectedItem.paramUrl
                const paramParts = params.split(/\s+/) // 多个参数使用空格分割，支持多个空格

                // 查找所有 {} 占位符
                let paramIndex = 0
                targetUrl = targetUrl.replace(/\{.*?\}/g, () => {
                  const val = paramParts[paramIndex] || ''
                  paramIndex++
                  return val
                })
                window.api.openExternal(targetUrl)
                window.api.hideWindow('search')
                return
              }
            }

            // 默认打开普通 URL
            if (selectedItem.url) {
              window.api.openExternal(selectedItem.url)
              window.api.hideWindow('search')
            }
          } else if (selectedItem.typeId === 5) {
            // 命令类型：根据当前运行状态执行/中止
            void handleCommandEnter(selectedItem)
          }
        }
        break
      }
    }
  }

  onMounted(() => {
    if (enableKeyboard) {
      document.addEventListener('keydown', handleKeyEvent)
    }
  })

  onUnmounted(() => {
    if (enableKeyboard) {
      document.removeEventListener('keydown', handleKeyEvent)
    }
  })

  return {
    setItemRef,
    setSectionRef,
    selectTypeById,
    selectItemByUniqueId
  }
}
