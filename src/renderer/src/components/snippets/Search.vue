<template>
  <main class="p-3 search rounded-xl select-none drag">
    <section class="p-1 rounded-lg flax items-center grap-1 no-drag">
      <Input
        ref="search"
        v-model:value="snippetsStore.snippets.search"
        @change="handleSearch()"
        autofocus
        @focus="getFocus()"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { Input } from 'ant-design-vue'
import useSearch from '@renderer/hooks/useSearch'
import { ref, watch } from 'vue'
const snippetsStore = useSnippetsStore()
const { handleSearch } = useSearch()

const search = ref<HTMLDivElement>()

watch(
  () => snippetsStore.snippets.writeFlag,
  (newValue, _oldValue) => {
    if(newValue){
      search.value?.focus()
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
