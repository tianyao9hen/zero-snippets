<template>
  <section
    :ref="setSectionRef"
    class="result-list relative rounded-br-xl rounded-bl-xl px-3 w-full max-h-[379px]"
  >
    <div
      :ref="(el) => setItemRef(el, item.id)"
      v-for="item in snippetsStore.snippets.resultList"
      :key="item.id"
      class="result-item rounded-md p-1 h-8 leading-6 flex items-center"
      :class="{
        active: item.id == snippetsStore.snippets.selectId,
        focus: item.id == snippetsStore.snippets.selectId && snippetsStore.snippets.resultFlag
      }"
    >
      <div class="result-item-focus"></div>
      <div class="result-item-info truncate flex-1">
        {{ item.content }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import useSelect from '@renderer/hooks/useSelect'

const snippetsStore = useSnippetsStore()
const { setItemRef, setSectionRef } = useSelect()
</script>

<style lang="scss" scoped></style>
