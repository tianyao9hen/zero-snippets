<template>
  <main class="article">
      {{ snippetsStore.content.selectArticleId }}
      {{ snippetsStore.content.selectArticle?.title }}
      {{ snippetsStore.content.selectArticle?.content }}
  </main>
</template>

<script setup lang="ts">
/**
 * 文章内容组件
 */
import { useSnippetsStore } from '@renderer/store/snippetsStore'

const snippetsStore = useSnippetsStore()
</script>
