<template>
  <main class="w-full h-full px-2">
    <div class="box folder flex">
      <div class="flex-1">
        <web-tree />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WebTree from '@renderer/components/content/web/WebTree.vue'

const route = useRoute()
onMounted(() => {
  console.log(route.fullPath)
})
</script>

<style lang="scss" scoped>
.folder {
  @apply h-full;
}
</style>
