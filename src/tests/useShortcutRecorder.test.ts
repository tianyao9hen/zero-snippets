import { describe, expect, it } from 'vitest'
import { parseShortcutKeyEvent } from '../renderer/src/hooks/useShortcutRecorder'

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
