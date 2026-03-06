<template>
  <div class="command-log-tabs">
    <div class="box-title flex items-center justify-between">
      <span class="unselectable">正在执行的命令</span>
      <a-space>
        <a-tooltip title="全部中止" :mouse-enter-delay="0.5">
          <a-button size="small" type="default" class="toolbar-icon-btn" @click="handleStopAll">
            <img :src="iconMap.stop.url" class="btn-icon" alt="" />
          </a-button>
        </a-tooltip>
        <a-tooltip title="刷新列表" :mouse-enter-delay="0.5">
          <a-button size="small" type="default" class="toolbar-icon-btn" @click="refreshRunningCommands">
            <img :src="iconMap.refresh.dUrl" class="btn-icon" alt="" />
          </a-button>
        </a-tooltip>
      </a-space>
    </div>
    <div class="box-content">
      <a-tabs
        v-model:active-key="activeInstanceId"
        type="editable-card"
        hide-add
        class="flex-1 flex flex-col overflow-hidden"
        @edit="handleEditTab"
      >
        <a-tab-pane
          v-for="item in runningList"
          :key="item.instanceId"
          :tab="item.title + (item.exited ? ' (已退出)' : '')"
          :closable="true"
        >
          <div class="tab-header">
            <div class="info">
              <span class="name">{{ item.title }}</span>
              <span v-if="item.shortcut" class="shortcut">快捷键：{{ item.shortcut }}</span>
              <span v-if="item.allowUnified" class="tag-unified">统一执行</span>
              <span v-if="item.exited" class="tag-exited">
                已退出{{ item.exitCode != null ? `(${item.exitCode})` : '' }}
              </span>
            </div>
            <a-tooltip v-if="!item.exited" title="中止该命令" :mouse-enter-delay="0.5">
              <a-button size="small" type="default" class="tab-stop-btn" @click="handleStopInstance(item)">
                <img :src="iconMap.stop.url" class="btn-icon" alt="" />
              </a-button>
            </a-tooltip>
          </div>
          <div ref="logContainerRef" class="log-container">
            <pre v-for="(log, index) in logs" :key="index" class="log-line">
              <span class="time">{{ formatTime(log.time) }}</span>
              <span :class="['source', log.source]">
                {{ log.source === 'stdout' ? 'OUT' : 'ERR' }}
              </span>
              <span class="text">{{ log.line }}</span>
            </pre>
          </div>
        </a-tab-pane>
      </a-tabs>
      <div v-if="runningList.length === 0" class="empty-tip">
        当前没有正在执行的命令。可在命令行模块中点击执行按钮后查看日志。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @description 命令日志标签页组件
 * - 左侧为正在执行的命令列表，以标签形式展示。
 * - 每个标签内展示对应命令的标准输出和错误输出。
 */
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Tabs as ATabs,
  TabPane as ATabPane,
  Button as AButton,
  Space as ASpace,
  Tooltip as ATooltip,
  message
} from 'ant-design-vue'
import { iconMap } from '@renderer/composables/iconUtils'

const runningList = ref<
  {
    instanceId: string
    commandId: number
    title: string
    shortcut?: string
    allowUnified: boolean
    exited: boolean
    exitCode: number | null
  }[]
>([])

const activeInstanceId = ref<string>('')
const logs = ref<
  {
    time: number
    source: 'stdout' | 'stderr'
    line: string
  }[]
>([])

const logContainerRef = ref<HTMLDivElement | null>(null)

/**
 * @description 中止当前 tab 对应的命令
 */
const handleStopInstance = async (item: (typeof runningList.value)[number]) => {
  if (item.exited) return
  try {
    await window.api.stopCommand(item.commandId)
    message.success('已发送中止')
    await refreshRunningCommands()
  } catch (error) {
    console.error('中止命令失败:', error)
    message.error('中止命令失败')
  }
}

/**
 * @description 全部中止：中止所有正在运行的命令并刷新列表
 */
const handleStopAll = async () => {
  try {
    await window.api.stopUnifiedCommands()
    message.success('已发送全部中止')
    await refreshRunningCommands()
  } catch (error) {
    console.error('全部中止失败:', error)
    message.error('全部中止失败')
  }
}

/**
 * @description 刷新正在运行的命令列表
 */
const refreshRunningCommands = async () => {
  try {
    const list = await window.api.getRunningCommands()
    runningList.value = list
    if (list.length > 0) {
      if (
        !activeInstanceId.value ||
        !list.find((item) => item.instanceId === activeInstanceId.value)
      ) {
        activeInstanceId.value = list[0].instanceId
      }
      await loadLogs()
    } else {
      activeInstanceId.value = ''
      logs.value = []
    }
  } catch (error) {
    console.error('加载运行中命令失败:', error)
    message.error('加载运行中命令失败')
  }
}

/**
 * @description 加载当前活动实例的日志
 */
const loadLogs = async () => {
  if (!activeInstanceId.value) {
    logs.value = []
    return
  }
  try {
    const result = await window.api.getCommandLogs(activeInstanceId.value)
    logs.value = result
    scrollToBottom()
  } catch (error) {
    console.error('获取命令日志失败:', error)
  }
}

/**
 * @description 滚动到底部，方便查看最新日志
 */
const scrollToBottom = () => {
  const el = logContainerRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

/**
 * @description 处理关闭标签事件
 */
const handleEditTab = async (
  targetKey: string | number | MouseEvent | KeyboardEvent,
  action: 'add' | 'remove'
) => {
  if (action !== 'remove') return
  const key =
    typeof targetKey === 'string' || typeof targetKey === 'number' ? String(targetKey) : ''
  if (!key) return
  try {
    await window.api.dismissCommandInstance(key)
  } catch (error) {
    console.error('关闭命令实例失败:', error)
  }
  await refreshRunningCommands()
}

/**
 * @description 格式化时间戳为 HH:mm:ss
 */
const formatTime = (time: number): string => {
  const date = new Date(time)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

onMounted(async () => {
  await refreshRunningCommands()
  window.electron.ipcRenderer.on('command-log-updated', handleCommandLogUpdated)
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeListener('command-log-updated', handleCommandLogUpdated)
})

const handleCommandLogUpdated = async () => {
  await refreshRunningCommands()
}

watch(
  () => activeInstanceId.value,
  async () => {
    await loadLogs()
  }
)
</script>

<style scoped>
.command-log-tabs {
  @apply w-full h-full flex flex-col p-1 rounded-lg shadow-md bg-white;
}

:deep(.ant-tabs) {
  @apply flex-1 flex flex-col min-h-0;
}

:deep(.ant-tabs-nav) {
  @apply flex-shrink-0;
}

:deep(.ant-tabs-content-holder) {
  @apply flex-1 min-h-0;
}

:deep(.ant-tabs-content) {
  @apply h-full;
}

:deep(.ant-tabs-tabpane) {
  @apply h-full flex flex-col min-h-0;
}

.box-title {
  @apply text-sm font-medium text-slate-700 px-3 py-2 border-b border-slate-200 flex-shrink-0;
}

.box-content {
  @apply flex-1 min-h-0 flex flex-col bg-white rounded-b-lg shadow-sm;
}

.tab-header {
  @apply px-3 py-2 border-b border-slate-100 flex items-center justify-between flex-shrink-0 gap-2;
}

.tab-stop-btn {
  @apply flex items-center justify-center p-1 flex-shrink-0;
}

.tab-stop-btn .btn-icon {
  @apply w-4 h-4 block;
}

.info {
  @apply flex items-center gap-3 text-xs text-slate-600;
}

.name {
  @apply font-medium text-slate-800;
}

.shortcut {
  @apply px-2 py-0.5 rounded bg-slate-100;
}

.tag-unified {
  @apply px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[11px] border border-emerald-200;
}

.tag-exited {
  @apply px-2 py-0.5 rounded bg-red-50 text-red-600 text-[11px] border border-red-200;
}

.log-container {
  @apply flex-1 min-h-0 px-3 py-0.5 overflow-auto bg-slate-900 rounded-b-lg text-[11px] font-mono text-slate-100;
}

.log-line {
  @apply m-0 flex items-start gap-1 whitespace-pre-wrap break-all;
  line-height: 0.5;
}

.time {
  @apply text-slate-500 min-w-[56px] flex-shrink-0;
  line-height: 0.5;
}

.source {
  @apply text-[10px] px-1 rounded flex-shrink-0;
  line-height: 0.5;
}

.source.stdout {
  @apply bg-sky-700 text-sky-50;
}

.source.stderr {
  @apply bg-rose-700 text-rose-50;
}

.text {
  @apply flex-1;
  line-height: 1.15;
}

.empty-tip {
  @apply px-3 py-2 text-xs text-slate-500;
}

.toolbar-icon-btn {
  @apply flex items-center justify-center p-1;
}

.btn-icon {
  @apply w-4 h-4 block;
}
</style>

