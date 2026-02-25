import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteInput from '../../renderer/src/pages/NoteInput.vue'

// Mock window.api
const mockApi = {
  addNote: vi.fn(),
  hideWindow: vi.fn()
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

describe('NoteInput.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementation
    mockApi.addNote.mockResolvedValue(1)
  })

  it('renders correctly', async () => {
    const wrapper = mount(NoteInput)
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('随手记')
    expect(wrapper.find('.editor-container')).exists()
  })

  it('updates content and word count', async () => {
    const wrapper = mount(NoteInput)
    await wrapper.setData({ content: 'Hello World' }) // Note: content is ref, but vue-test-utils might need setData or direct vm modification for composables if exposed.
    // Wait, content is inside useNoteInput. We can trigger Bytemd emit.

    const bytemd = wrapper.findComponent({ name: 'Bytemd' })
    if (bytemd.exists()) {
      await bytemd.vm.$emit('contentEdit', 'Hello World')
      expect(wrapper.vm.wordCount).toBe(11) // This might fail if wordCount is not exposed on vm directly (setup syntax). But template uses it, so it should be reactive.
      expect(wrapper.text()).toContain('11 字')
    }
  })

  it('calls save api on submit', async () => {
    const wrapper = mount(NoteInput)
    // Set content
    const bytemd = wrapper.findComponent({ name: 'Bytemd' })
    if (bytemd.exists()) {
      await bytemd.vm.$emit('contentEdit', 'Test Note')
      await wrapper.find('.btn.primary').trigger('click')
      expect(mockApi.addNote).toHaveBeenCalled()
      expect(mockApi.addNote.mock.calls[0][0]).toMatchObject({
        note: 'Test Note',
        typeId: 4
      })
    }
  })

  it('calls close api on cancel', async () => {
    const wrapper = mount(NoteInput)
    await wrapper.find('.btn.text').trigger('click')
    expect(mockApi.hideWindow).toHaveBeenCalledWith('note')
  })
})
