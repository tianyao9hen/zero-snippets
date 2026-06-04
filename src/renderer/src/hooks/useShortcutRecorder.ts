import { ref } from 'vue'

const MODIFIER_KEYS = ['Control', 'Shift', 'Alt']
const FORBIDDEN_KEYS = [' ', 'Enter', 'Delete', 'Tab', 'Escape', 'Backspace']
const ALLOWED_FUNCTION_KEYS = [
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12'
]

export function parseShortcutKeyEvent(event: KeyboardEvent): { key: string; error: boolean } {
  const keys: string[] = []

  if (event.ctrlKey) keys.push('Ctrl')
  if (event.shiftKey) keys.push('Shift')
  if (event.altKey) keys.push('Alt')

  const key = event.key

  if (FORBIDDEN_KEYS.includes(key)) {
    return { key: '', error: true }
  }

  if (MODIFIER_KEYS.includes(key)) {
    return { key: '', error: false }
  }

  let mainKey = key
  if (key.length === 1) {
    mainKey = key.toUpperCase()
  } else if (!ALLOWED_FUNCTION_KEYS.includes(key)) {
    return { key: '', error: true }
  }

  keys.push(mainKey)

  if (
    keys.length === 1 &&
    !ALLOWED_FUNCTION_KEYS.includes(keys[0]) &&
    !/^[A-Z0-9]$/.test(keys[0])
  ) {
    return { key: '', error: true }
  }

  return { key: keys.join('+'), error: false }
}

export function useShortcutRecorder(save: (value: string) => Promise<void>) {
  const isRecording = ref(false)
  const hasError = ref(false)

  function startRecording() {
    isRecording.value = true
    hasError.value = false
  }

  function stopRecording() {
    isRecording.value = false
  }

  async function handleKeyDown(event: KeyboardEvent) {
    event.preventDefault()
    const result = parseShortcutKeyEvent(event)

    if (result.error) {
      hasError.value = true
      return ''
    }
    if (!result.key) return ''

    isRecording.value = false
    hasError.value = false
    await save(result.key)
    return result.key
  }

  return {
    isRecording,
    hasError,
    startRecording,
    stopRecording,
    handleKeyDown
  }
}
