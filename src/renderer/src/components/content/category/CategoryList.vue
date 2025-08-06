<template>
  <main class="category-list box">
    <section class="box-title">类别目录</section>
    <section class="category-list-content box-content" ref="categoryListRef">
      <div
        class="category-item box-item"
        :class="{ active: snippetsStore.content.selectCategoryId === category.id }"
        v-for="category in categoryList"
        :key="category.id"
        :ref="(el) => setItemRef(category.id, el)"
        @click="choiceCategory(category.id)"
      >
        <img
          :src="
            snippetsStore.content.selectCategoryId === category.id
              ? folderIcon.url
              : folderIcon.dUrl
          "
        />
        <span class="box-item-content">
          {{ category.title }}
        </span>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
// 类别列表
import useCategory from '@renderer/hooks/useCategory'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { iconMap } from '@renderer/composables/iconUtils'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const categoryListRef = ref<HTMLDivElement>()
const itemListRef = ref<Map<number, HTMLDivElement>>(new Map())

const folderIcon = iconMap['folder']
const snippetsStore = useSnippetsStore()
const { getAllCategoryList } = useCategory()
const categoryList = ref<CategoryEntity[]>([])
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  categoryList.value = await getAllCategoryList()
  // 初始化时若有cid参数，则滚动到指定类别
  const cid = route.params.cid
  if(cid){
    const itemRef = itemListRef.value.get(Number(cid))
    if(itemRef){
      categoryListRef.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * 5)
    }
  }
})

function setItemRef(itemId: number, el) {
  if (el) {
    itemListRef.value.set(itemId, el)
  }
}
function choiceCategory(cid: number) {
  snippetsStore.choiceCategory(cid)
  console.log(`/content/${snippetsStore.content.selectTypeId}/category/${cid}/catelog`)
  router.push({
    name: 'catelog',
    params: {
      tid: snippetsStore.content.selectTypeId,
      cid
    },
    query: {
      t: Date.now()
    }
  })
}
</script>

<style scoped></style>
