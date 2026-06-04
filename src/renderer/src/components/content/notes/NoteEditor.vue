<template>
  <div ref="rootRef" class="note-editor" tabindex="-1">
    <Editor
      v-if="mode === 'edit'"
      class="editor-instance"
      :value="modelValue"
      :plugins="plugins"
      :style="editorStyle"
      :locale="zhHans"
      mode="tab"
      @change="handleChange"
    />
    <div
      v-else
      ref="previewRef"
      class="note-preview markdown-body"
      :style="editorStyle"
      @change="handlePreviewTaskChange"
    >
      <Viewer :value="modelValue" :plugins="plugins" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Editor, Viewer } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import gemoji from '@bytemd/plugin-gemoji'
import highlight from '@bytemd/plugin-highlight'
import frontmatter from '@bytemd/plugin-frontmatter'
import breaks from '@bytemd/plugin-breaks'
import zhHans from 'bytemd/locales/zh_Hans.json'
import { toggleMarkdownTask } from '@renderer/composables/markdownTaskList'
import 'bytemd/dist/index.css'
import '@renderer/assets/styles/github-markdown.min.css'
import 'highlight.js/styles/a11y-light.min.css'

const props = defineProps({
  // Markdown 内容
  modelValue: {
    type: String,
    default: ''
  },
  // 编辑器高度偏移量
  heightOffset: {
    type: Number,
    default: 0
  },
  // 编辑器模式：edit 为编辑，preview 为展示
  mode: {
    type: String,
    default: 'edit'
  }
})

const emit = defineEmits<{
  /** 更新 Markdown 内容 */
  (e: 'update:modelValue', val: string): void
  /** 切换 Markdown TODO 列表项 */
  (e: 'taskToggle', val: string): void
}>()

const plugins = [breaks(), frontmatter(), gemoji(), gfm(), highlight()]

const editorStyle = computed(() => {
  return {
    height: props.heightOffset ? `calc(100vh - ${props.heightOffset}px)` : '100%'
  }
})

const rootRef = ref<HTMLElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)

const getPreviewTaskCheckboxes = () => {
  return Array.from(
    previewRef.value?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? []
  )
}

/**
 * 放开 Bytemd Viewer 渲染出的 TODO 复选框，允许展示模式直接点击。
 */
const enablePreviewTaskCheckboxes = async () => {
  await nextTick()
  if (props.mode !== 'preview') return

  getPreviewTaskCheckboxes().forEach((checkbox) => {
    checkbox.disabled = false
    checkbox.removeAttribute('disabled')
  })
}

/**
 * 处理编辑器内容变化。
 * @param val 最新的 Markdown 内容
 */
const handleChange = (val: string) => {
  emit('update:modelValue', val)
}

/**
 * 处理展示模式 TODO 复选框切换。
 *
 * @param event 复选框变更事件
 */
const handlePreviewTaskChange = (event: Event) => {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return

  const taskIndex = getPreviewTaskCheckboxes().indexOf(target)
  const nextValue = toggleMarkdownTask(props.modelValue, taskIndex, target.checked)

  if (nextValue === props.modelValue) {
    target.checked = !target.checked
    return
  }

  emit('update:modelValue', nextValue)
  emit('taskToggle', nextValue)
  void enablePreviewTaskCheckboxes()
}

watch(
  () => [props.modelValue, props.mode],
  () => {
    void enablePreviewTaskCheckboxes()
  },
  { immediate: true }
)

/**
 * 聚焦编辑器根节点。
 */
function focus() {
  rootRef.value?.focus()
}

defineExpose({ focus })
</script>

<style lang="scss" scoped>
.note-editor {
  width: 100%;
  height: 100%;

  :deep(.bytemd) {
    height: 100%;
    border: none;
    background-color: transparent;
  }

  :deep(.bytemd-toolbar) {
    display: none;
  }

  :deep(.bytemd-status) {
    display: none;
  }

  :deep(.bytemd-body) {
    height: 100%;
    padding: 16px 24px;
  }

  :deep(.CodeMirror-vscrollbar) {
    width: 6px;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }
  }
}

.note-preview {
  height: 100%;
  overflow: auto;
  padding: 16px 24px;
  background: #ffffff;

  :deep(.markdown-body),
  :deep(.markdown-body ul),
  :deep(.markdown-body ol) {
    background: transparent;
  }

  :deep(.task-list-item) {
    list-style: none;
  }

  :deep(.task-list-item-checkbox) {
    margin: 0 0.35em 0.25em -1.4em;
    vertical-align: middle;
    cursor: pointer;
  }
}
</style>
