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
        <div class="secret-input-wrap">
          <input
            v-model="accessKeySecret"
            :type="showAccessKeySecret ? 'text' : 'password'"
            class="setting-input secret-input"
            placeholder="Secret..."
            @change="
              saveSetting(SettingKey.OSS_ACCESS_KEY_SECRET, accessKeySecret, 'OSS AccessKey Secret')
            "
          />
          <button
            type="button"
            class="secret-toggle"
            :aria-label="showAccessKeySecret ? '隐藏 AccessKey Secret' : '显示 AccessKey Secret'"
            data-test="toggle-access-key-secret"
            @click="toggleAccessKeySecretVisibility"
          >
            <svg
              v-if="showAccessKeySecret"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a12.36 12.36 0 0 1 3.06-4.54"></path>
              <path d="M9.9 4.24A10.77 10.77 0 0 1 12 4c5 0 9.27 3.11 11 8a12.43 12.43 0 0 1-1.62 2.74"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"></path>
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>
      <div class="setting-item">
        <label class="setting-label">存储目录前缀（可选）</label>
        <input
          v-model="pathPrefix"
          type="text"
          class="setting-input"
          placeholder="例如: zero-snippets/images 或 images"
          @change="saveSetting(SettingKey.OSS_PATH_PREFIX, pathPrefix, 'OSS 存储目录前缀')"
        />
        <span class="text-slate-500 text-xs mt-1"
          >留空则使用默认路径，填写后所有图片将保存在该目录下</span
        >
      </div>
      <div v-if="saveError" class="text-red-500 text-sm mt-2">
        {{ saveError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { SettingKey } from '@renderer/enums'
import { useSettingStore } from '@renderer/store/settingStore'

const settingStore = useSettingStore()

const region = ref('')
const bucket = ref('')
const accessKeyId = ref('')
const accessKeySecret = ref('')
const pathPrefix = ref('')
const saveError = ref('')
const showAccessKeySecret = ref(false)

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
  pathPrefix.value = settingStore.getSetting(SettingKey.OSS_PATH_PREFIX) || ''
}

/**
 * 切换 AccessKey Secret 输入框明文显示状态。
 */
function toggleAccessKeySecretVisibility() {
  showAccessKeySecret.value = !showAccessKeySecret.value
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

.secret-input-wrap {
  @apply flex w-full max-w-md;
}

.secret-input {
  @apply flex-1 rounded-r-none min-w-0;
}

.secret-toggle {
  @apply w-10 flex-shrink-0 border border-l-0 border-slate-300 rounded-r text-slate-500 bg-slate-50;
  @apply inline-flex items-center justify-center hover:bg-slate-100 hover:text-slate-800;
  @apply focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}
</style>
