import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteList from '../../renderer/src/components/content/NoteList.vue'

// Mock window.api
const mockApi = {
  listAllNote: vi.fn(),
  editNote: vi.fn(),
  removeNote: vi.fn()
}

global.window.api = mockApi as any

// Mock Bytemd component since it might be heavy or fail in jsdom
vi.mock('../../renderer/src/components/content/article/Bytemd.vue', () => ({
  default: {
    template: '<div class="bytemd-mock"></div>',
    props: ['articleContent'],
    emits: ['contentEdit']
  }
}))

describe('NoteList.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementation
    mockApi.listAllNote.mockResolvedValue([])
  })

  it('renders empty state when no notes', async () => {
    const wrapper = mount(NoteList)
    // Wait for onMounted
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('暂无随手记')
    expect(mockApi.listAllNote).toHaveBeenCalled()
  })

  it('renders notes list', async () => {
    const notes = [
      { id: 1, name: 'Test Note', note: 'Content', createTime: new Date().toISOString() },
      { id: 2, name: 'Note 2', note: 'Content 2', createTime: new Date().toISOString() }
    ]
    mockApi.listAllNote.mockResolvedValue(notes)

    const wrapper = mount(NoteList)
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.note-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('Test Note')
  })

  it('opens edit modal on edit click', async () => {
    const notes = [
      { id: 1, name: 'Test Note', note: 'Content', createTime: new Date().toISOString() }
    ]
    mockApi.listAllNote.mockResolvedValue(notes)

    const wrapper = mount(NoteList)
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    await wrapper.find('.action-btn.edit').trigger('click')
    expect(wrapper.find('.edit-modal').exists()).toBe(true)
    expect(wrapper.find('.title-input').element['value']).toBe('Test Note')
  })

  it('calls delete api on delete click', async () => {
    const notes = [
      { id: 1, name: 'Test Note', note: 'Content', createTime: new Date().toISOString() }
    ]
    mockApi.listAllNote.mockResolvedValue(notes)

    // Mock confirm
    global.confirm = vi.fn(() => true)

    const wrapper = mount(NoteList)
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    await wrapper.find('.action-btn.delete').trigger('click')
    expect(global.confirm).toHaveBeenCalled()
    expect(mockApi.removeNote).toHaveBeenCalledWith(1)
  })
})
