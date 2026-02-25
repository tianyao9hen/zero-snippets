<template>
  <div class="note-editor">
    <Editor
      class="editor-instance"
      :value="modelValue"
      :plugins="plugins"
      :style="editorStyle"
      :locale="zhHans"
      mode="tab"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 随手记专用 Markdown 编辑器
 * 特点：无工具栏、无预览、纯文本编辑体验
 */
import { computed } from 'vue'
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import gemoji from '@bytemd/plugin-gemoji'
import highlight from '@bytemd/plugin-highlight'
import frontmatter from '@bytemd/plugin-frontmatter'
import breaks from '@bytemd/plugin-breaks'
import zhHans from 'bytemd/locales/zh_Hans.json'
import 'bytemd/dist/index.css'
import 'juejin-markdown-themes/dist/github.min.css'
import 'highlight.js/styles/a11y-light.min.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  heightOffset: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const plugins = [breaks(), frontmatter(), gemoji(), gfm(), highlight()]

const editorStyle = computed(() => {
  return {
    height: props.heightOffset ? `calc(100vh - ${props.heightOffset}px)` : '100%'
  }
})

const handleChange = (val: string) => {
  emit('update:modelValue', val)
}
</script>

<style lang="scss" scoped>
.note-editor {
  width: 100%;
  height: 100%;

  :deep(.bytemd) {
    height: 100%;
    border: none;
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

  // Custom scrollbar
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
</style>
