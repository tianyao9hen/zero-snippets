<template>
  <a-modal
    v-model:open="openState"
    title="新增命令"
    :width="520"
    :mask-closable="false"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form layout="vertical" :model="form">
      <a-form-item label="命令名称" required>
        <a-input v-model:value="form.name" placeholder="例如：Nacos 启动" />
      </a-form-item>
      <a-form-item v-if="isCustom" label="命令类型">
        <a-input value="自定义命令" disabled />
      </a-form-item>
      <a-form-item v-else label="命令类型">
        <a-input :value="presetTypeLabel" disabled />
      </a-form-item>
      <a-form-item v-if="!isCustom" label="软件路径">
        <a-input
          v-model:value="form.basePath"
          placeholder="例如：D:/Nacos/Nacos-server-2.3.0/bin"
        />
      </a-form-item>
      <a-form-item label="执行命令" required>
        <a-textarea
          v-model:value="form.command"
          :rows="3"
          placeholder="预设类型为在软件路径下执行的命令；自定义类型请填写完整命令"
        />
      </a-form-item>
      <a-form-item label="执行快捷键">
        <a-input
          v-model:value="form.shortcut"
          placeholder="例如：nc、redis，留空则仅通过名称搜索"
        />
      </a-form-item>
      <a-form-item v-if="isCustom" label="关闭命令">
        <a-input
          v-model:value="form.stopCommand"
          placeholder="中止时执行的关闭命令（可选）"
        />
      </a-form-item>
      <a-form-item label="说明">
        <a-textarea v-model:value="form.remark" :rows="2" placeholder="选填，用于提示用途" />
      </a-form-item>
      <a-form-item>
        <a-checkbox v-model:checked="form.allowUnified">允许统一执行</a-checkbox>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
/**
 * @description 新增命令弹窗
 * 根据传入的 template 预填表单：预设类型展示软件路径+命令，自定义类型仅展示完整命令。
 */
import { ref, watch, computed } from 'vue'
import {
  Modal as AModal,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Textarea as ATextarea,
  Checkbox as ACheckbox,
  message
} from 'ant-design-vue'

const props = defineProps<{
  open: boolean
  /** 预制模板，null 表示自定义命令 */
  template: Omit<CommandEntity, 'id' | 'createTime'> | null
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'save', entity: Omit<CommandEntity, 'id' | 'createTime'>): void
  (e: 'cancel'): void
}>()

const openState = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const isCustom = computed(() => !props.template || props.template.type === 'custom')

const presetTypeLabel = computed(() => {
  const t = props.template?.type
  const map: Record<string, string> = {
    nacos: 'Nacos',
    redis: 'Redis',
    mongodb: 'MongoDB',
    mqnamesrv: 'RocketMQ NameSrv',
    mqbroker: 'RocketMQ Broker'
  }
  return t ? map[t] || t : ''
})

const form = ref({
  name: '',
  type: 'custom',
  basePath: '',
  command: '',
  shortcut: '',
  stopCommand: '',
  allowUnified: false,
  remark: ''
})

watch(
  () => [props.open, props.template] as const,
  ([open, template]) => {
    if (open) {
      if (template) {
        form.value = {
          name: template.name,
          type: template.type,
          basePath: template.basePath ?? '',
          command: template.command,
          shortcut: template.shortcut ?? '',
          stopCommand: template.stopCommand ?? '',
          allowUnified: !!template.allowUnified,
          remark: template.remark ?? ''
        }
      } else {
        form.value = {
          name: '',
          type: 'custom',
          basePath: '',
          command: '',
          shortcut: '',
          stopCommand: '',
          allowUnified: false,
          remark: ''
        }
      }
    }
  },
  { immediate: true }
)

function handleOk() {
  const name = form.value.name.trim()
  const command = form.value.command.trim()
  const stopCommand = form.value.stopCommand.trim()
  if (!name) {
    message.warning('请输入命令名称')
    return
  }
  if (!command) {
    message.warning('请输入执行命令')
    return
  }
  emit('save', {
    name,
    type: form.value.type,
    basePath: form.value.basePath.trim() || undefined,
    command,
    shortcut: form.value.shortcut.trim() || undefined,
    stopCommand: stopCommand || undefined,
    allowUnified: form.value.allowUnified,
    orderNum: 0,
    remark: form.value.remark.trim() || undefined
  })
  emit('update:open', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:open', false)
}
</script>

<style scoped></style>
