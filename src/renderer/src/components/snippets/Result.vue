<template>
  <main
    class="result rounded-br-xl rounded-bl-xl h-full pb-3 pt-1 box-border -mt-[11px] flex flex-col"
  >
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
    <section
      :ref="setSectionRef"
      class="result-list relative rounded-br-xl rounded-bl-xl px-3 w-full max-h-[379px]"
    >
      <div
        :ref="(el) => setItemRef(el, item.id)"
        v-for="item in snippetsStore.snippets.resultList"
        :key="item.id"
        class="rounded-md px-1 truncate h-8 leading-8"
        :class="{ active: item.id == snippetsStore.snippets.selectId }"
      >
        {{ item.content }}
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import useSelect from '@renderer/hooks/useSelect'

const snippetsStore = useSnippetsStore()
const { setItemRef, setSectionRef } = useSelect()
console.log(snippetsStore.snippets.selectTypeId)
</script>

<style scoped lang="scss"></style>
