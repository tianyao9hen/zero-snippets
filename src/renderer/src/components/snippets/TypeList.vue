<template>
  <section class="type-list w-full h-10 py-1 mb-1 px-3 flex items-center">
    <div
      class="type-item flex"
      :class="{
        active: snippetsStore.snippets.selectTypeId === 0,
        focus: snippetsStore.snippets.selectTypeId === 0 && snippetsStore.snippets.typeFlag
      }"
    >
      <div class="type-item-info">全部结果</div>
    </div>
    <div
      v-for="item in snippetsStore.snippets.typeList"
      :key="item.id"
      class="type-item"
      :class="{
        active: item.id === snippetsStore.snippets.selectTypeId,
        focus: item.id === snippetsStore.snippets.selectTypeId && snippetsStore.snippets.typeFlag
      }"
    >
      <div class="type-item-info">
        {{ item.name }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { useSnippetsStore } from '@renderer/store/snippetsStore'

const snippetsStore = useSnippetsStore()
</script>

<style lang="scss" scoped></style>
