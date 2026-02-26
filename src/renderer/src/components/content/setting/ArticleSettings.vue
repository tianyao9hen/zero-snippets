<template>
  <div class="article-settings bg-white rounded-lg">
    <header class="px-4 py-3 border-b border-slate-200">
      <h2 class="settings-title">知识库配置</h2>
    </header>
    <div class="p-4 flex flex-col gap-6">
      <div class="setting-item">
        <label class="setting-label">对象存储配置(阿里云OSS):</label>
      </div>
      <div class="setting-item">
        <label class="setting-label">Region (区域)</label>
        <input
          v-model="region"
          type="text"
          class="setting-input"
          placeholder="例如: oss-cn-hangzhou"
          @change="saveSetting(SettingKey.OSS_REGION, region, 'OSS Region')"
        />
      </div>
      <div class="setting-item">
        <label class="setting-label">Bucket (存储空间名称)</label>
        <input
          v-model="bucket"
          type="text"
          class="setting-input"
          placeholder="例如: my-bucket"
          @change="saveSetting(SettingKey.OSS_BUCKET, bucket, 'OSS Bucket')"
        />
      </div>
      <div class="setting-item">
        <label class="setting-label">AccessKey ID</label>
        <input
          v-model="accessKeyId"
          type="text"
          class="setting-input"
          placeholder="LTAI..."
          @change="saveSetting(SettingKey.OSS_ACCESS_KEY_ID, accessKeyId, 'OSS AccessKey ID')"
        />
      </div>
      <div class="setting-item">
        <label class="setting-label">AccessKey Secret</label>
        <input
          v-model="accessKeySecret"
          type="password"
          class="setting-input"
          placeholder="Secret..."
          @change="
            saveSetting(SettingKey.OSS_ACCESS_KEY_SECRET, accessKeySecret, 'OSS AccessKey Secret')
          "
        />
      </div>
      <div v-if="saveError" class="text-red-500 text-sm mt-2">
        {{ saveError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingStore } from '@renderer/store/settingStore'
import { SettingKey } from '@renderer/enums'

const settingStore = useSettingStore()

const region = ref('')
const bucket = ref('')
const accessKeyId = ref('')
const accessKeySecret = ref('')
const saveError = ref('')

onMounted(async () => {
  if (!settingStore.isLoaded) {
    await settingStore.loadSettings()
  }
  loadSettings()
})

function loadSettings() {
  region.value = settingStore.getSetting(SettingKey.OSS_REGION) || ''
  bucket.value = settingStore.getSetting(SettingKey.OSS_BUCKET) || ''
  accessKeyId.value = settingStore.getSetting(SettingKey.OSS_ACCESS_KEY_ID) || ''
  accessKeySecret.value = settingStore.getSetting(SettingKey.OSS_ACCESS_KEY_SECRET) || ''
}

async function saveSetting(key: string, value: string, remark: string) {
  saveError.value = ''
  try {
    await settingStore.setSetting(key, value, remark)
  } catch (error) {
    saveError.value = `保存失败: ${(error as Error).message || '未知错误'}`
    console.error(`保存设置 ${key} 失败:`, error)
  }
}
</script>

<style scoped>
.article-settings {
  @apply flex flex-col h-full;
}

.settings-title {
  @apply text-lg font-medium text-slate-700;
}

.setting-item {
  @apply flex flex-col gap-2;
}

.setting-label {
  @apply text-sm text-slate-600 font-medium;
}

.setting-input {
  @apply px-3 py-2 border border-slate-300 rounded text-sm w-full max-w-md;
  @apply focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors;
}

.setting-input:hover {
  @apply border-slate-400;
}
</style>
