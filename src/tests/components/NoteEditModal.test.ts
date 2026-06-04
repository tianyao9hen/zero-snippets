import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
    computed: {
      tasks() {
        return String(this.value)
          .split(/\r?\n/)
          .map((line) => line.match(/^\s*(?:[-+*]|\d+[.)])\s+\[([ xX])\]\s+(.*)$/))
          .filter(Boolean)
          .map((match) => ({
            checked: String(match[1]).toLowerCase() === 'x',
            text: match[2]
          }))
      }
    },
    template: `
      <div class="bytemd-viewer">
        <label v-for="(task, index) in tasks" :key="index" class="task-list-item">
          <input
            class="task-list-item-checkbox"
            type="checkbox"
            :checked="task.checked"
            disabled
          />
          {{ task.text }}
        </label>
        <span class="raw-markdown">{{ value }}</span>
      </div>
    `
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

  it('enables markdown task checkboxes in preview mode', async () => {
    const wrapper = mount(NoteEditModal, { props: { note: baseNote } })
    await nextTick()
    await nextTick()

    const checkbox = wrapper.find<HTMLInputElement>('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)
    expect(checkbox.element.disabled).toBe(false)
  })

  it('silently saves checked markdown tasks from preview mode', async () => {
    const wrapper = mount(NoteEditModal, { props: { note: baseNote } })
    await nextTick()
    await nextTick()

    await wrapper.find<HTMLInputElement>('input[type="checkbox"]').setValue(true)

    expect(wrapper.emitted('silentSave')?.[0][0]).toMatchObject({
      id: 1,
      note: '- [x] Todo item'
    })
  })

  it('silently saves unchecked markdown tasks from preview mode', async () => {
    const wrapper = mount(NoteEditModal, {
      props: { note: { ...baseNote, note: '- [x] Todo item' } }
    })
    await nextTick()
    await nextTick()

    await wrapper.find<HTMLInputElement>('input[type="checkbox"]').setValue(false)

    expect(wrapper.emitted('silentSave')?.[0][0]).toMatchObject({
      id: 1,
      note: '- [ ] Todo item'
    })
  })

  it('keeps edit modal above the fixed note toolbar', () => {
    const source = readFileSync(
      resolve(__dirname, '../../renderer/src/components/content/notes/NoteEditModal.vue'),
      'utf8'
    )

    expect(source).toMatch(/\.edit-modal\s*\{[\s\S]*z-index:\s*(1000[1-9]|100[1-9]\d+|10[1-9]\d{2,}|\d{6,})/)
  })
})
