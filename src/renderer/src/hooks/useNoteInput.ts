import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
// import { debounce } from '../composables/debounceUtils'
import { NoteType } from '../enums'

export function useNoteInput() {
  const content = ref('')
  const title = ref('') // 新增标题 ref
  const noteType = ref<NoteType>(NoteType.WORK)
  const isSaving = ref(false)
  const lastSavedTime = ref<string>('')

  // 字数统计
  const wordCount = computed(() => {
    return content.value.length
  })

  /**
   * 关闭窗口
   */
  const close = () => {
    window.api.hideWindow('note')
  }

  /**
   * 保存笔记
   */
  const save = async () => {
    if (!content.value.trim()) return

    isSaving.value = true
    const note = {
      name: title.value || new Date().toLocaleString(),
      note: content.value,
      typeId: 4,
      noteType: noteType.value
    }

    try {
      await window.api.addNote(note)
      lastSavedTime.value = new Date().toLocaleTimeString()
      // 注意：这里我们不再清空内容和关闭窗口，而是作为“保存草稿”或“提交”的行为
      // 如果是快捷键提交（Ctrl+Enter），通常期望关闭窗口。
      // 如果是自动保存，则不关闭。
      // 这里我们区分一下：save() 方法仅做保存。
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 提交并关闭 (用于 Ctrl+Enter 或点击保存按钮)
   */
  const submit = async () => {
    if (!content.value.trim()) {
      close()
      return
    }
    await save()
    content.value = ''
    close()
  }

  /**
   * 自动保存 (防抖)
   */
  // const autoSave = debounce(async () => {
  //   if (content.value.trim()) {
  //     await save()
  //   }
  // }, 2000)

  /**
   * 处理内容变更
   */
  const handleContentChange = (val: string) => {
    content.value = val
    // 触发自动保存
    // autoSave() // 暂时禁用自动保存新增记录，因为每次 addNote 都会新增一条。
    // 对于随手记，通常是“写完保存关闭”。如果需要自动保存草稿，需要更复杂的逻辑（更新同一条草稿）。
    // 根据需求 "NoteInput 需支持实时保存草稿"，这里简化为：暂存到 localStorage 或者 既然是 addNote，那就不自动 add，而是 wait for submit.
    // 但需求说 "支持实时保存草稿"，可能是指不会丢。
    // 鉴于 NoteInput 是 "随手记输入窗口"，通常是暂态的。
    // 我们先实现手动保存/提交。如果需求强烈暗示“草稿”，我们可以存 localStorage。
    localStorage.setItem('quick-note-draft', val)
  }

  /**
   * 恢复草稿
   */
  const restoreDraft = () => {
    const draft = localStorage.getItem('quick-note-draft')
    if (draft) {
      content.value = draft
    }
  }

  /**
   * 键盘事件
   */
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close()
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      submit()
      localStorage.removeItem('quick-note-draft')
    }
  }

  onMounted(() => {
    restoreDraft()
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    content,
    title,
    noteType,
    isSaving,
    lastSavedTime,
    wordCount,
    handleContentChange,
    submit,
    close
  }
}
