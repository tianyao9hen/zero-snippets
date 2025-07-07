<template>
  <main id="snippets" class="relative p-1">
    <Search />
    <Result v-if="snippetsStore.snippets.resultList.length > 0" />
  </main>
</template>

<script setup lang="ts">
import Search from '@renderer/components/snippets/Search.vue'
import Result from '@renderer/components/snippets/Result.vue'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import useIgnoreMouseEvent from '@renderer/hooks/useIgnoreMouseEvent'
import { onMounted, onUnmounted } from 'vue'

const snippetsStore = useSnippetsStore()
const { setIgnoreMouseEvent } = useIgnoreMouseEvent()

onMounted(() => {
  const snippets = document.getElementById('snippets')
  snippets?.addEventListener('contextmenu', showMainMenu)
  setIgnoreMouseEvent(snippets!)
})
onUnmounted(() => {
  const snippets = document.getElementById('snippets')
  snippets?.removeEventListener('contextmenu', showMainMenu)
})

function showMainMenu() {
  window.api.showMainMenu()
}
</script>

<style scoped></style>
