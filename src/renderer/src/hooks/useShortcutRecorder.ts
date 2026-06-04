import { ref } from 'vue'

/**
 * @file useShortcutRecorder.ts
 * @description 快捷键录制 Hook，统一解析设置页中的全局快捷键输入。
 */

// Electron globalShortcut 支持的修饰键，这里只接收项目设置页已有的三类。
const MODIFIER_KEYS = ['Control', 'Shift', 'Alt']
// 这些按键会影响输入框焦点、提交或窗口关闭，不作为快捷键主键。
const FORBIDDEN_KEYS = [' ', 'Enter', 'Delete', 'Tab', 'Escape', 'Backspace']
// 全局快捷键允许直接使用的功能键。
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

/**
 * 解析键盘事件为 Electron globalShortcut 可识别的快捷键字符串。
 * @param event 键盘按下事件
 * @returns 解析结果，key 为空表示仍在等待主键，error 为 true 表示无效按键
 */
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

/**
 * 创建一个快捷键录制器，负责录制状态、错误状态和保存回调。
 * @param save 解析出合法快捷键后执行的保存函数
 * @returns 快捷键录制状态与事件处理函数
 */
export function useShortcutRecorder(save: (value: string) => Promise<void>) {
  const isRecording = ref(false) // 是否正在等待用户按下快捷键
  const hasError = ref(false) // 当前输入是否为无效快捷键

  /**
   * 开始录制快捷键，并清理上一次错误状态。
   */
  function startRecording() {
    isRecording.value = true
    hasError.value = false
  }

  /**
   * 停止录制快捷键。
   */
  function stopRecording() {
    isRecording.value = false
  }

  /**
   * 处理快捷键输入框的 keydown 事件。
   * @param event 键盘事件
   * @returns 成功保存的快捷键；无效或仅修饰键输入时返回空字符串
   */
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
