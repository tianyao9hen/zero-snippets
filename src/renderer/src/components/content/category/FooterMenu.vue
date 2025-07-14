<template>
  <main
    class="footer-menu category-section"
    :class="{'hover-edit': hoverFlag}"
    @mouseover="choiceAddButton(true)"
    @mouseout="choiceAddButton(false)"
  >
    <img :src="hoverFlag ? addIcon.url : addIcon.dUrl" />
  </main>
</template>

<script setup lang="ts">
import { iconMap } from '@renderer/composables/iconUtils'
import { ref } from 'vue'

const addIcon = iconMap['add']
let hoverFlag = ref(false)

function choiceAddButton(flag: boolean) {
  console.log('choiceAddButton')
  hoverFlag.value = flag
}
</script>

<style scoped></style>
