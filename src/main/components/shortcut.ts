import { globalShortcut } from 'electron'
import { getSettingByKey } from './db/sql/settingSql'
import { getWindowByName } from './window'

/**
 * 快捷键管理模块
 * 负责注册和管理全局快捷键
 */

// 设置表中存储唤起快捷键的 key
const SHORTCUT_KEY = 'shortcut.showSnippets'

// 当前注册的快捷键
let currentAccelerator: string | null = null

/**
 * 初始化快捷键
 * 应用启动时调用，从数据库读取唤起快捷键并注册
 */
export async function initShortcut(): Promise<void> {
  try {
    const setting = await getSettingByKey(SHORTCUT_KEY)
    const accelerator = setting?.value || 'F1'
    const success = await registerShortcut(accelerator)

    if (!success) {
      console.error(`初始化快捷键失败: ${accelerator}`)
    } else {
      console.log(`快捷键已初始化: ${accelerator}`)
    }
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
    console.log(`已注销旧快捷键: ${currentAccelerator}`)
  }

  // 注册新快捷键
  const success = globalShortcut.register(accelerator, () => {
    toggleSearchWindow()
  })

  if (success) {
    currentAccelerator = accelerator
    console.log(`快捷键已注册: ${accelerator}`)
  } else {
    console.error(`快捷键注册失败: ${accelerator}`)
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
      console.log('搜索窗口已隐藏')
    } else {
      win.show()
      win.focus()
      console.log('搜索窗口已显示')
    }
  } catch (error) {
    console.error('切换搜索窗口失败:', error)
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
      const success = await registerShortcut(setting.value)
      if (!success) {
        throw new Error(`快捷键 "${setting.value}" 注册失败，可能已被系统或其他应用占用`)
      }
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
  console.log('所有快捷键已注销')
}
