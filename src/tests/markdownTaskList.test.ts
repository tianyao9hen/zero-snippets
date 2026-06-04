import { describe, expect, it } from 'vitest'
import { toggleMarkdownTask } from '../renderer/src/composables/markdownTaskList'

describe('toggleMarkdownTask', () => {
  it('checks an unchecked unordered task item', () => {
    expect(toggleMarkdownTask('- [ ] Todo item', 0, true)).toBe('- [x] Todo item')
  })

  it('unchecks a checked unordered task item', () => {
    expect(toggleMarkdownTask('- [x] Todo item', 0, false)).toBe('- [ ] Todo item')
  })

  it('only toggles the task item at the requested index', () => {
    const source = ['- [ ] First', '- [ ] Second', '- [x] Third'].join('\n')

    expect(toggleMarkdownTask(source, 1, true)).toBe(
      ['- [ ] First', '- [x] Second', '- [x] Third'].join('\n')
    )
  })

  it('supports bullet and ordered task markers', () => {
    const source = ['* [ ] Star', '+ [ ] Plus', '1. [ ] Dot', '2) [ ] Paren'].join('\n')

    expect(toggleMarkdownTask(source, 0, true)).toContain('* [x] Star')
    expect(toggleMarkdownTask(source, 1, true)).toContain('+ [x] Plus')
    expect(toggleMarkdownTask(source, 2, true)).toContain('1. [x] Dot')
    expect(toggleMarkdownTask(source, 3, true)).toContain('2) [x] Paren')
  })

  it('leaves non-task lines unchanged', () => {
    const source = ['plain text', '- item', '- [ ] Task'].join('\n')

    expect(toggleMarkdownTask(source, 0, true)).toBe(
      ['plain text', '- item', '- [x] Task'].join('\n')
    )
  })

  it('returns the original source when the task index is out of range', () => {
    const source = '- [ ] Todo item'

    expect(toggleMarkdownTask(source, 5, true)).toBe(source)
  })
})
