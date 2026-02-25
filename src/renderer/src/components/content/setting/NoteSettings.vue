<template>
  <div class="note-settings bg-white rounded-lg">
    <header class="px-4 py-3 border-b border-slate-200">
      <h2 class="settings-title">随手记</h2>
    </header>
    <div class="p-4 flex flex-col gap-6">
      <div class="setting-item">
        <label class="setting-label">分组方式</label>
        <select
          v-model="groupingMode"
          class="setting-select"
          :class="{ 'is-error': hasError }"
          @change="handleGroupingModeChange"
        >
          <option :value="NoteGroupingMode.NONE">不分组</option>
          <option :value="NoteGroupingMode.DATE">按日期分组</option>
          <option :value="NoteGroupingMode.WEEK">按周分组</option>
        </select>
        <span v-if="hasError" class="error-hint">保存设置失败，请重试</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingStore } from '@renderer/store/settingStore'
import { SettingKey, NoteGroupingMode } from '@renderer/enums'
const settingStore = useSettingStore()

const groupingMode = ref<NoteGroupingMode>(NoteGroupingMode.DATE) // Default to DATE
const hasError = ref(false)

onMounted(async () => {
  // Ensure settings are loaded
  if (!settingStore.isLoaded) {
    await settingStore.loadSettings()
  }

  const savedValue = settingStore.getSetting(SettingKey.NOTE_GROUPING_MODE_KEY)
  if (savedValue) {
    // Try to parse number first (new format)
    const numValue = Number(savedValue)
    if (!isNaN(numValue)) {
      groupingMode.value = numValue as NoteGroupingMode
    } else {
      // Migrate legacy string values if any
      if (savedValue === 'none') groupingMode.value = NoteGroupingMode.NONE
      else if (savedValue === 'date') groupingMode.value = NoteGroupingMode.DATE
      else if (savedValue === 'week') groupingMode.value = NoteGroupingMode.WEEK
    }
  }
})

async function handleGroupingModeChange() {
  hasError.value = false
  try {
    await settingStore.setSetting(
      SettingKey.NOTE_GROUPING_MODE_KEY,
      groupingMode.value.toString(),
      '随手记分组方式'
    )
  } catch (error) {
    hasError.value = true
    console.error('保存随手记分组方式失败:', error)
  }
}
</script>

<style scoped>
.note-settings {
  @apply flex flex-col h-full;
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

.setting-select {
  @apply px-3 py-2 border border-slate-300 rounded text-sm w-48;
  @apply focus:outline-none focus:border-blue-500 bg-white;
  /* Appearance for custom arrow if needed, but default is fine for now */
}

.setting-select.is-error {
  @apply border-red-500;
}

.error-hint {
  @apply text-xs text-red-500;
}
</style>
