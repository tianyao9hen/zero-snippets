<template>
  <div class="shortcut-settings bg-white rounded-lg">
    <header class="px-4 py-3 border-b border-slate-200">
      <h2 class="settings-title">快捷键</h2>
    </header>
    <div class="p-4">
      <div class="setting-item">
        <label class="setting-label">唤起快捷键</label>
        <input
          v-model="shortcutValue"
          class="shortcut-input"
          :class="{ 'is-recording': isRecording, 'is-error': hasError }"
          :placeholder="isRecording ? '按下快捷键...' : '点击设置快捷键'"
          readonly
          @focus="startRecording"
          @blur="stopRecording"
          @keydown.prevent="handleKeyDown"
        />
        <span v-if="hasError" class="error-hint">无效快捷键</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingStore } from '../../../store/settingStore'

const settingStore = useSettingStore()
const SHORTCUT_KEY = 'shortcut.showSnippets'

const shortcutValue = ref('')
const isRecording = ref(false)
const hasError = ref(false)

const MODIFIER_KEYS = ['Control', 'Shift', 'Alt']
const FORBIDDEN_KEYS = [' ', 'Enter', 'Delete', 'Tab', 'Escape', 'Backspace']
const ALLOWED_FUNCTION_KEYS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']

onMounted(async () => {
  await settingStore.loadSettings()
  const savedValue = settingStore.getSetting(SHORTCUT_KEY)
  shortcutValue.value = savedValue || 'F1'
})

function startRecording() {
  isRecording.value = true
  hasError.value = false
}

function stopRecording() {
  isRecording.value = false
}

async function handleKeyDown(event: KeyboardEvent) {
  event.preventDefault()

  const keys: string[] = []

  if (event.ctrlKey) keys.push('Ctrl')
  if (event.shiftKey) keys.push('Shift')
  if (event.altKey) keys.push('Alt')

  const key = event.key

  if (FORBIDDEN_KEYS.includes(key)) {
    hasError.value = true
    return
  }

  if (MODIFIER_KEYS.includes(key)) {
    return
  }

  let mainKey = key
  if (key.length === 1) {
    mainKey = key.toUpperCase()
  } else if (!ALLOWED_FUNCTION_KEYS.includes(key)) {
    hasError.value = true
    return
  }

  keys.push(mainKey)

  if (keys.length === 1 && !ALLOWED_FUNCTION_KEYS.includes(keys[0]) && !/^[A-Z0-9]$/.test(keys[0])) {
    hasError.value = true
    return
  }

  const newShortcut = keys.join('+')
  shortcutValue.value = newShortcut
  isRecording.value = false
  hasError.value = false

  await saveShortcut(newShortcut)
}

async function saveShortcut(value: string) {
  try {
    await settingStore.setSetting(SHORTCUT_KEY, value, '唤起快捷键')
    await window.api.reloadShortcut()
  } catch (error) {
    hasError.value = true
    console.error('保存快捷键失败:', error)
  }
}
</script>

<style scoped>
.shortcut-settings {
  @apply flex flex-col;
}

.settings-title {
  @apply text-lg font-medium text-slate-700;
}

.setting-item {
  @apply flex flex-col gap-2;
}

.setting-label {
  @apply text-sm text-slate-600;
}

.shortcut-input {
  @apply px-3 py-2 border border-slate-300 rounded text-sm w-48;
  @apply focus:outline-none focus:border-blue-500;
}

.shortcut-input.is-recording {
  @apply border-blue-500 bg-blue-50;
}

.shortcut-input.is-error {
  @apply border-red-500;
}

.error-hint {
  @apply text-xs text-red-500;
}
</style>
