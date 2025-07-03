<template>
  <main class="p-3 search rounded-xl select-none drag">
    <section class="p-1 rounded-lg flax items-center grap-1 no-drag">
      <Input
        ref="search"
        type="text"
        v-model:value="snippetsStore.snippets.search"
        autofocus
        @change="handleSearch()"
        @focus="getFocus()"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { Input } from 'ant-design-vue'
import useSearch from '@renderer/hooks/useSearch'
import {ref, watch } from 'vue'
const snippetsStore = useSnippetsStore()
const { handleSearch } = useSearch()

const search = ref<HTMLInputElement>()

watch(
  () => snippetsStore.snippets.writeFlag,
  async (newValue, _oldValue) => {
    if(newValue){
      search.value?.focus()
      setTimeout(() => {
        const len = snippetsStore.snippets.search.length
        search.value?.setSelectionRange(len,len)
      }, 10)
    }else{
      search.value?.blur()
    }
    console.log(snippetsStore.snippets.writeFlag)
  },
  { immediate: true }
)

function getFocus(){
  snippetsStore.snippets.writeFlag = true
}
</script>

<style scoped lang="scss"></style>
