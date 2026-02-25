<template>
  <div class="note-input-container">
    <div class="header drag">
      <div class="left-section">
        <div class="icon-wrapper">
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </div>
        <input v-model="title" class="title-input no-drag" placeholder="标题" />
        <div v-if="isSaving" class="status-badge"><span class="dot"></span> 保存中...</div>
      </div>

      <div class="actions no-drag">
        <div class="type-switch">
          <button
            class="type-btn"
            :class="{ active: noteType === NoteType.WORK }"
            title="工作"
            @click="noteType = NoteType.WORK"
          >
            工作
          </button>
          <button
            class="type-btn"
            :class="{ active: noteType === NoteType.LIVE }"
            title="日志"
            @click="noteType = NoteType.LIVE"
          >
            日常
          </button>
        </div>
        <button class="btn primary" title="保存 (Ctrl+Enter)" @click="submit">
          <span>保存</span>
          <kbd>Ctrl+Enter</kbd>
        </button>
        <button class="btn text" title="取消 (Esc)" @click="close">
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
    </div>

    <div class="editor-container no-drag">
      <NoteEditor
        ref="editorRef"
        :model-value="content"
        @update:model-value="handleContentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file NoteInput.vue
 * @description 随手记输入窗口组件
 */
import { ref, onMounted } from 'vue'
import NoteEditor from '../components/content/notes/NoteEditor.vue'
import { useNoteInput } from '../hooks/useNoteInput'
import { NoteType } from '../enums'

const editorRef = ref()
const { content, title, noteType, isSaving, lastSavedTime, wordCount, handleContentChange, submit, close } =
  useNoteInput()

const titleInputRef = ref()

onMounted(() => {
  // Set default title
  if (!title.value) {
    title.value = new Date().toLocaleString()
  }
  
  // Focus on editor content area
  // We need to wait for Bytemd to mount
  setTimeout(() => {
    const editor = editorRef.value?.$el.querySelector('.CodeMirror textarea')
    if (editor) {
      editor.focus()
    }
  }, 100)
})
</script>

<style scoped lang="scss">
// Variables
$primary-color: #3b82f6;
$text-main: #1f2937;
$text-secondary: #6b7280;
$border-color: #e5e7eb;
$bg-color: #ffffff;
$header-bg: #f9fafb;

.note-input-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-color;
  border: 1px solid $border-color;
  box-sizing: border-box;
  // Border radius if window supports it (e.g. rounded corners on Mac/Win11)
  // Since it's a frameless window, we might want to handle border radius in the main process window config,
  // but here we ensure the content fits.

  .header {
    height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    background: $header-bg;
    border-bottom: 1px solid $border-color;
    user-select: none;

    .left-section {
      display: flex;
      align-items: center;
      gap: 12px;

      .icon-wrapper {
        color: $primary-color;
        display: flex;
        align-items: center;
      }

      .title-input {
        flex: 1;
        font-weight: 600;
        font-size: 16px;
        color: $text-main;
        border: none;
        background: transparent;
        outline: none;
        min-width: 0; // Fix flex item overflow

        &::placeholder {
          color: $text-secondary;
          font-weight: normal;
        }
      }

      .status-badge {
        font-size: 12px;
        color: $text-secondary;
        display: flex;
        align-items: center;
        gap: 6px;
        background: #e5e7eb;
        padding: 2px 8px;
        border-radius: 12px;
        transition: all 0.3s;

        &.saved {
          background: #d1fae5;
          color: #059669;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: $text-secondary;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
      }
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .type-switch {
        display: flex;
        background: #f3f4f6;
        border-radius: 6px;
        padding: 2px;
        gap: 2px;

        .type-btn {
          border: none;
          background: transparent;
          border-radius: 4px;
          min-width: 24px;
          padding: 0 8px;
          height: 24px;
          font-size: 12px;
          color: $text-secondary;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-weight: 500;

          &:hover {
            background: rgba(0, 0, 0, 0.05);
            color: $text-main;
          }

          &.active {
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            font-weight: 600;

            // Work (0) -> Light Red
            &:first-child {
              background: #fee2e2;
              color: #b91c1c;
            }

            // Live (1) -> Light Green
            &:last-child {
              background: #dcfce7;
              color: #15803d;
            }
          }
        }
      }

      .word-count {
        font-size: 12px;
        color: $text-secondary;
        font-variant-numeric: tabular-nums;
      }

      .divider {
        width: 1px;
        height: 24px;
        background: $border-color;
      }

      .btn {
        cursor: pointer;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
        height: 32px;
        padding: 0 12px;

        &.primary {
          background: $primary-color;
          color: white;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

          &:hover {
            background: darken($primary-color, 5%);
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          &:active {
            transform: translateY(0);
          }

          kbd {
            font-family: inherit;
            font-size: 10px;
            background: rgba(255, 255, 255, 0.2);
            padding: 1px 4px;
            border-radius: 4px;
          }
        }

        &.text {
          background: transparent;
          color: $text-secondary;
          padding: 0 8px;

          &:hover {
            background: rgba(0, 0, 0, 0.05);
            color: $text-main;
          }
        }
      }
    }
  }

  .editor-container {
    flex: 1;
    overflow: hidden;
  }
}

.drag {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}

@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
}
</style>
