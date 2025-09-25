<template>
  <main class="w-full h-full">
    <blank v-if="blankFlag" />
    <article-entity v-else/>
  </main>
</template>

<script setup lang="ts">
/**
 * 文章页面
 */
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import Blank from '@renderer/components/content/article/Blank.vue'
import ArticleEntity from '@renderer/components/content/article/ArticleEntity.vue'
import { useSnippetsStore } from '@renderer/store/snippetsStore'

const route = useRoute()
let blankFlag = ref(false)
const snippetsStore = useSnippetsStore()

onMounted(() => {
  const { aid } = route.params
  if (!aid || aid === '0') {
    blankFlag.value = true
  } else {
    blankFlag.value = false
    snippetsStore.content
  }
})

onBeforeRouteUpdate((to, _from, next) => {
  const { aid } = to.params
  if (!aid || aid === '0') {
    blankFlag.value = true
  }
  next()
})
</script>

<style scoped></style>
