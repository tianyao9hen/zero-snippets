import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { NoteType } from '../enums'
import { emitNoteListChanged } from '@renderer/composables/noteEvents'

const DRAFT_KEY = 'quick-note-draft'

interface QuickNoteDraft {
  title: string // 草稿标题
  content: string // 草稿内容
  noteType: NoteType // 草稿类型
}

/**
 * 管理随手记输入窗口的表单状态、草稿和保存行为。
 * @returns 随手记输入窗口需要绑定的状态和操作
 */
export function useNoteInput() {
  const content = ref('')
  const title = ref('')
  const noteType = ref<NoteType>(NoteType.WORK)
  const isSaving = ref(false)
  const lastSavedTime = ref<string>('')

  const wordCount = computed(() => content.value.length)

  /**
   * 关闭随手记输入窗口。
   */
  const close = () => {
    window.api.hideWindow('note')
  }

  /**
   * 持久化当前未保存草稿。
   */
  const persistDraft = () => {
    const draft: QuickNoteDraft = {
      title: title.value,
      content: content.value,
      noteType: noteType.value
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }

  /**
   * 清理已保存的草稿。
   */
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
  }

  /**
   * 重置输入窗口表单。
   */
  const resetForm = () => {
    content.value = ''
    title.value = ''
    noteType.value = NoteType.WORK
  }

  /**
   * 保存当前随手记内容。
   * @returns 保存是否成功
   */
  const save = async () => {
    if (!content.value.trim()) return false

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
      emitNoteListChanged()
      return true
    } catch (error) {
      console.error('Save failed:', error)
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 提交随手记并在保存成功后关闭窗口。
   */
  const submit = async () => {
    if (!content.value.trim()) {
      close()
      return
    }

    const saved = await save()
    if (saved) {
      resetForm()
      clearDraft()
      close()
    }
  }

  /**
   * 同步编辑器内容变化。
   * @param val 最新的 Markdown 内容
   */
  const handleContentChange = (val: string) => {
    content.value = val
  }

  /**
   * 恢复未保存草稿。
   */
  const restoreDraft = () => {
    const rawDraft = localStorage.getItem(DRAFT_KEY)
    if (!rawDraft) {
      resetForm()
      return
    }

    try {
      const draft = JSON.parse(rawDraft) as Partial<QuickNoteDraft>
      title.value = draft.title || ''
      content.value = draft.content || ''
      noteType.value = draft.noteType ?? NoteType.WORK
    } catch {
      title.value = ''
      content.value = rawDraft
      noteType.value = NoteType.WORK
    }
  }

  /**
   * 处理输入窗口快捷键。
   * @param e 键盘事件
   */
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      e.stopPropagation()
      submit()
    }
  }

  onMounted(() => {
    restoreDraft()
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  watch([title, content, noteType], persistDraft, { flush: 'sync' })

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
