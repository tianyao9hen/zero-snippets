<template>
  <div class="edit-modal">
    <div class="modal-overlay" @click="handleCancel"></div>
    <div class="modal-content" :class="{ maximized: isMaximized }">
      <div class="modal-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <input v-model="localNote.name" class="title-input" placeholder="标题" />
        </div>
        <div class="header-right">
          <NoteTypeSwitch v-model="localNote.noteType" />
          <button class="btn-save" title="保存 (Ctrl+Enter)" @click="handleSave">
            <span>保存</span>
            <kbd>Ctrl+Enter</kbd>
          </button>
          <button
            class="btn-maximize"
            :title="isMaximized ? '恢复' : '最大化'"
            @click="toggleMaximize"
          >
            <svg
              v-if="!isMaximized"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
              ></path>
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
            >
              <path
                d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
              ></path>
            </svg>
          </button>
          <button class="btn-close" title="关闭 (Esc)" @click="handleCancel">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
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
      </div>
      <div class="modal-body">
        <button
          class="mode-toggle"
          type="button"
          :title="editorMode === 'preview' ? '切换到编辑模式' : '切换到展示模式'"
          @click="toggleEditorMode"
        >
          <span>{{ editorMode === 'preview' ? '编辑' : '展示' }}</span>
        </button>
        <NoteEditor
          ref="editorRef"
          :key="editorKey"
          v-model="localNote.note"
          :mode="editorMode"
          @task-toggle="handleTaskToggle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import NoteEditor from './NoteEditor.vue'
import NoteTypeSwitch from './NoteTypeSwitch.vue'
import { NoteEntity } from '@renderer/composables/noteGrouping'

const EDIT_DRAFT_PREFIX = 'quick-note-edit-draft:'

const props = defineProps<{
  note: NoteEntity // 当前编辑的随手记
}>()

const emit = defineEmits<{
  /** 保存随手记 */
  (e: 'save', note: NoteEntity): void
  /** 静默保存随手记 */
  (e: 'silentSave', note: NoteEntity): void
  /** 取消编辑 */
  (e: 'cancel'): void
}>()

/**
 * 获取指定随手记的编辑草稿键。
 * @param id 随手记 ID
 * @returns 草稿存储键
 */
const getDraftKey = (id: number) => `${EDIT_DRAFT_PREFIX}${id}`

/**
 * 恢复指定随手记的编辑草稿。
 * @param note 原始随手记
 * @returns 合并草稿后的随手记
 */
const restoreEditDraft = (note: NoteEntity): NoteEntity => {
  const rawDraft = localStorage.getItem(getDraftKey(note.id))
  if (!rawDraft) return { ...note }

  try {
    return { ...note, ...JSON.parse(rawDraft) }
  } catch {
    localStorage.removeItem(getDraftKey(note.id))
    return { ...note }
  }
}

const editorRef = ref<InstanceType<typeof NoteEditor> | null>(null)
const localNote = ref<NoteEntity>(restoreEditDraft(props.note))
const isMaximized = ref(false)
const editorKey = ref(0)
const editorMode = ref<'preview' | 'edit'>('preview')

/**
 * 持久化当前编辑草稿。
 */
const persistEditDraft = () => {
  if (!localNote.value.id) return
  localStorage.setItem(
    getDraftKey(localNote.value.id),
    JSON.stringify({
      name: localNote.value.name,
      note: localNote.value.note,
      noteType: localNote.value.noteType
    })
  )
}

/**
 * 清理当前编辑草稿。
 */
const clearEditDraft = () => {
  if (!localNote.value.id) return
  localStorage.removeItem(getDraftKey(localNote.value.id))
}

/**
 * 切换弹窗最大化状态。
 */
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
  editorKey.value++
}

/**
 * 切换展示模式和编辑模式。
 */
const toggleEditorMode = () => {
  editorMode.value = editorMode.value === 'preview' ? 'edit' : 'preview'
  editorKey.value++
  if (editorMode.value === 'edit') {
    nextTick(() => editorRef.value?.focus())
  }
}

watch(
  () => props.note,
  (newVal) => {
    localNote.value = restoreEditDraft(newVal)
    editorMode.value = 'preview'
  },
  { deep: true }
)

watch(
  () => localNote.value.noteType,
  () => {
    emit('silentSave', { ...localNote.value })
  }
)

watch(localNote, persistEditDraft, { deep: true })

/**
 * 保存当前编辑内容。
 */
const handleSave = () => {
  clearEditDraft()
  emit('save', { ...localNote.value })
}

/**
 * 处理展示模式 TODO 勾选并立即静默保存。
 *
 * @param note 最新 Markdown 内容
 */
const handleTaskToggle = (note: string) => {
  localNote.value.note = note
  emit('silentSave', { ...localNote.value })
}

/**
 * 取消编辑。
 */
const handleCancel = () => {
  emit('cancel')
}

/**
 * 处理编辑弹窗快捷键。
 * @param e 键盘事件
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    handleCancel()
  }
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault()
    e.stopPropagation()
    handleSave()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
$primary-color: #3b82f6;
$card-bg: #ffffff;
$text-main: #1f2937;
$text-secondary: #6b7280;
$border-color: #e5e7eb;

.edit-modal {
  position: fixed;
  inset: 0;
  z-index: 10010;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
  }

  .modal-content {
    position: relative;
    width: 90%;
    max-width: 800px;
    height: 80vh;
    background: $card-bg;
    border-radius: 12px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modal-in 0.3s ease-out;
    transition: all 0.3s ease-in-out;

    &.maximized {
      width: 100%;
      max-width: 100%;
      height: 100vh;
      border-radius: 0;
    }
  }

  .modal-header {
    padding: 12px 24px;
    border-bottom: 1px solid $border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
  }

  .header-left {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 12px;
    min-width: 0;
  }

  .icon-wrapper {
    color: $primary-color;
    display: flex;
    align-items: center;
  }

  .title-input {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
    color: $text-main;
    background: transparent;
    border: none;
    outline: none;
    min-width: 0;

    &::placeholder {
      color: #9ca3af;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: 16px;
  }

  .btn-maximize,
  .btn-close {
    background: transparent;
    border: none;
    color: $text-secondary;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
      color: $text-main;
    }
  }

  .btn-save {
    display: flex;
    align-items: center;
    gap: 8px;
    background: $primary-color;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
    }

    kbd {
      font-family: inherit;
      font-size: 11px;
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  .modal-body {
    position: relative;
    flex: 1;
    overflow: hidden;

    :deep(.bytemd) {
      height: 100%;
    }
  }

  .mode-toggle {
    position: absolute;
    top: 10px;
    right: 14px;
    z-index: 3;
    height: 28px;
    padding: 0 10px;
    border: 1px solid $border-color;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.92);
    color: $text-secondary;
    cursor: pointer;
    font-size: 12px;
    line-height: 28px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

    &:hover {
      color: $text-main;
      background: #f9fafb;
    }
  }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
