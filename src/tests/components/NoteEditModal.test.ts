import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteEditModal from '../../renderer/src/components/content/notes/NoteEditModal.vue'

vi.mock('@bytemd/vue-next', () => ({
  Editor: {
    props: ['value', 'mode'],
    emits: ['change'],
    template:
      '<textarea class="bytemd-editor" :value="value" @input="$emit(`change`, $event.target.value)" />'
  },
  Viewer: {
    props: ['value'],
    template: '<div class="bytemd-viewer">{{ value }}</div>'
  }
}))

vi.mock('@bytemd/plugin-gfm', () => ({ default: () => ({ name: 'gfm' }) }))
vi.mock('@bytemd/plugin-gemoji', () => ({ default: () => ({ name: 'gemoji' }) }))
vi.mock('@bytemd/plugin-highlight', () => ({ default: () => ({ name: 'highlight' }) }))
vi.mock('@bytemd/plugin-frontmatter', () => ({ default: () => ({ name: 'frontmatter' }) }))
vi.mock('@bytemd/plugin-breaks', () => ({ default: () => ({ name: 'breaks' }) }))
vi.mock('bytemd/locales/zh_Hans.json', () => ({ default: {} }))

const baseNote = {
  id: 1,
  typeId: 4,
  noteType: 0,
  name: 'Edit title',
  note: '- [ ] Todo item',
  createTime: '2026-06-04T00:00:00.000Z'
}

describe('NoteEditModal.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('opens in preview mode by default and toggles to edit mode', async () => {
    const wrapper = mount(NoteEditModal, { props: { note: baseNote } })

    expect(wrapper.find('.bytemd-viewer').exists()).toBe(true)
    expect(wrapper.find('.bytemd-viewer').text()).toContain('- [ ] Todo item')
    expect(wrapper.find('.bytemd-editor').exists()).toBe(false)

    await wrapper.find('.mode-toggle').trigger('click')

    expect(wrapper.find('.bytemd-editor').exists()).toBe(true)
    expect(wrapper.find('.bytemd-viewer').exists()).toBe(false)
  })

  it('keeps edit draft when closing without saving and restores it next time', async () => {
    const wrapper = mount(NoteEditModal, { props: { note: baseNote } })

    await wrapper.find('.mode-toggle').trigger('click')
    await wrapper.find('.bytemd-editor').setValue('Unsaved edit')
    await wrapper.find('.btn-close').trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('quick-note-edit-draft:1') || '{}')).toMatchObject({
      name: 'Edit title',
      note: 'Unsaved edit',
      noteType: 0
    })

    const reopened = mount(NoteEditModal, { props: { note: baseNote } })
    expect(reopened.find('.bytemd-viewer').text()).toContain('Unsaved edit')
  })

  it('clears edit draft after saving', async () => {
    localStorage.setItem(
      'quick-note-edit-draft:1',
      JSON.stringify({ name: 'Draft title', note: 'Draft note', noteType: 2 })
    )

    const wrapper = mount(NoteEditModal, { props: { note: baseNote } })
    await wrapper.find('.btn-save').trigger('click')

    expect(wrapper.emitted('save')?.[0][0]).toMatchObject({
      id: 1,
      name: 'Draft title',
      note: 'Draft note',
      noteType: 2
    })
    expect(localStorage.getItem('quick-note-edit-draft:1')).toBeNull()
  })
})
