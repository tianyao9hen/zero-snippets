<template>
  <div class="note-list-page">
    <div class="note-toolbar">
      <div class="note-toolbar-row">
        <button
          class="add-note-fab"
          type="button"
          title="新增随手记"
          aria-label="新增随手记"
          @click="openNoteWindow"
        >
          <img class="add-note-fab-icon" :src="addNoteIcon" alt="" />
        </button>
        <button
          class="search-toggle-btn"
          type="button"
          title="搜索随手记"
          aria-label="搜索随手记"
          :class="{ active: searchExpanded }"
          @click="toggleSearchPanel"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
            <path
              d="M20 20l-3.5-3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <Transition name="search-panel">
        <div v-if="searchExpanded" class="search-panel">
          <div class="search-input-shell">
            <span class="search-icon">⌕</span>
            <input
              ref="searchInputRef"
              v-model="searchKeyword"
              class="search-input"
              type="text"
              placeholder="按名称模糊搜索随手记"
            />
            <button
              v-if="hasActiveFilters"
              class="search-clear-btn"
              type="button"
              title="清空搜索"
              @click="clearSearchFilters"
            >
              清空
            </button>
          </div>

          <div class="search-category-row">
            <button
              v-for="item in noteTypeOptions"
              :key="item.value"
              type="button"
              class="search-chip"
              :class="[item.cls, { active: isTypeSelected(item.value) }]"
              :aria-pressed="isTypeSelected(item.value)"
              @click="toggleType(item.value)"
            >
              <span class="search-chip-label">{{ item.label }}</span>
              <span v-if="isTypeSelected(item.value)" class="search-chip-check">✓</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <div class="note-container">
      <div v-if="loading && notes.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="allNotes.length === 0" class="empty-state">
        <p>暂无随手记，按 F2 快速记录</p>
      </div>

      <div v-else-if="notes.length === 0" class="empty-state">
        <p>未找到匹配的随手记</p>
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
        @silent-save="(note) => silentSave(note)"
        @cancel="cancelEdit"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import NoteEditModal from './notes/NoteEditModal.vue'
import NoteCard from './notes/NoteCard.vue'
import { useNoteList } from '@renderer/hooks/useNoteList'
import { useSettingStore } from '@renderer/store/settingStore'
import { SettingKey, NoteGroupingMode, NoteType } from '@renderer/enums'
import { groupNotes } from '@renderer/composables/noteGrouping'
import { iconMap } from '@renderer/composables/iconUtils'

// 使用 useNoteList hook 获取笔记相关状态和方法
const {
  allNotes,
  notes,
  loading,
  editingNote,
  hasMore,
  loadMore,
  resetDisplaySource,
  editNote,
  saveEdit,
  silentSave,
  cancelEdit,
  deleteNote
} = useNoteList()

// 获取设置 Store
const settingStore = useSettingStore()
const addNoteIcon = iconMap.add.url

// 搜索面板的显示状态和筛选条件都保留在列表页内，避免和编辑弹窗互相影响。
const searchExpanded = ref(false)
const searchKeyword = ref('')
const selectedTypes = ref<NoteType[]>([])
const searchInputRef = ref<HTMLInputElement | null>(null)

const noteTypeOptions = [
  { value: NoteType.WORK, label: '工作', cls: 'work' },
  { value: NoteType.REPORT, label: '报表', cls: 'report' },
  { value: NoteType.LIVE, label: '生活', cls: 'live' },
  { value: NoteType.TODO, label: 'TODO', cls: 'todo' }
]

/**
 * 打开独立的随手记新增窗口
 */
function openNoteWindow() {
  window.api.showWindow('note', '/note-input')
}

const hasActiveFilters = computed(
  () => searchKeyword.value.trim().length > 0 || selectedTypes.value.length > 0
)

// 先在全量笔记上做名称和类别过滤，再把结果交给分页逻辑，避免漏掉未展示的条目。
const filteredNotes = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  const activeTypes = selectedTypes.value

  return allNotes.value.filter((note) => {
    const matchesKeyword = !keyword || (note.name || '').toLowerCase().includes(keyword)
    const matchesType =
      activeTypes.length === 0 || activeTypes.includes(note.noteType as NoteType)
    return matchesKeyword && matchesType
  })
})

const isTypeSelected = (type: NoteType) => selectedTypes.value.includes(type)

const toggleType = (type: NoteType) => {
  const index = selectedTypes.value.indexOf(type)
  if (index >= 0) {
    selectedTypes.value = selectedTypes.value.filter((item) => item !== type)
    return
  }
  selectedTypes.value = [...selectedTypes.value, type]
}

const clearSearchFilters = () => {
  searchKeyword.value = ''
  selectedTypes.value = []
}

// 搜索按钮只负责展开和收起面板，筛选条件本身不随面板关闭而丢失。
const toggleSearchPanel = async () => {
  searchExpanded.value = !searchExpanded.value
  if (searchExpanded.value) {
    await nextTick()
    searchInputRef.value?.focus()
  }
}

// 过滤结果变化时，重置分页起点，确保列表始终从当前筛选结果的第一页开始显示。
watch(
  filteredNotes,
  (nextNotes) => {
    resetDisplaySource(nextNotes)
  },
  { immediate: true }
)

/**
 * 计算随手记分组模式
 * 根据设置 Store 中的配置决定如何分组
 *
 * @returns {NoteGroupingMode} 分组模式枚举值
 */
const groupingMode = computed(() => {
  // 确保在设置加载完成时重新计算
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
  // notes 来自 useNoteList hook，已经是过滤和分页后的可见批次
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
$card-bg: #ffffff; // White

.note-list-page {
  padding: 24px;
  height: 100%;
  background-color: $bg-color;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

// 右上角工具栏同时承载新增和搜索入口，保持两枚圆形按钮视觉一致。
.note-toolbar {
  position: fixed;
  top: 16px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  max-width: calc(100vw - 32px);
}

.note-toolbar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-note-fab,
.search-toggle-btn,
.search-clear-btn,
.search-chip {
  border: 1px solid transparent;
  border-radius: 9999px;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
}

.add-note-fab {
  width: 44px;
  height: 44px;
  background: #4096ff;
  border-color: #4096ff;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;

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

.search-toggle-btn {
  width: 44px;
  height: 44px;
  background: #ffffff;
  color: #4096ff;
  border-color: #bfdbfe;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 4px 6px -4px rgba(0, 0, 0, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
    border-color: #93c5fd;
    box-shadow:
      0 12px 18px -3px rgba(0, 0, 0, 0.1),
      0 6px 8px -4px rgba(0, 0, 0, 0.1);
  }

  &.active {
    background: #eff6ff;
    border-color: #93c5fd;
  }
}

.add-note-fab-icon {
  width: 20px;
  height: 20px;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

.search-panel {
  width: min(360px, calc(100vw - 48px));
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #dbeafe;
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(15, 23, 42, 0.08),
    0 8px 10px -6px rgba(15, 23, 42, 0.08);
  padding: 12px;
  backdrop-filter: blur(4px);
}

.search-input-shell {
  height: 46px;
  background: white;
  border: 1px solid #dbeafe;
  border-radius: 9999px;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
  padding: 0 10px 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  color: #60a5fa;
  font-size: 18px;
  line-height: 1;
  flex: 0 0 auto;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #111827;

  &::placeholder {
    color: #9ca3af;
  }
}

.search-clear-btn {
  height: 32px;
  padding: 0 12px;
  background: #f8fafc;
  color: #64748b;
  border-color: #dbeafe;
  flex: 0 0 auto;

  &:hover {
    background: #eff6ff;
    color: #334155;
  }
}

.search-category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 10px;
}

.search-chip {
  min-height: 34px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  color: #64748b;
  border-color: #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-1px);
    border-color: #cbd5e1;
  }

  &.active {
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.08),
      0 4px 6px -4px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &.work.active {
    background: #dbeafe;
    color: #1d4ed8;
    border-color: #bfdbfe;
  }

  &.live.active {
    background: #dcfce7;
    color: #15803d;
    border-color: #bbf7d0;
  }

  &.report.active {
    background: #fae8ff;
    color: #a21caf;
    border-color: #f5d0fe;
  }

  &.todo.active {
    background: #ffedd5;
    color: #c2410c;
    border-color: #fed7aa;
  }
}

.search-chip-label {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.search-chip-check {
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
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

.search-panel-enter-active,
.search-panel-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.search-panel-enter-from,
.search-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
