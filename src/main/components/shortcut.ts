import { globalShortcut } from 'electron'
import { getSettingByKey } from './db/sql/settingSql'
import { getWindowByName } from './window'

/**
 * 快捷键管理模块
 * 负责注册和管理全局快捷键
 */

// 设置表中存储唤起快捷键的 key
const SHORTCUT_KEY = 'shortcut.showSnippets'
const SHORTCUT_NOTE_KEY = 'shortcut.showNote'

// 当前注册的快捷键
let currentAccelerator: string | null = null
let currentNoteAccelerator: string | null = null

/**
 * 初始化快捷键
 * 应用启动时调用，从数据库读取唤起快捷键并注册
 */
export async function initShortcut(): Promise<void> {
  try {
    const setting = await getSettingByKey(SHORTCUT_KEY)
    const accelerator = setting?.value || 'F1'
    await registerShortcut(accelerator)

    // 初始化随手记快捷键
    const noteSetting = await getSettingByKey(SHORTCUT_NOTE_KEY)
    const noteAccelerator = noteSetting?.value || 'F2'
    await registerNoteShortcut(noteAccelerator)
  } catch (error) {
    console.error('初始化快捷键失败:', error)
  }
}

/**
 * 注册快捷键
 * @param accelerator 快捷键组合，如 "F1", "Alt+Space", "Ctrl+Shift+A"
 * @returns 是否注册成功
 */
async function registerShortcut(accelerator: string): Promise<boolean> {
  // 先注销旧快捷键
  if (currentAccelerator) {
    globalShortcut.unregister(currentAccelerator)
  }

  // 注册新快捷键
  const success = globalShortcut.register(accelerator, () => {
    toggleSearchWindow()
  })

  if (success) {
    currentAccelerator = accelerator
  } else {
    console.error(`快捷键注册失败: ${accelerator}`)
  }

  return success
}

/**
 * 注册随手记快捷键
 */
async function registerNoteShortcut(accelerator: string): Promise<boolean> {
  if (currentNoteAccelerator) {
    globalShortcut.unregister(currentNoteAccelerator)
  }

  const success = globalShortcut.register(accelerator, () => {
    toggleNoteWindow()
  })

  if (success) {
    currentNoteAccelerator = accelerator
  } else {
    console.error(`随手记快捷键注册失败: ${accelerator}`)
  }

  return success
}

/**
 * 切换搜索窗口显示/隐藏
 */
function toggleSearchWindow(): void {
  try {
    const win = getWindowByName('search')

    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  } catch (error) {
    console.error('切换搜索窗口失败:', error)
  }
}

/**
 * 切换随手记窗口显示/隐藏
 */
function toggleNoteWindow(): void {
  try {
    const win = getWindowByName('note')

    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  } catch (error) {
    console.error('切换随手记窗口失败:', error)
  }
}

/**
 * 重新加载快捷键
 * 设置变更时调用，重新从数据库读取并注册
 */
export async function reloadShortcut(): Promise<void> {
  try {
    const setting = await getSettingByKey(SHORTCUT_KEY)
    if (setting?.value) {
      await registerShortcut(setting.value)
    }

    const noteSetting = await getSettingByKey(SHORTCUT_NOTE_KEY)
    if (noteSetting?.value) {
      await registerNoteShortcut(noteSetting.value)
    } else {
      await registerNoteShortcut('F2')
    }
  } catch (error) {
    console.error('重新加载快捷键失败:', error)
    throw error
  }
}

/**
 * 获取当前生效的快捷键
 * @returns 当前快捷键或 null
 */
export function getCurrentShortcut(): string | null {
  return currentAccelerator
}

/**
 * 注销所有快捷键
 * 应用退出时调用
 */
export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll()
  currentAccelerator = null
  currentNoteAccelerator = null
}
