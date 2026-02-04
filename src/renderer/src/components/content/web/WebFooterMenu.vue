<template>
  <main
    class="footer-menu unselectable"
    :class="{ 'hover-edit': hoverFlag }"
    @mouseover="choiceAddButton(true)"
    @mouseout="choiceAddButton(false)"
    @click="addCategory()"
  >
    <img :src="hoverFlag ? addIcon.url : addIcon.dUrl" />
  </main>
</template>

<script setup lang="ts">
import { iconMap } from '@renderer/composables/iconUtils'
import { ref } from 'vue'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import useCategory from '@renderer/hooks/useCategory'
import { useRouter } from 'vue-router'

const { addCategoryItem } = useCategory()
const snippetsStore = useSnippetsStore()
const addIcon = iconMap['add']
const router = useRouter()
const hoverFlag = ref(false)

/**
 * 鼠标移入移出
 * @param flag 鼠标状态flag。true: 移入 false: 移出
 */
function choiceAddButton(flag: boolean) {
  hoverFlag.value = flag
}

/**
 * 新增类别
 */
async function addCategory() {
  const categoryId = await addCategoryItem(snippetsStore.content.selectTypeId, '新建类别')
  router.push({
    name: 'web',
    params: {
      tid: snippetsStore.content.selectTypeId,
      cid: categoryId
    },
    query: {
      t: Date.now()
    }
  })
}
</script>

<style scoped></style>
