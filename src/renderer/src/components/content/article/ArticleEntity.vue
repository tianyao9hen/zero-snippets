<template>
  <main class="article box">
    <div hidden>{{ snippetsStore.content.selectArticleId }}</div>
    <div ref="titleRef" class="title px-2">
      <textarea
        ref="titleTextRef"
        v-model="article.title"
        class="w-full overflow-hidden resize-none p-1 outline-none"
        :class="{ unSave: unSaveFlag }"
        type="text"
        spellcheck="false"
        @input="titleInputEvent"
        @keyup.enter.prevent="titleEnterEvent"
      />
    </div>
    <div ref="categoryRef" class="category p-1 px-3 unselectable">
      {{ type?.title }} >
      <select
        v-model="article.categoryId"
        class="outline-none"
        :class="{ nocategory: article.categoryId == -1 }"
        @change="categorySelectEvent"
      >
        <option v-for="item in categoryList" :key="item.id" :value="item.id">
          {{ item.title }}
        </option>
      </select>
    </div>
    <hr />
    <div class="content p-1">
      <Bytemd
        ref="bytemdRef"
        :article-content="article?.content"
        :out-sideheader-top="outSideheaderTop"
        @content-edit="editContent"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
/**
 * 文章内容组件
 */
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import useArticle from '@renderer/hooks/useArticle'
import useType from '@renderer/hooks/useType'
import useCategory from '@renderer/hooks/useCategory'
import { useRoute, useRouter } from 'vue-router'
import Bytemd from './Bytemd.vue'

let isComponentMounted = true
const normalArticle: ContentEntity = {
  id: 0,
  uniqueId: '',
  typeId: 0,
  categoryId: 0,
  title: '',
  content: ''
}

const article = ref<ContentEntity>(normalArticle)
const typeList = ref<TypeEntity[]>([])
const type = ref<TypeEntity>()
const categoryList = ref<CategoryEntity[]>([])
const category = ref<CategoryEntity>()
// 是否修改了文章标题且没有保存
const unSaveFlag = ref(false)
// 修改前的文章标题
let oldArticleTitle = ''

const { getArticleById, editArticle } = useArticle()
const { getAllTypeList } = useType()
const { getAllCategoryList } = useCategory()
const titleTextRef = ref<HTMLTextAreaElement>()
const titleRef = ref<HTMLDivElement>()
const categoryRef = ref<HTMLDivElement>()
const bytemdRef = ref<typeof Bytemd>()
const snippetsStore = useSnippetsStore()
const router = useRouter()
const route = useRoute()
const outSideheaderTop = ref(0)

onMounted(async () => {
  // 获取文章内容
  const data = await getArticleById(Number(route.params.aid))
  if (isComponentMounted) {
    article.value = data || normalArticle
    oldArticleTitle = article.value.title
    snippetsStore.choiceArticle(article.value)
    // 将文章内容同步给bytemd组件
    bytemdRef.value?.setArticleContentEvent(article.value.content)
  }
  // 获取category列表
  categoryList.value = await getAllCategoryList()
  category.value = categoryList.value.filter((item) => {
    return item.id === article?.value?.categoryId
  })[0]
  // 获取type列表
  typeList.value = await getAllTypeList()
  type.value = typeList.value.filter((item) => {
    return item.id === article?.value?.typeId
  })[0]
  // 调整title输入框高度
  autoResizeTitleInput()
  // 监听窗口大小改变，调整title输入框高度
  window.addEventListener('resize', autoResizeTitleInput)
})

onUnmounted(() => {
  isComponentMounted = false
  window.removeEventListener('resize', autoResizeTitleInput)
})

/**
 * 接受文章编辑事件
 * @param content 新文章内容
 */
function editContent(content: string) {
  article.value.content = content
  editArticle(article.value)
}

/**
 * title输入框回车事件
 */
// eslint-disable-next-line
function titleEnterEvent(_e: KeyboardEvent) {
  editArticle(article.value)
  refreshUrl()
}

/**
 * title输入框输入事件
 */
function titleInputEvent() {
  article.value.title = article.value.title.replace(/[\r\n]+/g, '')
  unSaveFlag.value = article.value.title !== oldArticleTitle
  autoResizeTitleInput()
}

/**
 * category选择事件
 */
function categorySelectEvent() {
  editArticle(article.value)
  refreshUrl()
}

/**
 * 刷新url
 */
function refreshUrl() {
  router.push({
    name: 'article',
    params: {
      tid: article.value.typeId,
      cid: article.value.categoryId,
      aid: article.value.id
    },
    query: {
      t: Date.now()
    }
  })
}

/**
 * 调整title输入框高度
 */
function autoResizeTitleInput() {
  const textarea = titleTextRef.value
  if (textarea == null) return
  nextTick(() => {
    textarea.style.height = '38px'
    textarea.style.height = textarea.scrollHeight + 'px'
    const titleHeight = titleRef.value?.offsetHeight || 0
    const categoryHeight = categoryRef.value?.offsetHeight || 0
    outSideheaderTop.value = titleHeight + categoryHeight
  })
}
</script>

<style lang="scss" scoped>
.article {
  display: flex;
  flex-direction: column;
  .title {
    font-size: 20px;
    font-weight: bold;
    textarea {
      word-wrap: break-word; /* 单词换行 */
      white-space: pre-wrap; /* 保留空白符，自动换行 */
      word-break: break-all; /* 允许在单词内换行 */
    }
    .unSave {
      // 下滑虚线
      text-decoration-style: dashed;
      text-decoration-line: underline;
      text-underline-offset: 5px;
    }
  }
  .category {
    font-size: 12px;
    select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none; /*去掉下拉箭头*/
      cursor: pointer;
    }
    .nocategory {
      border-bottom: 2px dashed #ccc;
      @apply border-slate-300;
    }
  }
  .content {
    font-size: 16px;
    width: 100%;
    flex: 1;
    textarea {
      width: 100%;
      height: 100%;
      padding: 5px;
    }
  }
}
</style>
