import { ref, onMounted } from 'vue'

export function useNoteList() {
  const notes = ref<NoteEntity[]>([])
  const loading = ref(false)
  const editingNote = ref<NoteEntity | null>(null)

  // 分页相关
  const page = ref(1)
  const pageSize = 20
  const hasMore = ref(true)
  const displayNotes = ref<NoteEntity[]>([])

  /**
   * 加载更多
   */
  const loadMore = () => {
    if (!hasMore.value) return
    const start = (page.value - 1) * pageSize
    const end = page.value * pageSize
    const nextBatch = notes.value.slice(start, end)

    if (nextBatch.length > 0) {
      displayNotes.value.push(...nextBatch)
      page.value++
    }

    if (displayNotes.value.length >= notes.value.length) {
      hasMore.value = false
    }
  }

  /**
   * 加载笔记列表
   */
  const loadNotes = async () => {
    loading.value = true
    try {
      notes.value = await window.api.listAllNote()
      // 重置分页
      page.value = 1
      displayNotes.value = []
      hasMore.value = true
      loadMore()
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
   * 保存编辑
   */
  const saveEdit = async () => {
    if (!editingNote.value) return
    try {
      // Create a plain object to avoid proxy issues when sending via IPC
      const noteToSave = JSON.parse(JSON.stringify(editingNote.value))
      await window.api.editNote(noteToSave)
      editingNote.value = null
      await loadNotes()
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
  })

  return {
    notes: displayNotes, // Export displayNotes as notes
    total: notes,
    loading,
    editingNote,
    hasMore,
    loadMore,
    loadNotes,
    formatTime,
    editNote,
    saveEdit,
    cancelEdit,
    deleteNote
  }
}
