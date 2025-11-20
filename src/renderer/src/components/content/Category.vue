<template>
  <main class="category-page">
    <section class="category-category">
      <quick-nav />
      <category-list />
      <footer-menu />
    </section>
    <section class="category-content">
      <router-view />
    </section>
  </main>
</template>

<script setup lang="ts">
/**
 * 类别列表组件
 */
import QuickNav from '@renderer/components/content/category/QuickNav.vue'
import FooterMenu from '@renderer/components/content/category/FooterMenu.vue'
import CategoryList from '@renderer/components/content/category/CategoryList.vue'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSnippetsStore } from '@renderer/store/snippetsStore'

const route = useRoute()
const router = useRouter()
const snippetsStore = useSnippetsStore()

onMounted(() => {
  const { tid, cid } = route.params
  if (cid) {
    const categoryId = Number(route.params.cid)
    snippetsStore.choiceCategory(categoryId)
  } else {
    choiceCategory(tid ? Number(tid) : 1, 0)
  }
})

function choiceCategory(tid: number, cid: number) {
  snippetsStore.choiceCategory(cid)
  router.push({
    name: 'catelog',
    params: {
      tid,
      cid
    },
    query: {
      t: Date.now()
    }
  })
}
</script>

<style scoped>
.category-page {
  @apply w-full h-full;
  display: grid;
  grid-template: 'category content' 100% / 120px auto;

  .category-category {
    grid-area: category;
    @apply flex flex-col;
  }

  .category-content {
    grid-area: content;
  }
}
</style>
