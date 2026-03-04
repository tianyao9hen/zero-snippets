<template>
  <div class="command-settings bg-white rounded-lg">
    <header class="px-4 py-3 border-b border-slate-200">
      <h2 class="settings-title">命令行</h2>
      <p class="settings-subtitle">配置命令行模块的统一执行快捷键等通用选项。</p>
    </header>
    <div class="p-4 flex flex-col gap-4">
      <div class="setting-item">
        <label class="setting-label">统一执行快捷键</label>
        <input
          v-model="unifiedShortcut"
          class="text-input"
          placeholder="例如：cmdall"
          @blur="saveUnifiedShortcut"
        />
        <p class="setting-desc">
          说明：在 Snippets 搜索窗口中输入该字符串，将在搜索结果中出现“统一执行”项，回车即可一次性执行所有勾选“允许统一执行”的命令。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @description 命令行相关设置页面
 * 主要用于配置统一执行快捷键，与命令行模块顶部展示保持一致。
 */
import { ref, onMounted } from 'vue'
import { useSettingStore } from '@renderer/store/settingStore'
import { message } from 'ant-design-vue'

const settingStore = useSettingStore()
const unifiedShortcut = ref('')
const UNIFIED_SHORTCUT_KEY = 'command.unifiedShortcut'

onMounted(async () => {
  if (!settingStore.isLoaded) {
    await settingStore.loadSettings()
  }
  unifiedShortcut.value = settingStore.getSettingWithDefault(UNIFIED_SHORTCUT_KEY, 'cmdall')
})

const saveUnifiedShortcut = async () => {
  const value = unifiedShortcut.value.trim()
  if (!value) {
    message.warning('统一执行快捷键不能为空')
    return
  }
  try {
    await settingStore.setSetting(UNIFIED_SHORTCUT_KEY, value, '命令行统一执行快捷键')
    message.success('统一执行快捷键已保存')
  } catch (error) {
    console.error('保存统一执行快捷键失败:', error)
    message.error('保存统一执行快捷键失败')
  }
}
</script>

<style scoped>
.command-settings {
  @apply flex flex-col;
}

.settings-title {
  @apply text-lg font-medium text-slate-700;
}

.settings-subtitle {
  @apply text-xs text-slate-500 mt-1;
}

.setting-item {
  @apply flex flex-col gap-2;
}

.setting-label {
  @apply text-sm text-slate-600;
}

.text-input {
  @apply px-3 py-2 border border-slate-300 rounded text-sm w-60;
}

.setting-desc {
  @apply text-xs text-slate-500;
}
</style>
