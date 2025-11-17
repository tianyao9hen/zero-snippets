<template>
  <div class="markdown-page" ref="markdownPage">
    <Editor
      class="editos"
      :value="mdValue"
      :plugins="mdPlugins"
      :style="editorStyle"
      :locale="zhHans"
      @change="contentEditEvent"
      :upload-images="handleUploadImages"
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
const debounceEditEvent = debounce((value: string) => {
  emits('contentEdit', value)
}, 500, {
  leading: true,
})
// 文章编辑事件
function contentEditEvent(value: string) {
  mdValue.value = value
  debounceEditEvent(value)
}

/**
 * TOOD 上传图片并展示
 * @param files 文件
 */
async function handleUploadImages(files: any) {
  let imgs: any = []
  for (let index = 0; index < files.length; index++) {
    const item = files[index]
    let fromData = new FormData()
    fromData.append('file', item)
    // let res = await uploadImage(fromData);  // 上传到阿里云
    let res = {
      url: 'https://parkossv2.sdtwxx.com/parkv2/pc/box/20250522/202552294530_%E9%B2%81Q18F3V_1747877659036.jpg'
    }
    imgs.push({
      title: item.name,
      url: res.url
    })
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
