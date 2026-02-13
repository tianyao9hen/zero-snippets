import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 设置 Store
 * 管理应用的所有配置设置
 */
export const useSettingStore = defineStore('setting', () => {
  // State
  const settings = ref<Map<string, string>>(new Map())
  const isLoaded = ref(false)

  /**
   * 加载所有设置
   * 应用启动时调用，从数据库加载所有设置到内存
   */
  async function loadSettings(): Promise<void> {
    try {
      const allSettings = await window.api.getAllSettings()
      settings.value.clear()
      for (const setting of allSettings) {
        settings.value.set(setting.key, setting.value)
      }
      isLoaded.value = true
    } catch (error) {
      console.error('加载设置失败:', error)
      throw error
    }
  }

  /**
   * 设置值
   * 同时更新数据库和本地状态
   * @param key 设置键
   * @param value 设置值
   * @param remark 设置描述
   */
  async function setSetting(key: string, value: string, remark?: string): Promise<void> {
    try {
      // 先更新数据库
      await window.api.setSetting(key, value, remark)
      // 再更新本地状态
      settings.value.set(key, value)
    } catch (error) {
      console.error(`设置 ${key} 失败:`, error)
      throw error
    }
  }

  /**
   * 获取设置值
   * @param key 设置键
   * @returns 设置值或 undefined
   */
  function getSetting(key: string): string | undefined {
    return settings.value.get(key)
  }

  /**
   * 获取设置值（带默认值）
   * @param key 设置键
   * @param defaultValue 默认值
   * @returns 设置值或默认值
   */
  function getSettingWithDefault(key: string, defaultValue: string): string {
    return settings.value.get(key) ?? defaultValue
  }

  return {
    settings,
    isLoaded,
    loadSettings,
    setSetting,
    getSetting,
    getSettingWithDefault
  }
})
