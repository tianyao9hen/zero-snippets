<template>
  <!-- 自定义对话框 -->
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
    @click.self="handleCancel"
  >
    <div class="w-[480px] max-w-[90vw] bg-white rounded-lg shadow-lg max-h-[90vh] flex flex-col">
      <!-- 标题栏 -->
      <h3 class="px-4 py-3 text-sm font-semibold text-slate-800 border-b border-slate-200 flex-shrink-0">
        导入Chrome书签
      </h3>

      <!-- 内容区域 -->
      <div class="p-4 overflow-y-auto flex-1">
        <!-- 文件上传区域 -->
        <div class="upload-section mb-4">
          <div
            class="upload-area"
            :class="{ 'drag-over': isDragOver, 'has-file': selectedFile }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="text/html"
              class="hidden-input"
              @change="handleFileChange"
            />
            <div v-if="!selectedFile" class="upload-placeholder">
              <svg viewBox="0 0 24 24" width="48" height="48" class="upload-icon">
                <path
                  fill="currentColor"
                  d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"
                />
              </svg>
              <p class="upload-text">点击或拖拽上传Bookmark HTML文件</p>
              <p class="upload-hint">支持Chrome导出的书签文件</p>
            </div>
            <div v-else class="file-info">
              <svg viewBox="0 0 24 24" width="32" height="32" class="file-icon">
                <path
                  fill="currentColor"
                  d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                />
              </svg>
              <div class="file-details">
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button class="remove-file-btn" @click.stop="removeFile">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 解析结果预览 -->
        <div v-if="parseResult" class="preview-section mb-4">
          <div class="preview-header">
            <span class="preview-title">解析结果</span>
            <span class="preview-count">
              {{ parseResult.folders }} 个文件夹，{{ parseResult.bookmarks }} 个书签
            </span>
          </div>
          <div class="preview-tree">
            <BookmarkTreePreview :nodes="parsedNodes" />
          </div>
        </div>

        <!-- 进度显示 -->
        <div v-if="isImporting" class="progress-section mb-4">
          <div class="progress-bar-container">
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :style="{ width: progressPercent + '%' }"
                :class="progressStatus"
              />
            </div>
            <span class="progress-percent">{{ progressPercent }}%</span>
          </div>
          <p class="progress-text">{{ progressText }}</p>
        </div>
      </div>

      <!-- 底部按钮区域 -->
      <div class="px-4 py-3 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
        <button
          class="px-4 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          :disabled="isImporting"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          class="px-4 py-1.5 text-xs text-white bg-[#4096ff] border border-[#4096ff] rounded hover:bg-[#1677ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canImport || isImporting"
          @click="handleImport"
        >
          <span v-if="isImporting">导入中...</span>
          <span v-else>开始导入</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file BookmarkImportDialog.vue
 * @description Chrome书签导入对话框组件
 *
 * 功能说明：
 * - 模态窗口显示
 * - 文件上传控件（限制accept="text/html"）
 * - 文件格式验证
 * - 解析进度显示
 * - 导入结果反馈（成功/失败提示）
 * - 错误处理显示
 */
import { ref, computed } from 'vue'
import {
  parseBookmarkHtml,
  isValidBookmarkHtml,
  countBookmarks,
  type BookmarkNode
} from '@renderer/utils/bookmarkParser'
import BookmarkTreePreview from './BookmarkTreePreview.vue'

defineOptions({
  name: 'BookmarkImportDialog'
})

// ==================== Props & Emits ====================

const props = defineProps<{
  visible: boolean
  typeId: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [{ categoryId: number; importedCount: number }]
}>()

// ==================== 响应式状态 ====================

/** 文件输入框引用 */
const fileInputRef = ref<HTMLInputElement>()

/** 选中的文件 */
const selectedFile = ref<File | null>(null)

/** 是否拖拽中 */
const isDragOver = ref(false)

/** 解析后的节点 */
const parsedNodes = ref<BookmarkNode[]>([])

/** 解析结果统计 */
const parseResult = ref<{ folders: number; bookmarks: number } | null>(null)

/** 是否正在导入 */
const isImporting = ref(false)

/** 导入进度 */
const progressPercent = ref(0)

/** 进度状态 */
const progressStatus = ref<'normal' | 'active' | 'success' | 'exception'>('normal')

/** 进度文本 */
const progressText = ref('')

// ==================== 计算属性 ====================

/** 是否可以导入 */
const canImport = computed(() => {
  return selectedFile.value !== null && parsedNodes.value.length > 0 && !isImporting.value
})

// ==================== 事件处理 ====================

/**
 * 触发文件选择
 */
const triggerFileInput = () => {
  if (!isImporting.value) {
    fileInputRef.value?.click()
  }
}

/**
 * 处理拖拽进入
 */
const handleDragOver = () => {
  if (!isImporting.value) {
    isDragOver.value = true
  }
}

/**
 * 处理拖拽离开
 */
const handleDragLeave = () => {
  isDragOver.value = false
}

/**
 * 处理文件拖放
 */
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

/**
 * 处理文件选择
 */
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

/**
 * 显示提示信息
 */
const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
  // 使用简单的 alert 替代 message 组件
  if (type === 'error') {
    alert(msg)
  }
  // success 消息可以静默处理或打印到控制台
  console.log(`[${type}]`, msg)
}

/**
 * 处理文件
 */
const processFile = async (file: File) => {
  // 验证文件类型
  if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
    showMessage('请选择HTML文件', 'error')
    return
  }

  selectedFile.value = file

  try {
    const content = await readFileAsText(file)

    // 验证文件格式
    if (!isValidBookmarkHtml(content)) {
      showMessage('无效的书签文件格式', 'error')
      selectedFile.value = null
      parsedNodes.value = []
      parseResult.value = null
      return
    }

    // 解析书签
    parsedNodes.value = parseBookmarkHtml(content)
    parseResult.value = countBookmarks(parsedNodes.value)

    showMessage(`成功解析 ${parseResult.value.folders} 个文件夹和 ${parseResult.value.bookmarks} 个书签`)
  } catch (error) {
    console.error('解析文件失败:', error)
    showMessage('解析文件失败：' + (error instanceof Error ? error.message : '未知错误'), 'error')
    selectedFile.value = null
    parsedNodes.value = []
    parseResult.value = null
  }
}

/**
 * 读取文件内容为文本
 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}

/**
 * 移除选中的文件
 */
const removeFile = () => {
  selectedFile.value = null
  parsedNodes.value = []
  parseResult.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 处理导入
 */
const handleImport = async () => {
  if (!parsedNodes.value.length) return

  isImporting.value = true
  progressStatus.value = 'active'
  progressPercent.value = 0
  progressText.value = '正在导入书签...'
  let progressInterval: NodeJS.Timeout | null = null
  try {
    // 开始模拟进度
    const totalNodes = parsedNodes.value.reduce((count, node) => {
      const countRecursive = (n: BookmarkNode): number => {
        let c = 1
        if (n.children) {
          for (const child of n.children) {
            c += countRecursive(child)
          }
        }
        return c
      }
      return count + countRecursive(node)
    }, 0)

    // 模拟进度更新
    let currentProgress = 0
    progressInterval = setInterval(() => {
      currentProgress += Math.random() * 15
      if (currentProgress > 90) currentProgress = 90
      progressPercent.value = Math.floor(currentProgress)
      progressText.value = `正在导入书签... (${Math.floor((currentProgress / 100) * totalNodes)}/${totalNodes})`
    }, 200)

    // 调用IPC导入书签
    // 使用 JSON 序列化确保数据可克隆
    const serializableNodes = JSON.parse(JSON.stringify(parsedNodes.value))
    const result = await window.api.importBookmarks({
      typeId: props.typeId,
      nodes: serializableNodes
    })

    if (progressInterval) {
      clearInterval(progressInterval)
    }

    if (result.success) {
      progressStatus.value = 'success'
      progressPercent.value = 100
      progressText.value = `导入成功！共导入 ${result.importedCount} 个节点`
      showMessage('书签导入成功')

      // 延迟关闭对话框
      setTimeout(() => {
        emit('update:visible', false)
        resetState()
        emit('success', { categoryId: result.categoryId!, importedCount: result.importedCount })
      }, 1500)
    } else {
      throw new Error(result.error || '导入失败')
    }
  } catch (error) {
    if (progressInterval) {
      clearInterval(progressInterval)
    }
    console.error('导入失败:', error)
    progressStatus.value = 'exception'
    progressText.value = '导入失败：' + (error instanceof Error ? error.message : '未知错误')
    showMessage(progressText.value, 'error')
  } finally {
    isImporting.value = false
  }
}

/**
 * 处理取消
 */
const handleCancel = () => {
  if (isImporting.value) {
    showMessage('正在导入中，请稍候...', 'error')
    return
  }
  emit('update:visible', false)
  resetState()
}

/**
 * 重置状态
 */
const resetState = () => {
  selectedFile.value = null
  parsedNodes.value = []
  parseResult.value = null
  isImporting.value = false
  progressPercent.value = 0
  progressStatus.value = 'normal'
  progressText.value = ''
  isDragOver.value = false
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<style scoped>
.upload-section {
  margin-bottom: 16px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #4096ff;
  background-color: #f0f7ff;
}

.upload-area.drag-over {
  border-color: #4096ff;
  background-color: #e6f4ff;
}

.upload-area.has-file {
  padding: 16px 24px;
  border-style: solid;
  border-color: #52c41a;
  background-color: #f6ffed;
}

.hidden-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  color: #bfbfbf;
}

.upload-text {
  font-size: 14px;
  color: #262626;
  margin: 0;
}

.upload-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  color: #52c41a;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #262626;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #8c8c8c;
  margin: 4px 0 0;
}

.remove-file-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #8c8c8c;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  background-color: #ff4d4f;
  color: #fff;
}

.preview-section {
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.preview-count {
  font-size: 12px;
  color: #8c8c8c;
}

.preview-tree {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px 16px;
}

.progress-section {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar-bg {
  flex: 1;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #4096ff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-bar-fill.success {
  background-color: #52c41a;
}

.progress-bar-fill.exception {
  background-color: #ff4d4f;
}

.progress-percent {
  font-size: 12px;
  color: #666;
  min-width: 40px;
  text-align: right;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: #8c8c8c;
  margin: 8px 0 0;
}
</style>
