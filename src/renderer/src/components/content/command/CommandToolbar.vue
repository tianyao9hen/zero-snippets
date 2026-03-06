<template>
  <div class="command-toolbar">
    <div class="left">
      <div class="field-group">
        <div class="label-input-row">
          <label class="label">统一执行快捷键</label>
          <div class="input-with-hint">
            <a-input
              v-model:value="localShortcut"
              class="shortcut-input"
              placeholder="请输入统一执行字符串（例如：cmdall）"
              @blur="emitUpdate"
            />
            <span class="hint">说明：仅在应用内生效，用于搜索框快速触发统一执行。</span>
          </div>
        </div>
      </div>
    </div>
    <div class="right">
      <a-space>
        <a-tooltip :title="hasUnifiedRunning ? '统一中止' : '统一执行'" :mouse-enter-delay="0.5">
          <a-button
            type="default"
            class="toolbar-icon-btn"
            @click="handleToggleUnified"
          >
            <img :src="hasUnifiedRunning ? iconMap.stop.url : iconMap.play.url" class="btn-icon" alt="" />
          </a-button>
        </a-tooltip>
        <a-dropdown :trigger="['click']">
          <a-tooltip title="新增命令" :mouse-enter-delay="0.5">
            <a-button type="default" class="toolbar-icon-btn">
              <img :src="iconMap.addArticle.url" class="btn-icon" alt="" />
              <DownOutlined class="ml-1" />
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleAddMenuClick">
              <a-menu-item key="nacos">Nacos</a-menu-item>
              <a-menu-item key="redis">Redis</a-menu-item>
              <a-menu-item key="mongodb">MongoDB</a-menu-item>
              <a-menu-item key="mqnamesrv">RocketMQ NameSrv</a-menu-item>
              <a-menu-item key="mqbroker">RocketMQ Broker</a-menu-item>
              <a-menu-divider />
              <a-menu-item key="custom">自定义命令</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-tooltip title="刷新命令列表" :mouse-enter-delay="0.5">
          <a-button class="toolbar-icon-btn" @click="$emit('refresh')">
            <img :src="iconMap.refresh.dUrl" class="btn-icon" alt="" />
          </a-button>
        </a-tooltip>
        <a-tooltip title="日志" :mouse-enter-delay="0.5">
          <a-button type="default" class="toolbar-icon-btn" @click="handleOpenLog">
            <img :src="iconMap.log.dUrl" class="btn-icon" alt="" />
          </a-button>
        </a-tooltip>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @description 命令行页面顶部工具栏
 * - 配置统一执行快捷键
 * - 提供统一执行/统一中止、新增命令下拉、刷新命令按钮
 */
import { ref, watch } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import {
  Input as AInput,
  Button as AButton,
  Space as ASpace,
  Dropdown as ADropdown,
  Menu as AMenu,
  MenuItem as AMenuItem,
  MenuDivider as AMenuDivider,
  Tooltip as ATooltip
} from 'ant-design-vue'
import type { MenuProps } from 'ant-design-vue'
import { iconMap } from '@renderer/composables/iconUtils'

/** 预制命令模板（不含 id、createTime） */
const PRESET_TEMPLATES: Record<string, Omit<CommandEntity, 'id' | 'createTime'>> = {
  nacos: {
    name: 'Nacos 启动',
    type: 'nacos',
    basePath: 'D:/Nacos/Nacos-server-2.3.0/bin',
    command: 'startup.cmd',
    stopCommand: 'shutdown.cmd',
    shortcut: 'nacos',
    allowUnified: false,
    orderNum: 0,
    remark: '请将 basePath 改为本机 Nacos bin 目录后保存。'
  },
  redis: {
    name: 'Redis 启动',
    type: 'redis',
    basePath: 'D:/Redis',
    command: 'redis-server.exe redis.windows.conf',
    stopCommand: 'redis-cli.exe shutdown',
    shortcut: 'redis',
    allowUnified: false,
    orderNum: 0,
    remark: '请将 basePath 改为本机 Redis 目录。'
  },
  mongodb: {
    name: 'MongoDB 启动',
    type: 'mongodb',
    basePath: 'D:/mongodb/mongodb-win32-x86_64-windows-8.0.4/bin',
    command: 'mongod --config ..\\conf\\mongodb.conf',
    stopCommand: 'mongod --shutdown --config ../conf/mongodb.conf',
    shortcut: 'mongo',
    allowUnified: false,
    orderNum: 0,
    remark: '请将 basePath 改为本机 MongoDB bin 目录，并确认 conf 下配置文件存在。'
  },
  mqnamesrv: {
    name: 'RocketMQ NameSrv',
    type: 'mqnamesrv',
    basePath: 'D:/rocketmq/rocketmq-all-5.3.1-bin-release/bin',
    command: 'mqnamesrv.cmd',
    stopCommand: 'mqshutdown.cmd namesrv',
    shortcut: 'mqns',
    allowUnified: true,
    orderNum: 0,
    remark: '请将 basePath 改为本机 RocketMQ bin 目录。'
  },
  mqbroker: {
    name: 'RocketMQ Broker',
    type: 'mqbroker',
    basePath: 'D:/rocketmq/rocketmq-all-5.3.1-bin-release/bin',
    command: 'mqbroker.cmd -n 127.0.0.1:9876 autoCreateTopicEnable=true',
    stopCommand: 'mqshutdown.cmd broker',
    shortcut: 'mqbroker',
    allowUnified: true,
    orderNum: 0,
    remark: '请将 basePath 改为本机 RocketMQ bin 目录，并确保 NameSrv 已启动。'
  }
}

const props = defineProps<{
  unifiedShortcut: string
  hasUnifiedRunning: boolean
}>()

const emit = defineEmits<{
  (e: 'update-unified-shortcut', value: string): void
  (e: 'run-unified'): void
  (e: 'stop-unified'): void
  (e: 'refresh'): void
  (e: 'add-command', template: Omit<CommandEntity, 'id' | 'createTime'> | null): void
}>()

const localShortcut = ref('')

watch(
  () => props.unifiedShortcut,
  (val) => {
    localShortcut.value = val
  },
  { immediate: true }
)

const emitUpdate = () => {
  emit('update-unified-shortcut', localShortcut.value)
}

const handleToggleUnified = () => {
  if (props.hasUnifiedRunning) {
    emit('stop-unified')
  } else {
    emit('run-unified')
  }
}

const handleOpenLog = () => {
  window.api.showWindow('commandLog', '/command-log')
}

const handleAddMenuClick: MenuProps['onClick'] = ({ key }) => {
  if (key === 'custom') {
    emit('add-command', null)
  } else {
    const template = PRESET_TEMPLATES[key as keyof typeof PRESET_TEMPLATES]
    emit('add-command', template ?? null)
  }
}
</script>

<style scoped>
.command-toolbar {
  @apply flex items-center justify-between gap-4;
}

.left {
  @apply flex-1 flex flex-col gap-1;
}

.right {
  @apply flex-shrink-0;
}

.field-group {
  @apply flex flex-col gap-1;
}

.label-input-row {
  @apply flex items-start gap-2;
}

.label {
  @apply text-xs text-slate-600 flex-shrink-0 pt-1.5;
}

.input-with-hint {
  @apply flex flex-col gap-1;
}

.shortcut-input {
  @apply w-64 flex-shrink-0;
}

.hint {
  @apply text-[11px] text-slate-400;
}

.toolbar-icon-btn {
  @apply flex items-center justify-center p-1;
}

.btn-icon {
  @apply w-5 h-5 block;
}
</style>
