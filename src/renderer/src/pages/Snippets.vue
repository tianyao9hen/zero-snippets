<template>
  <main class="relative p-1">
    <Search />
    <Result v-if="snippetsStore.snippets.resultList.length > 0"/>
  </main>
</template>

<script setup lang="ts">
import Search from '@renderer/components/snippets/Search.vue';
import Result from '@renderer/components/snippets/Result.vue';
import { useSnippetsStore } from '@renderer/store/snippetsStore'

const snippetsStore = useSnippetsStore()
</script>

<style scoped>

</style>
