import { describe, expect, it } from 'vitest'
import { parseShortcutKeyEvent } from '../renderer/src/hooks/useShortcutRecorder'

/**
 * 构造最小 KeyboardEvent 替身，避免测试依赖浏览器真实事件。
 * @param init 需要覆盖的键盘事件字段
 * @returns KeyboardEvent 测试替身
 */
function keyEvent(init: Partial<KeyboardEvent>): KeyboardEvent {
  return {
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    key: '',
    preventDefault: () => undefined,
    ...init
  } as KeyboardEvent
}

describe('parseShortcutKeyEvent', () => {
  it('accepts function keys without modifiers', () => {
    expect(parseShortcutKeyEvent(keyEvent({ key: 'F3' }))).toEqual({ key: 'F3', error: false })
  })

  it('accepts modified letter shortcuts', () => {
    expect(parseShortcutKeyEvent(keyEvent({ key: 'w', ctrlKey: true, shiftKey: true }))).toEqual({
      key: 'Ctrl+Shift+W',
      error: false
    })
  })

  it('ignores modifier-only keydown', () => {
    expect(parseShortcutKeyEvent(keyEvent({ key: 'Control', ctrlKey: true }))).toEqual({
      key: '',
      error: false
    })
  })

  it('rejects forbidden keys', () => {
    expect(parseShortcutKeyEvent(keyEvent({ key: 'Escape' }))).toEqual({ key: '', error: true })
  })
})
