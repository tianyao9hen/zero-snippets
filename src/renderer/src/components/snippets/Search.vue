<template>
  <main class="p-3 search rounded-xl select-none">
    <div class="absolute top-1 left-5 w-11/12 h-3 pt-1 drag">
      <div class="w-8/12 h-[3px] m-auto bg-slate-300 rounded-full"></div>
    </div>
    <section class="p-1 rounded-md flax items-center grap-1 no-drag">
      <Input
        ref="search"
        type="text"
        v-model:value="snippetsStore.snippets.search"
        autofocus
        @change="changeInput()"
        @focus="getFocus()"
      />
      <div class="absolute top-6 right-7 text-white pointer-events-none tracking-widest" v-show="snippetsStore.snippets.writeFlag=== false">Tab</div>
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
  },
  { immediate: true }
)

function getFocus(){
  snippetsStore.setWriteFlag(true)
}

function changeInput(){
  handleSearch()
}
</script>

<style scoped lang="scss"></style>
