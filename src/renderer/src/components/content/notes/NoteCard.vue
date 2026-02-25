<template>
  <div class="note-card group">
    <!-- Type Badge -->
    <div
      v-if="note.noteType !== undefined && note.noteType !== null"
      class="type-badge"
      :class="{
        work: note.noteType === NoteType.WORK,
        live: note.noteType === NoteType.LIVE
      }"
    ></div>

    <div class="card-header">
      <span class="card-title" :title="note.name">{{ note.name || '无标题' }}</span>
    </div>

    <div class="card-content">
      <Viewer :value="note.note" :plugins="plugins" />
    </div>

    <div class="card-actions">
      <button class="action-btn edit" title="编辑" @click="$emit('edit', note)">
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button class="action-btn delete" title="删除" @click="$emit('delete', note.id)">
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 6 5 6 21 6"></polyline>
          <path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Viewer } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import gemoji from '@bytemd/plugin-gemoji'
import highlight from '@bytemd/plugin-highlight'
import breaks from '@bytemd/plugin-breaks'
import 'bytemd/dist/index.css'
import 'juejin-markdown-themes/dist/github.min.css'
import 'highlight.js/styles/a11y-light.min.css'
import { NoteType } from '@renderer/enums'

// 定义 Props
defineProps<{
  note: NoteEntity
}>()

// 定义 Emits
defineEmits<{
  (e: 'edit', note: NoteEntity): void
  (e: 'delete', id: number): void
}>()

// 配置 Markdown 查看器插件
const plugins = [breaks(), gemoji(), gfm(), highlight()]
</script>

<style scoped lang="scss">
// Variables - 需要重新定义或引入，这里先复制
$primary-color: #3b82f6; // Blue 500
$danger-color: #ef4444; // Red 500
$card-bg: #ffffff;
$text-main: #1f2937; // Gray 800
$text-secondary: #6b7280; // Gray 500
$border-color: #e5e7eb; // Gray 200
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md:
  0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);

.note-card {
  background: $card-bg;
  border-radius: 12px;
  padding: 16px;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  height: 280px;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;

  // Card width constraints
  min-width: 220px;
  max-width: 260px;
  width: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
    border-color: lighten($primary-color, 20%);

    .card-actions {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  // Type Badge
  .type-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    z-index: 2;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.4);

    &.work {
      background-color: #ef4444; // Red 500
      border: 2px solid #fee2e2; // Red 100 ring
    }

    &.live {
      background-color: #22c55e; // Green 500
      border: 2px solid #dcfce7; // Green 100 ring
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-right: 16px; // Avoid badge overlap if title is long

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: $text-main;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
  }

  .card-content {
    flex: 1;
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.6;
    overflow: hidden;
    position: relative;

    :deep(.markdown-body) {
      font-size: 14px;
      color: $text-secondary;
      background: transparent;

      p {
        margin-bottom: 8px;
      }

      img {
        max-width: 100%;
      }

      // ... headers ...
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        line-height: 1.25;
        font-weight: 600;
        border-bottom: none;
      }
    }

    // Mask effect for text overflow
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40px;
      background: linear-gradient(transparent, $card-bg);
      pointer-events: none;
    }
  }

  .card-actions {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    display: flex;
    gap: 12px;
    opacity: 0; // Hidden by default
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 10;

    .action-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: white;
      color: $text-secondary;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s;

      &:hover {
        transform: scale(1.1);
        &.edit {
          color: white;
          background: $primary-color;
        }
        &.delete {
          color: white;
          background: $danger-color;
        }
      }

      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
}
</style>
