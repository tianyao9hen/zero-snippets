import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia } from 'pinia'
import NoteList from '../../renderer/src/components/content/NoteList.vue'

let noteListChangedHandler: (() => void) | null = null

const mockApi = {
  listAllNote: vi.fn(),
  editNote: vi.fn(),
  removeNote: vi.fn(),
  getAllSettings: vi.fn()
}

global.window.api = mockApi as any
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
  takeRecords: vi.fn()
})) as any

vi.mock('../../renderer/src/composables/noteEvents', () => ({
  emitNoteListChanged: vi.fn(),
  onNoteListChanged: vi.fn((handler: () => void) => {
    noteListChangedHandler = handler
    return vi.fn()
  })
}))

vi.mock('../../renderer/src/composables/iconUtils', () => ({
  iconMap: {
    add: { url: 'add.svg' }
  }
}))

describe('NoteList.vue', () => {
  const mountNoteList = () =>
    mount(NoteList, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NoteCard: {
            props: ['note'],
            emits: ['edit', 'delete'],
            template: `
              <article class="note-card">
                <h2>{{ note.name }}</h2>
                <p>{{ note.note }}</p>
                <button class="action-btn edit" @click="$emit('edit', note)">edit</button>
                <button class="action-btn delete" @click="$emit('delete', note.id)">delete</button>
              </article>
            `
          },
          NoteEditModal: {
            props: ['note'],
            emits: ['save', 'silent-save', 'cancel'],
            template: `
              <section class="edit-modal">
                <input class="title-input" :value="note.name" />
              </section>
            `
          }
        }
      }
    })

  beforeEach(() => {
    vi.clearAllMocks()
    noteListChangedHandler = null
    mockApi.listAllNote.mockResolvedValue([])
    mockApi.getAllSettings.mockResolvedValue([])
  })

  it('renders empty state when no notes', async () => {
    const wrapper = mountNoteList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('暂无随手记')
    expect(mockApi.listAllNote).toHaveBeenCalled()
  })

  it('renders notes list', async () => {
    const notes = [
      { id: 1, typeId: 4, noteType: 0, name: 'Test Note', note: 'Content', createTime: new Date().toISOString() },
      { id: 2, typeId: 4, noteType: 0, name: 'Note 2', note: 'Content 2', createTime: new Date().toISOString() }
    ]
    mockApi.listAllNote.mockResolvedValue(notes)

    const wrapper = mountNoteList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.note-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('Test Note')
  })

  it('opens edit modal on edit click', async () => {
    const notes = [
      { id: 1, typeId: 4, noteType: 0, name: 'Test Note', note: 'Content', createTime: new Date().toISOString() }
    ]
    mockApi.listAllNote.mockResolvedValue(notes)

    const wrapper = mountNoteList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    await wrapper.find('.action-btn.edit').trigger('click')
    expect(wrapper.find('.edit-modal').exists()).toBe(true)
    expect((wrapper.find('.title-input').element as HTMLInputElement).value).toBe('Test Note')
  })

  it('calls delete api on delete click', async () => {
    const notes = [
      { id: 1, typeId: 4, noteType: 0, name: 'Test Note', note: 'Content', createTime: new Date().toISOString() }
    ]
    mockApi.listAllNote.mockResolvedValue(notes)
    global.confirm = vi.fn(() => true)

    const wrapper = mountNoteList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    await wrapper.find('.action-btn.delete').trigger('click')
    expect(global.confirm).toHaveBeenCalled()
    expect(mockApi.removeNote).toHaveBeenCalledWith(1)
  })

  it('reloads notes when note list changed event is received', async () => {
    const initialNotes = [
      { id: 1, typeId: 4, noteType: 0, name: 'Old Note', note: 'old', createTime: new Date().toISOString() }
    ]
    const updatedNotes = [
      { id: 2, typeId: 4, noteType: 0, name: 'New Note', note: 'new', createTime: new Date().toISOString() },
      ...initialNotes
    ]

    mockApi.listAllNote.mockResolvedValueOnce(initialNotes).mockResolvedValueOnce(updatedNotes)

    const wrapper = mountNoteList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Old Note')

    noteListChangedHandler?.()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()
    await nextTick()

    expect(mockApi.listAllNote).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('New Note')
  })
})
