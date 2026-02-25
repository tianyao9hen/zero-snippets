<template>
  <div class="edit-modal">
    <div class="modal-overlay" @click="handleCancel"></div>
    <div class="modal-content">
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
          <div class="type-switch">
            <button
              class="type-btn"
              :class="{ active: localNote.noteType === NoteType.WORK }"
              title="工作"
              @click="localNote.noteType = NoteType.WORK"
            >
              工作
            </button>
            <button
              class="type-btn"
              :class="{ active: localNote.noteType === NoteType.LIVE }"
              title="日常"
              @click="localNote.noteType = NoteType.LIVE"
            >
              日常
            </button>
          </div>
          <button class="btn-save" title="保存 (Ctrl+Enter)" @click="handleSave">
            <span>保存</span>
            <kbd>Ctrl+Enter</kbd>
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
        <NoteEditor
          ref="editorRef"
          v-model="localNote.note"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import NoteEditor from './NoteEditor.vue'
import { NoteType } from '@renderer/enums'
import { NoteEntity } from '@renderer/composables/noteGrouping'

const props = defineProps<{
  note: NoteEntity
}>()

const emit = defineEmits<{
  (e: 'update:note', note: NoteEntity): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const localNote = ref<NoteEntity>({ ...props.note })

watch(
  () => props.note,
  (newVal) => {
    localNote.value = { ...newVal }
  },
  { deep: true }
)

watch(
  localNote,
  (newVal) => {
    emit('update:note', newVal)
  },
  { deep: true }
)

const handleSave = () => {
  emit('save')
}

const handleCancel = () => {
  emit('cancel')
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleCancel()
  }
  if (e.key === 'Enter' && e.ctrlKey) {
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
// Variables
$primary-color: #3b82f6; // Blue 500
$card-bg: #ffffff;
$text-main: #1f2937; // Gray 800
$text-secondary: #6b7280; // Gray 500
$border-color: #e5e7eb; // Gray 200

.edit-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
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

    .modal-header {
      padding: 12px 24px;
      border-bottom: 1px solid $border-color;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;

      .header-left {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 12px;
        min-width: 0;

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
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-left: 16px;

        .type-switch {
          display: flex;
          background: #f3f4f6;
          border-radius: 6px;
          padding: 2px;
          gap: 4px;

          .type-btn {
            border: none;
            background: transparent;
            border-radius: 4px;
            padding: 4px 12px;
            font-size: 13px;
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
              font-weight: 600;

              // Work (0) -> Light Red
              &:first-child {
                background: #fee2e2;
                color: #b91c1c;
              }

              // Live (1) -> Light Green (Updated to match image concept: Gray bg for inactive, but active should be distinct)
              // Image shows "日常" as gray when "工作" is active. 
              // Assuming active state for "日常" uses its own color.
              &:last-child {
                background: #f3f4f6; // Default gray for live? Or specific color? 
                // Let's stick to previous logic but refined:
                // If the user wants "日常" to be active, maybe a neutral or green color.
                // The image shows "工作" active (red). "日常" inactive (gray).
                // Let's keep green for Live active state for consistency with the list badge.
                background: #dcfce7;
                color: #15803d;
              }
            }
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
            background: darken($primary-color, 5%);
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
      }
    }

    .modal-body {
      flex: 1;
      overflow: hidden;
      :deep(.bytemd) {
        height: 100%;
      }
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
