<template>
  <main class="p-3 search rounded-xl select-none">
    <div class="drag absolute top-1 w-[94%] h-3"></div>

    <section class="p-1 rounded-md flax items-center grap-1">
      <Input
        ref="search"
        v-model:value="snippetsStore.snippets.search"
        type="text"
        autofocus
        @change="changeInput()"
        @focus="getFocus()"
      />
      <div
        v-show="snippetsStore.snippets.writeFlag === false"
        class="absolute top-6 right-7 text-white pointer-events-none tracking-widest"
      >
        Tab
      </div>
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

const search = ref<HTMLInputElement>()

watch(
  () => snippetsStore.snippets.writeFlag,
  // eslint-disable-next-line
  async (newValue, _oldValue) => {
    if (newValue) {
      search.value?.focus()
      setTimeout(() => {
        const len = snippetsStore.snippets.search.length
        search.value?.setSelectionRange(len, len)
      }, 10)
    } else {
      search.value?.blur()
    }
  },
  { immediate: true }
)

function getFocus() {
  snippetsStore.setWriteFlag(true)
}

function changeInput() {
  handleSearch()
}
</script>

<style scoped lang="scss"></style>
