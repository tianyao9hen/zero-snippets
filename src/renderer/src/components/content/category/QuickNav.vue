<template>
  <main class="quick-nav box">
    <div class="box-title">快捷操作</div>
    <div class="quick-nav-content box-content">
      <div
        class="quick-nav-item box-item"
        :class="{ active: snippetsStore.content.selectCategoryId === 0 }"
        @click="choiceCategory(0)"
      >
        <img :src="snippetsStore.content.selectCategoryId === 0 ? allIcon.url : allIcon.dUrl" />
        <span class="box-item-content">
          所有片段
        </span>
      </div>
      <div
        class="quick-nav-item box-item"
        :class="{ active: snippetsStore.content.selectCategoryId === -1 }"
        @click="choiceCategory(-1)"
      >
        <img
          :src="
            snippetsStore.content.selectCategoryId === -1 ? noFolderIcon.url : noFolderIcon.dUrl
          "
        />
        <span class="box-item-content">
          未分类
        </span>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { iconMap } from '@renderer/composables/iconUtils'
import { useRouter } from 'vue-router'

const allIcon = iconMap['all']
const noFolderIcon = iconMap['noFolder']
const snippetsStore = useSnippetsStore()
const router = useRouter()

function choiceCategory(cid: number) {
  snippetsStore.choiceCategory(cid)
  console.log(`/content/${snippetsStore.content.selectTypeId}/category/${cid}/catelog`)
  router.push({
    name: 'catelog',
    params: {
      tid: snippetsStore.content.selectTypeId,
      cid
    },
    query: {
      t: Date.now()
    }
  })
}
</script>

<style scoped></style>
