<template>
  <main class="catelog-page">
    <section class="catelog box">
      <div class="box-title">文章目录</div>
      <div class="box-content catelog-content">
        <div class="catelog-content-box">
          <div
            class="box-item"
            :class="{ active: snippetsStore.content.selectArticleId === content.id }"
            v-for="content in contentList"
            :key="content.id"
            @click="choiceArticle(content.id)"
          >
            <span class="box-item-content">{{ content.title }}</span>
          </div>
        </div>
      </div>
    </section>
    <section class="article"></section>
  </main>
</template>

<script setup lang="ts">
import useSearch from '@renderer/hooks/useSearch'
import { onMounted, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useSnippetsStore } from '@renderer/store/snippetsStore'

const { getContentListByTypeIdAndCategoryId } = useSearch()
const route = useRoute()
const snippetsStore = useSnippetsStore()
let contentList = ref<ContentType[]>([])

onMounted(() => {
  const { tid, cid } = route.params as { tid: string; cid: string }
  contentList.value = getContentList(tid, cid)
  console.log('mounted', tid, cid, contentList.value)
})

onBeforeRouteUpdate((to, _from, _next) => {
  const { tid, cid } = to.params as { tid: string; cid: string }
  contentList.value = getContentList(tid, cid)
  console.log('beforeRouteUpdate', tid, cid, contentList.value)
})

function getContentList(tid: string, cid: string): ContentType[] {
  if (tid && cid) {
    return getContentListByTypeIdAndCategoryId(Number(tid), Number(cid))
  }
  return []
}

function choiceArticle(aid: number) {
  snippetsStore.choiceArticle(aid)
}
</script>

<style scoped></style>
