<template>
  <main
    class="result rounded-br-xl rounded-bl-xl h-full pb-3 pt-3 box-border -mt-[11px] overflow-hidden"
  >
    <section
      :ref="setSectionRef"
      tabindex="-1"
      class="rounded-br-xl rounded-bl-xl pb-3 px-3 w-full max-h-[400px] opacity-100"
    >
      <div
        :ref="setItemRef"
        v-for="item in snippetsStore.snippets.result"
        :key="item.id"
        :tabindex="item.id"
        class="rounded-md px-1 truncate"
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
const {setItemRef, setSectionRef} = useSelect()

</script>

<style scoped lang="scss"></style>
