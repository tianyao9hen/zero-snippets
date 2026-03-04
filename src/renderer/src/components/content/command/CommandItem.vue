<template>
  <div class="command-item">
    <div class="body">
      <div class="field">
        <span class="label">执行快捷键：</span>
        <div class="field-content">
          <a-input
            v-model:value="localShortcut"
            class="input-short"
            placeholder="例如：nc / rd / 自定义"
            @blur="saveShortcut"
          />
        </div>
      </div>
      <div v-if="command.type === 'custom'" class="field">
        <span class="label">启动命令：</span>
        <div class="field-content">
          <a-textarea
            v-model:value="localCommand"
            :rows="2"
            placeholder="请输入启动命令，例如：cmd /c echo hello"
            @blur="saveCommand"
          />
        </div>
      </div>
      <div v-else class="field">
        <span class="label">软件路径：</span>
        <div class="field-content">
          <a-input
            v-model:value="localBasePath"
            placeholder="请选择或输入软件安装目录"
            @blur="saveBasePath"
          />
          <span class="example">
            示例命令仅供参考，实际执行以当前路径与命令内容为准，请根据自身环境调整路径。
          </span>
        </div>
      </div>
      <div v-if="command.type !== 'custom'" class="field">
        <span class="label">启动命令预览：</span>
        <div class="field-content">
          <code class="command-preview" :title="previewCommand">{{ previewCommand }}</code>
        </div>
      </div>
      <div v-if="command.type !== 'custom'" class="field">
        <span class="label">关闭命令预览：</span>
        <div class="field-content">
          <code class="command-preview" :title="previewStopCommand">
            {{ previewStopCommand }}
          </code>
        </div>
      </div>
      <div v-if="command.type === 'custom'" class="field">
        <span class="label">关闭命令：</span>
        <div class="field-content">
          <a-textarea
            v-model:value="localStopCommand"
            :rows="2"
            placeholder="中止时执行的关闭命令（可选）"
            @blur="saveStopCommand"
          />
        </div>
      </div>
      <div class="field">
        <span class="label">说明：</span>
        <div class="field-content">
          <a-input v-model:value="localRemark" placeholder="可填写备注说明" @blur="saveRemark" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @description 单条命令详情
 * 展示命令快捷键、命令内容、基础路径与说明等。
 */
import { ref, watch, computed } from 'vue'
import { message, Input as AInput, Textarea as ATextarea } from 'ant-design-vue'

const props = defineProps<{
  command: CommandEntity
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const localShortcut = ref('')
const localBasePath = ref('')
const localCommand = ref('')
const localStopCommand = ref('')
const localRemark = ref('')

watch(
  () => props.command,
  (val) => {
    localShortcut.value = val.shortcut || ''
    localBasePath.value = val.basePath || ''
    localCommand.value = val.command
    localStopCommand.value = val.stopCommand || ''
    localRemark.value = val.remark || ''
  },
  { immediate: true, deep: true }
)

const previewCommand = computed(() => {
  const basePath = props.command.basePath?.trim()
  const cmd = props.command.command?.trim() ?? ''
  if (!cmd) return ''
  if (basePath) {
    return `cd "${basePath}" && ${cmd}`
  }
  return cmd
})

const previewStopCommand = computed(() => {
  const basePath = props.command.basePath?.trim()
  const stop = props.command.stopCommand?.trim() ?? ''
  if (!stop) return ''
  if (basePath) {
    return `cd "${basePath}" && ${stop}`
  }
  return stop
})

const saveShortcut = async () => {
  try {
    await window.api.updateCommand(props.command.id, { shortcut: localShortcut.value.trim() })
    emit('updated')
  } catch (error) {
    console.error('保存快捷键失败:', error)
    message.error('保存快捷键失败')
  }
}

const saveBasePath = async () => {
  try {
    await window.api.updateCommand(props.command.id, { basePath: localBasePath.value.trim() })
    emit('updated')
  } catch (error) {
    console.error('保存路径失败:', error)
    message.error('保存路径失败')
  }
}

const saveCommand = async () => {
  if (!localCommand.value.trim()) {
    message.warning('命令内容不能为空')
    return
  }
  try {
    await window.api.updateCommand(props.command.id, { command: localCommand.value.trim() })
    emit('updated')
  } catch (error) {
    console.error('保存命令失败:', error)
    message.error('保存命令失败')
  }
}

const saveStopCommand = async () => {
  try {
    await window.api.updateCommand(props.command.id, {
      stopCommand: localStopCommand.value.trim()
    })
    emit('updated')
  } catch (error) {
    console.error('保存关闭命令失败:', error)
    message.error('保存关闭命令失败')
  }
}

const saveRemark = async () => {
  try {
    await window.api.updateCommand(props.command.id, { remark: localRemark.value.trim() })
    emit('updated')
  } catch (error) {
    console.error('保存说明失败:', error)
    message.error('保存说明失败')
  }
}
</script>

<style scoped>
.command-item {
  @apply border border-slate-200 rounded-lg p-3 flex flex-col gap-3;
}

.body {
  @apply flex flex-col gap-2 text-xs text-slate-600;
}

.field {
  @apply flex items-start gap-2;
}

.label {
  @apply w-24 text-right text-slate-500 leading-6;
}

.field-content {
  @apply flex-1 flex flex-col gap-1;
}

.input-short {
  @apply w-48;
}

.command-preview {
  @apply bg-slate-900 text-slate-100 px-2 py-1 rounded text-[11px] max-w-full whitespace-pre-wrap break-all max-h-16 overflow-y-auto;
}

.example {
  @apply text-[11px] text-slate-400;
}
</style>
