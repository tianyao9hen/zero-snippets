<template>
  <div class="command-list-wrapper">
    <a-collapse v-model:active-key="activeKeys" class="command-collapse" accordion>
      <a-collapse-panel v-for="item in commands" :key="item.id" class="command-panel">
        <template #header>
          <div class="command-panel-header">
            <div class="header-left">
              <span
                v-if="editingId !== item.id"
                class="command-name"
                @click.stop
                @dblclick.stop="startEditName(item)"
              >
                {{ item.name }}
              </span>
              <a-input
                v-else
                v-model:value="editingName"
                size="small"
                class="name-input"
                placeholder="请输入命令名称"
                @blur="saveName(item)"
                @keyup.enter.stop="saveName(item)"
                @keydown.esc.stop="cancelEditName"
                @click.stop
              />
            </div>
            <div class="header-right">
              <a-tag v-if="runningCommandIds.includes(item.id)" color="green" @click.stop>
                正在执行
              </a-tag>
              <a-tag v-else @click.stop>未执行</a-tag>
              <span class="switch-wrapper" @click.stop>
                <a-switch
                  v-model:checked="allowUnifiedMap[item.id]"
                  size="small"
                  @change="(checked) => handleAllowUnifiedChange(item.id, Boolean(checked))"
                />
                <span class="status-text">允许统一执行</span>
              </span>
              <a-button
                size="small"
                :type="runningCommandIds.includes(item.id) ? 'default' : 'primary'"
                :danger="runningCommandIds.includes(item.id)"
                @click.stop="
                  runningCommandIds.includes(item.id)
                    ? emit('stop-command', item.id)
                    : emit('run-command', item.id)
                "
              >
                {{ runningCommandIds.includes(item.id) ? '中止' : '执行' }}
              </a-button>
              <a-button
                size="small"
                danger
                :disabled="runningCommandIds.includes(item.id)"
                @click.stop="handleDelete(item)"
              >
                删除
              </a-button>
            </div>
          </div>
        </template>
        <CommandItem :command="item" @updated="emit('refresh')" />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
/**
 * @description 命令折叠面板列表
 * 使用 Ant Design Vue 的 Collapse 组件展示所有命令。
 */
import { ref, watch } from 'vue'
import {
  Collapse as ACollapse,
  CollapsePanel as ACollapsePanel,
  Tag as ATag,
  Switch as ASwitch,
  Button as AButton,
  Input as AInput,
  Modal,
  message
} from 'ant-design-vue'
import CommandItem from './CommandItem.vue'

const props = defineProps<{
  commands: CommandEntity[]
  runningCommandIds: number[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'run-command', id: number): void
  (e: 'stop-command', id: number): void
  (e: 'delete-command', id: number): void
}>()

const activeKeys = ref<number[]>([])

const allowUnifiedMap = ref<Record<number, boolean>>({})

watch(
  () => props.commands,
  (list) => {
    const map: Record<number, boolean> = {}
    list.forEach((cmd) => {
      map[cmd.id] = !!cmd.allowUnified
    })
    allowUnifiedMap.value = map
  },
  { immediate: true, deep: true }
)

const handleAllowUnifiedChange = async (id: number, checked: boolean) => {
  try {
    await window.api.updateCommand(id, { allowUnified: checked })
    emit('refresh')
  } catch (error) {
    console.error('更新统一执行标记失败:', error)
    message.error('更新统一执行标记失败')
    allowUnifiedMap.value[id] = !checked
  }
}

const editingId = ref<number | null>(null)
const editingName = ref('')

const startEditName = (item: CommandEntity) => {
  editingId.value = item.id
  editingName.value = item.name
}

const cancelEditName = () => {
  editingId.value = null
  editingName.value = ''
}

const saveName = async (item: CommandEntity) => {
  if (editingId.value !== item.id) return
  const name = editingName.value.trim()
  if (!name) {
    message.warning('命令名称不能为空')
    return
  }
  try {
    await window.api.updateCommand(item.id, { name })
    message.success('命令名称已更新')
    cancelEditName()
    emit('refresh')
  } catch (error) {
    console.error('更新命令名称失败:', error)
    message.error('更新命令名称失败')
  }
}

const handleDelete = (item: CommandEntity) => {
  if (props.runningCommandIds.includes(item.id)) return
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除命令「${item.name}」吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => emit('delete-command', item.id)
  })
}
</script>

<style scoped>
.command-list-wrapper {
  @apply flex-1 overflow-y-auto;
}

.command-collapse {
  @apply bg-white;
}

.command-panel :deep(.ant-collapse-header-text) {
  @apply w-full;
}

.command-panel-header {
  @apply flex items-center justify-between gap-3 w-full;
}

.header-left {
  @apply flex items-center gap-2 min-w-0;
}

.command-name {
  @apply text-sm font-medium text-slate-800 truncate cursor-text;
}

.stop-command {
  @apply text-[11px] text-slate-400 truncate max-w-[260px];
}

.name-input {
  @apply w-52;
}

.header-right {
  @apply flex items-center gap-2 text-xs text-slate-500;
}

.switch-wrapper {
  @apply inline-flex items-center gap-2;
}

.status-text {
  @apply text-xs text-slate-500;
}
</style>
