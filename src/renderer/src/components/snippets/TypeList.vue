<template>
  <section class="type-list w-full h-10 py-1 mb-1 px-3 flex items-center">
    <div
      class="type-item flex"
      :class="{
        active: snippetsStore.snippets.selectTypeId === 0,
        focus: snippetsStore.snippets.selectTypeId === 0 && snippetsStore.snippets.typeFlag
      }"
      @click="selectTypeById(0)"
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
      @click="selectTypeById(item.id)"
    >
      <div class="type-item-info">
        {{ item.title }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import useSelect from '@renderer/hooks/useSelect'

const snippetsStore = useSnippetsStore()
const { selectTypeById } = useSelect()
</script>

<style lang="scss" scoped></style>
