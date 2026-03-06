<template>
  <div ref="markdownPage" class="markdown-page">
    <Editor
      class="editos"
      :value="mdValue"
      :plugins="mdPlugins"
      :style="editorStyle"
      :locale="zhHans"
      :upload-images="undefined"
      @change="contentEditEvent"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 基于Bytemd的markdown编辑器
 */
import { computed, onMounted, ref } from 'vue'
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import gemoji from '@bytemd/plugin-gemoji'
import highlight from '@bytemd/plugin-highlight'
import frontmatter from '@bytemd/plugin-frontmatter'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import breaks from '@bytemd/plugin-breaks'
import zhHans from 'bytemd/locales/zh_Hans.json'
import math from '@bytemd/plugin-math'
import { createImageUploadPlugin } from '@renderer/plugins/imageUploadPlugin'
import 'bytemd/dist/index.css'
import '@renderer/assets/styles/github-markdown.min.css'
import 'highlight.js/styles/a11y-light.min.css'
import { debounce } from '@renderer/composables/debounceUtils'
import { message } from 'ant-design-vue'
import { useSettingStore } from '@renderer/store/settingStore'
import { SettingKey } from '@renderer/enums'

// 使用 Electron dialog 选择图片，开发/打包行为一致，避免 packaged 下 input[type=file] 白屏
const imageUploadPlugin = createImageUploadPlugin({
  onConfigMissing: () => {
    message.warning('请先在设置页面的“知识库”中配置阿里云 OSS 信息')
  },
  onUploadStart: () => message.loading('正在上传图片...', 0),
  getOssConfig: async () => {
    const store = useSettingStore()
    if (!store.isLoaded) await store.loadSettings()
    const region = store.getSetting(SettingKey.OSS_REGION)
    const accessKeyId = store.getSetting(SettingKey.OSS_ACCESS_KEY_ID)
    const accessKeySecret = store.getSetting(SettingKey.OSS_ACCESS_KEY_SECRET)
    const bucket = store.getSetting(SettingKey.OSS_BUCKET)
    const pathPrefix = store.getSetting(SettingKey.OSS_PATH_PREFIX)
    if (!region || !accessKeyId || !accessKeySecret || !bucket) return null
    return {
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
      secure: true,
      pathPrefix: pathPrefix || undefined
    } as OssConfig
  }
})

// 编辑器插件
const mdPlugins = ref([
  breaks(),
  frontmatter(),
  gemoji(),
  gfm(),
  highlight(),
  math(),
  mediumZoom(),
  imageUploadPlugin
])

// 文章内容
const mdValue = ref('')

// 编辑器动态高度
const editorStyle = computed(() => {
  // 这里的38像素是编辑器头部快捷按钮的高度和底部的间隔空间的和
  const offsetHeight = props.outSideheaderTop + 38
  return {
    height: `calc(100vh - ${offsetHeight}px)`
  }
})

// 组件属性
const props = defineProps({
  // 外部组件头部的高度,单位:像素
  outSideheaderTop: {
    type: Number,
    default: 72
  },
  // 传入文章内容
  articleContent: {
    type: String,
    default: ''
  }
})

const emits = defineEmits(['contentEdit', 'setArticleContent'])

onMounted(() => {
  // 设置文章内容
  mdValue.value = props.articleContent
})

// 设置文章内容事件,由父组件调用
function setArticleContentEvent(content: string) {
  mdValue.value = content
}

// 定义防抖函数
const debounceEditEvent = debounce(
  (value: string) => {
    emits('contentEdit', value)
  },
  500,
  {
    leading: true
  }
)
// 文章编辑事件
function contentEditEvent(value: string) {
  mdValue.value = value
  debounceEditEvent(value)
}

defineExpose({
  setArticleContentEvent
})
</script>

<style lang="scss" scoped>
.markdown-body ol li {
  padding-left: 6px;
  list-style-type: decimal;
}
.markdown-page {
  width: 100%;
  height: 100%;
  .editos {
    width: 100%;
    // height: calc(100vh - 110px); // 后续需要修改为监听高度 calc(100vh - ???)
    :deep() {
      .bytemd {
        height: 100% !important;
      }
    }
  }
}
</style>
