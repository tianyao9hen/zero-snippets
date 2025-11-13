<template>
  <main class="article box">
    <!-- {{ snippetsStore.content.selectArticleId }} -->
    <div class="title">
      {{ article?.title }}
    </div>
    <div class="category unselectable">
      {{ type?.title }} / {{ category?.title }}
    </div>
    <hr />
    <div class="content">
      <textarea
        name="content"
        :id="article?.id + ''"
        :value="article?.content"
      ></textarea>
    </div>
  </main>
</template>

<script setup lang="ts">
/**
 * 文章内容组件
 */
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { onMounted, ref } from 'vue';
import useArticle from '@renderer/hooks/useArticle'
import useType from '@renderer/hooks/useType'
import useCategory from '@renderer/hooks/useCategory';

let article = ref<ContentEntity>()
let typeList = ref<TypeEntity[]>([])
let type = ref<TypeEntity>()
let categoryList =ref<CategoryEntity[]>([])
let category = ref<CategoryEntity>()

const {getArticleById} = useArticle()
const {getAllTypeList} = useType()
const {getAllCategoryList} = useCategory()

onMounted(async () => {
  // 获取文章内容
  article.value = await getArticleById(snippetsStore.content.selectArticleId)
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
})

const snippetsStore = useSnippetsStore()
</script>

<style lang="scss" scoped>
.article {
  display: flex;
  flex-direction: column;
  .title {
    font-size: 20px;
    font-weight: bold;
    padding: 0 10px;
  }
  .category {
    font-size: 12px;
    padding-top: 5px;
  }
  .content {
    font-size: 16px;
    width: 100%;
    flex: 1;
    padding: 10px 5px 5px;
    textarea {
      width: 100%;
      height: 100%;
      padding: 5px;
    }
  }
}
</style>
