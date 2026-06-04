<template>
  <div class="shortcut-settings bg-white rounded-lg">
    <header class="px-4 py-3 border-b border-slate-200">
      <h2 class="settings-title">快捷键</h2>
    </header>
    <div class="p-4 flex flex-col gap-6">
      <div class="setting-item">
        <label class="setting-label">唤起快捷键</label>
        <input
          v-model="shortcutValue"
          class="shortcut-input"
          :class="{ 'is-recording': snippetsIsRecording, 'is-error': snippetsHasError }"
          :placeholder="snippetsIsRecording ? '按下快捷键...' : '点击设置快捷键'"
          readonly
          @focus="snippetsRecorder.startRecording"
          @blur="snippetsRecorder.stopRecording"
          @keydown.prevent="snippetsRecorder.handleKeyDown"
        />
        <span v-if="snippetsHasError" class="error-hint">无效快捷键</span>
      </div>

      <div class="setting-item">
        <label class="setting-label">随手记快捷键</label>
        <input
          v-model="noteShortcutValue"
          class="shortcut-input"
          :class="{ 'is-recording': noteIsRecording, 'is-error': noteHasError }"
          :placeholder="noteIsRecording ? '按下快捷键...' : '点击设置快捷键'"
          readonly
          @focus="noteRecorder.startRecording"
          @blur="noteRecorder.stopRecording"
          @keydown.prevent="noteRecorder.handleKeyDown"
        />
        <span v-if="noteHasError" class="error-hint">无效快捷键</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingStore } from '@renderer/store/settingStore'
import { useShortcutRecorder } from '@renderer/hooks/useShortcutRecorder'

const settingStore = useSettingStore()
import { SettingKey } from '@renderer/enums/index'



const shortcutValue = ref('')
const noteShortcutValue = ref('')

const snippetsRecorder = useShortcutRecorder(async (value) => {
  shortcutValue.value = value
  await saveShortcut(value)
})
const snippetsIsRecording = snippetsRecorder.isRecording
const snippetsHasError = snippetsRecorder.hasError

const noteRecorder = useShortcutRecorder(async (value) => {
  noteShortcutValue.value = value
  await saveNoteShortcut(value)
})
const noteIsRecording = noteRecorder.isRecording
const noteHasError = noteRecorder.hasError

onMounted(async () => {
  await settingStore.loadSettings()
  const savedValue = settingStore.getSetting(SettingKey.SHORTCUT_KEY)
  shortcutValue.value = savedValue || 'F1'

  const savedNoteValue = settingStore.getSetting(SettingKey.SHORTCUT_NOTE_KEY)
  noteShortcutValue.value = savedNoteValue || 'F2'
})

async function saveShortcut(value: string) {
  try {
    await settingStore.setSetting(SettingKey.SHORTCUT_KEY, value, '唤起快捷键')
    await window.api.reloadShortcut()
  } catch (error) {
    snippetsHasError.value = true
    console.error('保存快捷键失败:', error)
  }
}

async function saveNoteShortcut(value: string) {
  try {
    await settingStore.setSetting(SettingKey.SHORTCUT_NOTE_KEY, value, '随手记快捷键')
    await window.api.reloadShortcut()
  } catch (error) {
    noteHasError.value = true
    console.error('保存随手记快捷键失败:', error)
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
