import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteTypeSwitch from '../../renderer/src/components/content/notes/NoteTypeSwitch.vue'
import { NoteType } from '../../renderer/src/enums'

describe('NoteTypeSwitch.vue', () => {
  it('renders note types in the expected order', () => {
    const wrapper = mount(NoteTypeSwitch, {
      props: {
        modelValue: NoteType.WORK
      }
    })

    expect(wrapper.findAll('.type-btn').map((button) => button.text())).toEqual([
      '工作',
      '报表',
      '生活',
      'TODO'
    ])
  })
})
