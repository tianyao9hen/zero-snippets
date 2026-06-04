import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteInput from '../../renderer/src/pages/NoteInput.vue'
import { emitNoteListChanged } from '../../renderer/src/composables/noteEvents'

vi.mock('../../renderer/src/composables/noteEvents', () => ({
  emitNoteListChanged: vi.fn()
}))

const mockApi = {
  addNote: vi.fn(),
  hideWindow: vi.fn()
}

global.window.api = mockApi as any

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('NoteInput.vue', () => {
  const mountNoteInput = () =>
    mount(NoteInput, {
      global: {
        stubs: {
          NoteTypeSwitch: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<button class="note-type-switch" @click="$emit(`update:modelValue`, 2)">type</button>'
          },
          NoteEditor: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
              '<textarea class="note-editor-stub" :value="modelValue" @input="$emit(`update:modelValue`, $event.target.value)" />'
          }
        }
      }
    })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockApi.addNote.mockResolvedValue(1)
  })

  it('renders correctly', async () => {
    const wrapper = mountNoteInput()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.title-input').exists()).toBe(true)
    expect(wrapper.find('.note-editor-stub').exists()).toBe(true)
  })

  it('calls save api on submit', async () => {
    const wrapper = mountNoteInput()
    await wrapper.find('.note-editor-stub').setValue('Test Note')
    await wrapper.find('.btn.primary').trigger('click')
    await flushPromises()

    expect(mockApi.addNote).toHaveBeenCalledWith(
      expect.objectContaining({
        note: 'Test Note',
        typeId: 4
      })
    )
  })

  it('calls close api on cancel', async () => {
    const wrapper = mountNoteInput()
    await wrapper.find('.btn.text').trigger('click')

    expect(mockApi.hideWindow).toHaveBeenCalledWith('note')
  })

  it('clears draft and emits note list changed after successful submit', async () => {
    localStorage.setItem(
      'quick-note-draft',
      JSON.stringify({ title: 'Draft title', content: 'Draft content', noteType: 2 })
    )

    const wrapper = mountNoteInput()
    await wrapper.find('.note-editor-stub').setValue('Saved content')
    await wrapper.find('.btn.primary').trigger('click')
    await flushPromises()

    expect(mockApi.addNote).toHaveBeenCalledWith(
      expect.objectContaining({ note: 'Saved content', typeId: 4 })
    )
    expect(localStorage.getItem('quick-note-draft')).toBeNull()
    expect(emitNoteListChanged).toHaveBeenCalledTimes(1)
  })

  it('keeps draft when closing without saving', async () => {
    const wrapper = mountNoteInput()

    await wrapper.find('.title-input').setValue('Unsubmitted title')
    await wrapper.find('.note-editor-stub').setValue('Unsubmitted content')
    await wrapper.find('.btn.text').trigger('click')

    expect(mockApi.hideWindow).toHaveBeenCalledWith('note')
    expect(JSON.parse(localStorage.getItem('quick-note-draft') || '{}')).toMatchObject({
      title: 'Unsubmitted title',
      content: 'Unsubmitted content',
      noteType: 0
    })
  })
})
