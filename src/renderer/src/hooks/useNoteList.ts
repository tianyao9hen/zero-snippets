import { ref, onMounted, onBeforeUnmount } from 'vue'
import { onNoteListChanged } from '@renderer/composables/noteEvents'

export function useNoteList() {
  // allNotes 保存后端返回的完整列表，notes 只负责当前页面真正渲染的那一批。
  const allNotes = ref<NoteEntity[]>([])
  const notes = ref<NoteEntity[]>([])
  const loading = ref(false)
  const editingNote = ref<NoteEntity | null>(null)

  // 分页状态只针对当前展示源生效，避免搜索过滤后还沿用旧分页切片。
  const page = ref(1)
  const pageSize = 20
  const hasMore = ref(true)
  const displayNotes = ref<NoteEntity[]>([])
  const sourceNotes = ref<NoteEntity[]>([])
  let stopListeningNoteListChanged: (() => void) | null = null

  /**
   * 重置当前展示源。
   * 这里接收的是“过滤后的完整结果”，不是当前页面上的可见批次。
   *
   * @param nextNotes 过滤后的完整数据
   */
  const resetDisplaySource = (nextNotes: NoteEntity[]) => {
    sourceNotes.value = nextNotes
    page.value = 1
    displayNotes.value = []
    hasMore.value = true
    loadMore()
  }

  /**
   * 加载更多。
   * 每次都从 sourceNotes 里切下一段，保证滚动加载跟随当前筛选结果。
   */
  const loadMore = () => {
    if (!hasMore.value) return
    const start = (page.value - 1) * pageSize
    const end = page.value * pageSize
    const nextBatch = sourceNotes.value.slice(start, end)

    if (nextBatch.length > 0) {
      displayNotes.value.push(...nextBatch)
      page.value++
    }

    if (displayNotes.value.length >= sourceNotes.value.length) {
      hasMore.value = false
    }
  }

  /**
   * 加载笔记列表。
   * 同步更新完整列表和当前展示源，初始渲染与后续筛选共用这一入口。
   */
  const loadNotes = async () => {
    loading.value = true
    try {
      allNotes.value = await window.api.listAllNote()
      notes.value = allNotes.value
      resetDisplaySource(allNotes.value)
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 格式化时间
   */
  const formatTime = (time: string) => {
    if (!time) return ''
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * 编辑笔记
   */
  const editNote = (note: NoteEntity) => {
    editingNote.value = JSON.parse(JSON.stringify(note))
  }

  /**
   * 保存编辑（由弹层在保存时传入当前笔记数据，避免实时双向同步导致的重渲染与焦点问题）
   */
  const saveEdit = async (noteToSave: NoteEntity) => {
    if (!noteToSave) return
    try {
      const plain = JSON.parse(JSON.stringify(noteToSave))
      await window.api.editNote(plain)
      editingNote.value = null
      await loadNotes()
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 静默保存（不关闭弹层，用于类型切换等即时持久化场景）
   */
  const silentSave = async (noteToSave: NoteEntity) => {
    if (!noteToSave) return
    try {
      const plain = JSON.parse(JSON.stringify(noteToSave))
      await window.api.editNote(plain)
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 取消编辑
   */
  const cancelEdit = () => {
    editingNote.value = null
  }

  /**
   * 删除笔记
   */
  const deleteNote = async (id: number) => {
    if (confirm('确认删除该笔记吗？')) {
      await window.api.removeNote(id)
      await loadNotes()
    }
  }

  onMounted(() => {
    loadNotes()
    stopListeningNoteListChanged = onNoteListChanged(loadNotes)
  })

  onBeforeUnmount(() => {
    stopListeningNoteListChanged?.()
  })

  return {
    allNotes,
    notes: displayNotes, // 对外只暴露当前可见批次
    total: allNotes,
    loading,
    editingNote,
    hasMore,
    loadMore,
    resetDisplaySource,
    loadNotes,
    formatTime,
    editNote,
    saveEdit,
    silentSave,
    cancelEdit,
    deleteNote
  }
}
