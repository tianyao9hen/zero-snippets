<template>
  <div class="command-page w-full h-full pr-2">
    <div class="command-layout box">
      <div class="box-title flex items-center justify-between">
        <div>
          <span class="tip-text">命令行 · 管理并执行常用 Windows 命令</span>
        </div>
      </div>
      <div class="box-content">
        <CommandToolbar
          :unified-shortcut="unifiedShortcut"
          :has-unified-running="hasUnifiedRunning"
          @update-unified-shortcut="handleUpdateUnifiedShortcut"
          @run-unified="handleRunUnified"
          @stop-unified="handleStopUnified"
          @refresh="loadCommands"
          @add-command="handleAddCommand"
        />
        <CommandList
          :commands="commands"
          :running-command-ids="runningCommandIds"
          @refresh="loadCommands"
          @run-command="handleRunCommand"
          @stop-command="handleStopCommand"
          @delete-command="handleDeleteCommand"
        />
      </div>
    </div>
    <AddCommandModal
      v-model:open="addModalOpen"
      :template="addTemplate"
      @save="handleSaveNewCommand"
      @cancel="addModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @description 命令行主页面组件
 * - 负责加载命令配置、统一执行快捷键，并协调工具栏与命令列表。
 */
import { ref, onMounted, computed } from 'vue'
import { useSettingStore } from '@renderer/store/settingStore'
import CommandToolbar from './command/CommandToolbar.vue'
import CommandList from './command/CommandList.vue'
import AddCommandModal from './command/AddCommandModal.vue'
import { message } from 'ant-design-vue'

const settingStore = useSettingStore()

const commands = ref<CommandEntity[]>([])
const runningCommandIds = ref<number[]>([])
const addModalOpen = ref(false)
const addTemplate = ref<Omit<CommandEntity, 'id' | 'createTime'> | null>(null)

// 统一执行快捷键存储 key
const UNIFIED_SHORTCUT_KEY = 'command.unifiedShortcut'

const unifiedShortcut = computed(() =>
  settingStore.getSettingWithDefault(UNIFIED_SHORTCUT_KEY, 'cmdall')
)

// 是否存在“允许统一执行”且当前正在运行的命令，用于控制按钮文案（统一执行 / 统一中止）
const hasUnifiedRunning = computed(() =>
  commands.value.some((cmd) => cmd.allowUnified && runningCommandIds.value.includes(cmd.id))
)

/**
 * @description 加载命令列表
 */
const loadCommands = async () => {
  try {
    const list = await window.api.listCommands()
    commands.value = list
  } catch (error) {
    console.error('加载命令失败:', error)
    message.error('加载命令失败')
  }
}

/**
 * @description 刷新正在运行的命令ID列表
 */
const refreshRunningCommands = async () => {
  try {
    const running = await window.api.getRunningCommands()
    runningCommandIds.value = running.map((item) => item.commandId)
  } catch (error) {
    console.error('获取运行中命令失败:', error)
  }
}

/**
 * @description 更新统一执行快捷键（同步到设置表）
 */
const handleUpdateUnifiedShortcut = async (value: string) => {
  if (!value.trim()) {
    message.warning('统一执行快捷键不能为空')
    return
  }
  await settingStore.setSetting(UNIFIED_SHORTCUT_KEY, value.trim(), '命令行统一执行快捷键')
  message.success('统一执行快捷键已保存')
}

/**
 * @description 执行单个命令
 */
const handleRunCommand = async (commandId: number) => {
  try {
    await window.api.runCommand(commandId)
    await refreshRunningCommands()
    // 从 content 打开日志窗口时不隐藏 content，仅打开/聚焦 commandLog
    window.api.showWindow('commandLog', '/command-log')
  } catch (error) {
    console.error('执行命令失败:', error)
    message.error('执行命令失败，请检查命令配置')
  }
}

/**
 * @description 统一执行所有允许统一执行的命令
 */
const handleRunUnified = async () => {
  try {
    await window.api.runUnifiedCommands()
    await refreshRunningCommands()
    window.api.showWindow('commandLog', '/command-log')
  } catch (error) {
    console.error('统一执行命令失败:', error)
    message.error('统一执行命令失败')
  }
}

/**
 * @description 统一中止所有允许统一执行的命令
 */
const handleStopUnified = async () => {
  try {
    await window.api.stopUnifiedCommands()
    await refreshRunningCommands()
  } catch (error) {
    console.error('统一中止命令失败:', error)
    message.error('统一中止命令失败')
  }
}

/**
 * @description 中止单个命令（由 CommandList 转发）
 */
const handleStopCommand = async (commandId: number) => {
  try {
    await window.api.stopCommand(commandId)
    await refreshRunningCommands()
  } catch (error) {
    console.error('中止命令失败:', error)
    message.error('中止命令失败')
  }
}

/**
 * @description 打开新增命令弹窗（带预制模板或自定义）
 */
const handleAddCommand = (template: Omit<CommandEntity, 'id' | 'createTime'> | null) => {
  addTemplate.value = template
  addModalOpen.value = true
}

/**
 * @description 保存新增命令
 */
const handleSaveNewCommand = async (entity: Omit<CommandEntity, 'id' | 'createTime'>) => {
  try {
    await window.api.addCommand(entity)
    message.success('命令已添加')
    addModalOpen.value = false
    addTemplate.value = null
    await loadCommands()
  } catch (error) {
    console.error('添加命令失败:', error)
    message.error('添加命令失败')
  }
}

/**
 * @description 删除命令（由 CommandList 转发）
 */
const handleDeleteCommand = async (commandId: number) => {
  try {
    await window.api.removeCommand(commandId)
    message.success('命令已删除')
    await loadCommands()
    await refreshRunningCommands()
  } catch (error) {
    console.error('删除命令失败:', error)
    message.error('删除命令失败')
  }
}

onMounted(async () => {
  if (!settingStore.isLoaded) {
    await settingStore.loadSettings()
  }
  await loadCommands()
  await refreshRunningCommands()
})
</script>

<style scoped>
.command-layout {
  @apply w-full h-full flex flex-col;
}

.box-content {
  @apply flex-1 p-3 flex flex-col gap-3 overflow-hidden;
}

.tip-text {
  @apply text-xs text-slate-400 ml-1;
}
</style>
