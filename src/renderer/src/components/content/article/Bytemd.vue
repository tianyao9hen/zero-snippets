<template>
  <div ref="markdownPage" class="markdown-page">
    <Editor
      class="editos"
      :value="mdValue"
      :plugins="mdPlugins"
      :style="editorStyle"
      :locale="zhHans"
      :upload-images="handleUploadImages"
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
import mermaid from '@bytemd/plugin-mermaid'
import 'bytemd/dist/index.css'
import 'juejin-markdown-themes/dist/github.min.css'
import 'highlight.js/styles/a11y-light.min.css'
import { debounce } from '@renderer/composables/debounceUtils'
import { message } from 'ant-design-vue'
import { useSettingStore } from '@renderer/store/settingStore'
import { SettingKey } from '@renderer/enums'

// 编辑器插件
const mdPlugins = ref([
  breaks(),
  frontmatter(),
  gemoji(),
  gfm(),
  highlight(),
  math(),
  mermaid(),
  mediumZoom()
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

/**
 * 上传图片并展示
 * @param files 文件
 */
async function handleUploadImages(files: File[]) {
  const settingStore = useSettingStore()
  if (!settingStore.isLoaded) {
    await settingStore.loadSettings()
  }

  const region = settingStore.getSetting(SettingKey.OSS_REGION)
  const accessKeyId = settingStore.getSetting(SettingKey.OSS_ACCESS_KEY_ID)
  const accessKeySecret = settingStore.getSetting(SettingKey.OSS_ACCESS_KEY_SECRET)
  const bucket = settingStore.getSetting(SettingKey.OSS_BUCKET)

  if (!region || !accessKeyId || !accessKeySecret || !bucket) {
    message.warning('请先在设置页面的“知识库”中配置阿里云 OSS 信息')
    return []
  }

  const hide = message.loading('正在上传图片...', 0)
  const imgs: { title: string; url: string }[] = []
  try {
    for (let index = 0; index < files.length; index++) {
      const item = files[index]
      try {
        const arrayBuffer = await item.arrayBuffer()
        const result = await window.api.uploadToOss({
          config: {
            region,
            accessKeyId,
            accessKeySecret,
            bucket,
            secure: true
          } as OssConfig,
          fileInfo: {
            name: `images/${Date.now()}_${item.name}`,
            buffer: arrayBuffer
          }
        })

        if (result.success && result.url) {
          imgs.push({
            title: item.name,
            url: result.url
          })
        } else {
          throw new Error(result.error || '上传失败')
        }
      } catch (error) {
        console.error('Upload failed:', error)
        message.error(`图片 ${item.name} 上传失败: ${(error as Error).message}`)
      }
    }
  } finally {
    hide()
  }
  return imgs
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
