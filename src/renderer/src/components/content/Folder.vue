<template>
  <div>
    123
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
onMounted(() => {
  console.log(route.fullPath)
})

</script>

<style lang="scss" scoped>

</style>
