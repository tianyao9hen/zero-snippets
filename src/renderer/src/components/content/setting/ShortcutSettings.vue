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
          :class="{ 'is-recording': isRecording, 'is-error': hasError }"
          :placeholder="isRecording ? '按下快捷键...' : '点击设置快捷键'"
          readonly
          @focus="startRecording"
          @blur="stopRecording"
          @keydown.prevent="handleKeyDown"
        />
        <span v-if="hasError" class="error-hint">无效快捷键</span>
      </div>

      <div class="setting-item">
        <label class="setting-label">随手记快捷键</label>
        <input
          v-model="noteShortcutValue"
          class="shortcut-input"
          :class="{ 'is-recording': isRecordingNote, 'is-error': hasErrorNote }"
          :placeholder="isRecordingNote ? '按下快捷键...' : '点击设置快捷键'"
          readonly
          @focus="startRecordingNote"
          @blur="stopRecordingNote"
          @keydown.prevent="handleKeyDownNote"
        />
        <span v-if="hasErrorNote" class="error-hint">无效快捷键</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingStore } from '@renderer/store/settingStore'

const settingStore = useSettingStore()
import { SettingKey } from '@renderer/enums/index'



const shortcutValue = ref('')
const isRecording = ref(false)
const hasError = ref(false)

const noteShortcutValue = ref('')
const isRecordingNote = ref(false)
const hasErrorNote = ref(false)

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

onMounted(async () => {
  await settingStore.loadSettings()
  const savedValue = settingStore.getSetting(SettingKey.SHORTCUT_KEY)
  shortcutValue.value = savedValue || 'F1'

  const savedNoteValue = settingStore.getSetting(SettingKey.SHORTCUT_NOTE_KEY)
  noteShortcutValue.value = savedNoteValue || 'F2'
})

function startRecording() {
  isRecording.value = true
  hasError.value = false
}

function stopRecording() {
  isRecording.value = false
}

function startRecordingNote() {
  isRecordingNote.value = true
  hasErrorNote.value = false
}

function stopRecordingNote() {
  isRecordingNote.value = false
}

function parseKeyEvent(event: KeyboardEvent): { key: string; error: boolean } {
  const keys: string[] = []

  if (event.ctrlKey) keys.push('Ctrl')
  if (event.shiftKey) keys.push('Shift')
  if (event.altKey) keys.push('Alt')

  const key = event.key

  if (FORBIDDEN_KEYS.includes(key)) {
    return { key: '', error: true }
  }

  if (MODIFIER_KEYS.includes(key)) {
    return { key: '', error: false } // Just modifier pressed
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

async function handleKeyDown(event: KeyboardEvent) {
  event.preventDefault()
  const result = parseKeyEvent(event)

  if (result.error) {
    hasError.value = true
    return
  }
  if (!result.key) return

  shortcutValue.value = result.key
  isRecording.value = false
  hasError.value = false
  await saveShortcut(result.key)
}

async function handleKeyDownNote(event: KeyboardEvent) {
  event.preventDefault()
  const result = parseKeyEvent(event)

  if (result.error) {
    hasErrorNote.value = true
    return
  }
  if (!result.key) return

  noteShortcutValue.value = result.key
  isRecordingNote.value = false
  hasErrorNote.value = false
  await saveNoteShortcut(result.key)
}

async function saveShortcut(value: string) {
  try {
    await settingStore.setSetting(SettingKey.SHORTCUT_KEY, value, '唤起快捷键')
    await window.api.reloadShortcut()
  } catch (error) {
    hasError.value = true
    console.error('保存快捷键失败:', error)
  }
}

async function saveNoteShortcut(value: string) {
  try {
    await settingStore.setSetting(SettingKey.SHORTCUT_NOTE_KEY, value, '随手记快捷键')
    await window.api.reloadShortcut()
  } catch (error) {
    hasErrorNote.value = true
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
