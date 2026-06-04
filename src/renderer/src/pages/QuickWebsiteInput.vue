<template>
  <div class="quick-website-container">
    <header class="quick-website-header drag">
      <div class="title-area">
        <span class="title">新增网站</span>
        <span class="path" :title="selectedFolder.path">{{ selectedFolder.path }}</span>
      </div>
      <div class="actions no-drag">
        <button class="btn primary" :disabled="isSaving" title="保存" @click="submit">
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
        <button class="btn icon" title="关闭" aria-label="关闭" @click="close">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>

    <main class="quick-website-body no-drag">
      <aside class="folder-panel">
        <div class="panel-title">选择目录</div>
        <div v-if="isLoading" class="empty">加载中...</div>
        <template v-else>
          <button
            v-for="folder in folderOptions"
            :key="folder.id"
            class="folder-item"
            :class="{ active: selectedParentId === folder.id }"
            :style="{ paddingLeft: `${12 + folder.level * 14}px` }"
            :title="folder.path"
            @click="selectedParentId = folder.id"
          >
            <span class="folder-name">{{ folder.title }}</span>
          </button>
        </template>
      </aside>

      <section class="form-panel">
        <label class="field">
          <span>名称</span>
          <input
            v-model="form.title"
            type="text"
            placeholder="网站名称"
            @keydown.enter.prevent="submit"
          />
        </label>

        <label class="field">
          <span>网址</span>
          <input
            ref="urlInputRef"
            v-model="form.url"
            type="text"
            placeholder="example.com 或 https://example.com"
            @blur="handleUrlBlur"
            @keydown.enter.prevent="submit"
          />
        </label>

        <div class="favicon-row">
          <div class="favicon-preview">
            <img
              v-if="faviconStatus === FaviconFetchStatus.SUCCESS && form.icon"
              :src="form.icon"
              alt="网站图标"
              @error="handleFaviconError"
            />
            <div v-else-if="faviconStatus === FaviconFetchStatus.LOADING" class="spinner" />
            <svg
              v-else
              viewBox="0 0 24 24"
              width="22"
              height="22"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 0 20"></path>
              <path d="M12 2a15.3 15.3 0 0 0 0 20"></path>
            </svg>
          </div>
          <div class="favicon-meta">
            <span>{{ faviconText }}</span>
            <button
              v-if="form.url && faviconStatus !== FaviconFetchStatus.LOADING"
              type="button"
              class="link-button"
              @click="fetchFaviconManual"
            >
              {{ faviconStatus === FaviconFetchStatus.SUCCESS ? '重新获取' : '获取图标' }}
            </button>
          </div>
        </div>

        <label class="field">
          <span>快捷键</span>
          <input
            v-model="form.shortcut"
            type="text"
            placeholder="例如 gh"
            @keydown.enter.prevent="submit"
          />
        </label>

        <label class="field">
          <span>参数 URL</span>
          <input v-model="form.paramUrl" type="text" placeholder="https://www.bing.com/search?q={}" />
        </label>

        <label class="field">
          <span>描述</span>
          <textarea v-model="form.description" rows="4" placeholder="可选：输入描述信息" />
        </label>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuickWebsiteInput } from '@renderer/hooks/useQuickWebsiteInput'
import { processUrl } from '@renderer/composables/urlUtils'
import { readClipboardText, isValidUrlForClipboard } from '@renderer/composables/clipboardUtils'
import {
  createDebouncedFaviconFetcher,
  FaviconFetchStatus
} from '@renderer/composables/faviconUtils'

const urlInputRef = ref<HTMLInputElement>()
const faviconStatus = ref<FaviconFetchStatus>(FaviconFetchStatus.IDLE)
const faviconError = ref('')

const {
  folderOptions,
  selectedParentId,
  selectedFolder,
  form,
  isLoading,
  isSaving,
  loadTree,
  submit,
  close
} = useQuickWebsiteInput()

const faviconText = computed(() => {
  if (faviconStatus.value === FaviconFetchStatus.SUCCESS) return '图标获取成功'
  if (faviconStatus.value === FaviconFetchStatus.LOADING) return '正在获取图标...'
  if (faviconStatus.value === FaviconFetchStatus.ERROR) return faviconError.value || '图标获取失败'
  return '输入网址后可获取网站图标'
})

const debouncedFetchFavicon = createDebouncedFaviconFetcher((result) => {
  faviconStatus.value = result.status

  if (result.status === FaviconFetchStatus.SUCCESS && result.url) {
    form.value.icon = result.url
    faviconError.value = ''
  } else if (result.status === FaviconFetchStatus.ERROR) {
    faviconError.value = result.error || '图标获取失败'
  }

  if (!form.value.title.trim() && result.title) {
    form.value.title = result.title
  }
}, 500)

function normalizeUrlAndFetchFavicon() {
  const result = processUrl(form.value.url)
  if (!result.isValid) return

  form.value.url = result.url
  debouncedFetchFavicon(result.url)
}

function handleUrlBlur() {
  normalizeUrlAndFetchFavicon()
}

function fetchFaviconManual() {
  normalizeUrlAndFetchFavicon()
}

function handleFaviconError() {
  faviconStatus.value = FaviconFetchStatus.ERROR
  faviconError.value = '图标加载失败'
}

function tryFillUrlFromClipboard() {
  const text = readClipboardText()
  if (!text || !isValidUrlForClipboard(text)) return

  const result = processUrl(text)
  if (result.isValid) {
    form.value.url = result.url
    debouncedFetchFavicon(result.url)
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    submit()
  }
}

onMounted(async () => {
  await loadTree()
  tryFillUrlFromClipboard()
  window.addEventListener('keydown', handleKeydown)
  setTimeout(() => urlInputRef.value?.focus(), 100)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.quick-website-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  color: #1f2937;
}

.quick-website-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.title-area {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.path {
  max-width: 460px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #6b7280;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  height: 32px;
  border: 0;
  border-radius: 6px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn.primary {
  min-width: 68px;
  background: #2563eb;
  color: #ffffff;
}

.btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.icon {
  width: 32px;
  padding: 0;
  background: transparent;
  color: #64748b;
}

.quick-website-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 260px 1fr;
}

.folder-panel {
  border-right: 1px solid #e5e7eb;
  background: #f8fafc;
  overflow-y: auto;
  padding: 10px;
}

.panel-title {
  padding: 6px 8px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.folder-item {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #334155;
  text-align: left;
  cursor: pointer;
}

.folder-item:hover {
  background: #eef2f7;
}

.folder-item.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.folder-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-panel {
  padding: 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #475569;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
  min-height: 88px;
}

.field input:focus,
.field textarea:focus {
  border-color: #2563eb;
}

.favicon-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
}

.favicon-preview {
  width: 40px;
  height: 40px;
  border: 1px solid #dbe3ef;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #64748b;
  overflow: hidden;
}

.favicon-preview img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.favicon-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 12px;
  color: #64748b;
}

.link-button {
  width: fit-content;
  border: 0;
  padding: 0;
  background: transparent;
  color: #2563eb;
  font-size: 12px;
  cursor: pointer;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty {
  padding: 8px;
  font-size: 12px;
  color: #64748b;
}

.drag {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
