<template>
  <main class="w-full h-full">
    <blank v-if="blankFlag" />
    <div v-else>{{ snippetsStore.content.selectArticleId }}</div>
  </main>
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import Blank from '@renderer/components/content/Blank.vue'
import { useSnippetsStore } from '@renderer/store/snippetsStore'

const route = useRoute()
let blankFlag = ref(false)
const snippetsStore = useSnippetsStore()

onMounted(() => {
  const { aid } = route.params
  if (!aid || aid === '0') {
    blankFlag.value = true
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
