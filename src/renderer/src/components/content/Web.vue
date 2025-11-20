<template>
  <main class="web-page">
    <section class="web-category">
      <web-quick-nav />
      <web-category-list />
      <web-footer-menu />
    </section>
    <section class="web-content">
      <router-view />
    </section>
  </main>
</template>

<script setup lang="ts">
/**
 * 网页类别列表组件
 */
import WebQuickNav from '@renderer/components/content/web/WebQuickNav.vue'
import WebFooterMenu from '@renderer/components/content/web/WebFooterMenu.vue'
import WebCategoryList from '@renderer/components/content/web/WebCategoryList.vue'
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
    name: 'folder',
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
.web-page {
  @apply w-full h-full;
  display: grid;
  grid-template: 'category content' 100% / 120px auto;

  .web-category {
    grid-area: category;
    @apply flex flex-col;
  }

  .web-content {
    grid-area: content;
  }
}
</style>
