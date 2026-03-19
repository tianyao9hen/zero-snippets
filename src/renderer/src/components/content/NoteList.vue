<template>
  <div class="note-list-page">
    <button
      class="add-note-fab"
      type="button"
      title="新增随手记"
      aria-label="新增随手记"
      @click="openNoteWindow"
    >
      <img class="add-note-fab-icon" :src="addNoteIcon" alt="" />
    </button>
    <div class="note-container">
      <div v-if="loading && notes.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="notes.length === 0" class="empty-state">
        <p>暂无随手记，按 F2 快速记录</p>
      </div>

      <template v-else>
        <template v-for="group in groupedNotes" :key="group.title">
          <div v-if="group.title" class="group-header">
            <div class="dashed-line"></div>
            <span class="group-title">{{ group.title }}</span>
            <div class="dashed-line"></div>
          </div>

          <div class="note-grid">
            <NoteCard
              v-for="note in group.notes"
              :key="note.id"
              :note="note"
              @edit="editNote"
              @delete="deleteNote"
            />
          </div>
        </template>

        <!-- Sentinel for infinite scroll -->
        <div v-if="hasMore" ref="sentinel" class="sentinel">
          <div class="spinner small"></div>
        </div>
      </template>
    </div>

    <!-- Edit Modal -->
    <Transition name="modal">
      <NoteEditModal
        v-if="editingNote"
        :note="editingNote"
        @save="(note) => saveEdit(note)"
        @cancel="cancelEdit"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import NoteEditModal from './notes/NoteEditModal.vue'
import NoteCard from './notes/NoteCard.vue'
import { useNoteList } from '@renderer/hooks/useNoteList'
import { useSettingStore } from '@renderer/store/settingStore'
import { SettingKey, NoteGroupingMode } from '@renderer/enums'
import { groupNotes } from '@renderer/composables/noteGrouping'
import { iconMap } from '@renderer/composables/iconUtils'

// 使用 useNoteList hook 获取笔记相关状态和方法
const {
  notes,
  loading,
  editingNote,
  hasMore,
  loadMore,
  editNote,
  saveEdit,
  cancelEdit,
  deleteNote
} = useNoteList()

// 获取设置 Store
const settingStore = useSettingStore()

const addNoteIcon = iconMap.add.url

function openNoteWindow() {
  window.api.showWindow('note', '/note-input')
}

/**
 * 计算随手记分组模式
 * 根据设置 Store 中的配置决定如何分组
 *
 * @returns {NoteGroupingMode} 分组模式枚举值
 */
const groupingMode = computed(() => {
  // 确保在设置加载完成时重新计算
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void settingStore.isLoaded

  // 从 Store 获取分组模式设置
  const mode = settingStore.getSetting(SettingKey.NOTE_GROUPING_MODE_KEY)
  if (!mode) return NoteGroupingMode.NONE

  // 转换为数字枚举
  const num = Number(mode)
  if (!isNaN(num)) {
    return num as NoteGroupingMode
  }
  return NoteGroupingMode.NONE
})

/**
 * 计算分组后的随手记列表
 * 根据当前的笔记列表和分组模式生成分组数据
 *
 * @returns {GroupedNotes[]} 分组后的笔记数组
 */
const groupedNotes = computed(() => {
  // notes 来自 useNoteList hook
  return groupNotes(notes.value, groupingMode.value)
})

// 无限滚动相关的 DOM 引用和观察者
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

/**
 * 组件挂载生命周期钩子
 * 初始化无限滚动观察者并确保设置已加载
 */
onMounted(() => {
  // 初始化 IntersectionObserver 用于监听滚动到底部
  observer = new IntersectionObserver(
    (entries) => {
      // 当哨兵元素进入视口且还有更多数据时，加载更多
      if (entries[0].isIntersecting && hasMore.value) {
        loadMore()
      }
    },
    { threshold: 0.5 }
  )

  // 监听 sentinel ref 的变化，确保元素渲染后开始观察
  const checkSentinel = setInterval(() => {
    if (sentinel.value && observer) {
      observer.observe(sentinel.value)
      clearInterval(checkSentinel)
    }
  }, 100)

  // 确保设置已加载，用于正确的分组显示
  if (!settingStore.isLoaded) {
    settingStore.loadSettings()
  }
})

/**
 * 组件卸载前生命周期钩子
 * 清理观察者资源
 */
onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped lang="scss">
// Variables
$primary-color: #3b82f6; // Blue 500
$bg-color: #f9fafb; // Gray 50
$border-color: #e5e7eb; // Gray 200
$text-secondary: #6b7280; // Gray 500

.note-list-page {
  padding: 24px;
  height: 100%;
  background-color: $bg-color;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.add-note-fab {
  position: fixed;
  top: 16px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: #4096ff;
  border: 1px solid #4096ff;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: #2f7fe6;
    border-color: #2f7fe6;
    box-shadow:
      0 12px 18px -3px rgba(0, 0, 0, 0.12),
      0 6px 8px -4px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(0);
  }
}

.add-note-fab-icon {
  width: 20px;
  height: 20px;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

.note-container {
  padding-bottom: 24px;
}

// Group Header
.group-header {
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;

  .dashed-line {
    flex: 1;
    height: 1px;
    border-bottom: 1px dashed #4096ff;
  }

  .group-title {
    margin: 0 16px;
    font-size: 14px;
    color: #4096ff;
    font-weight: 500;
  }
}

.note-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
  // 自适应列数，根据卡片最小宽度自动填充
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  // 确保卡片左对齐，当列宽大于卡片最大宽度时，右侧留白
  justify-items: start;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: $text-secondary;

  p {
    margin-top: 16px;
  }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid $border-color;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  &.small {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }
}

.sentinel {
  display: flex;
  justify-content: center;
  padding: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
