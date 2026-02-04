<template>
  <main
    class="result rounded-br-xl rounded-bl-xl h-full pb-3 pt-1 box-border -mt-[11px] flex flex-col"
  >
    <TypeList />
    <result-list />
  </main>
</template>

<script setup lang="ts">
import TypeList from '@renderer/components/snippets/TypeList.vue'
import ResultList from '@renderer/components/snippets/ResultList.vue'
</script>

<style scoped lang="scss"></style>
