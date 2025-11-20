<template>
  <main class="quick-nav box">
    <div class="box-title unselectable">快捷操作</div>
    <div class="quick-nav-content box-content">
      <div
        class="quick-nav-item box-item unselectable"
        :class="{ active: snippetsStore.content.selectCategoryId === 0 }"
        @click="choiceCategory(0)"
      >
        <img :src="snippetsStore.content.selectCategoryId === 0 ? allIcon.url : allIcon.dUrl" />
        <span class="box-item-content unselectable">
          所有片段
        </span>
      </div>
      <div
        class="quick-nav-item box-item unselectable"
        :class="{ active: snippetsStore.content.selectCategoryId === -1 }"
        @click="choiceCategory(-1)"
      >
        <img
          :src="
            snippetsStore.content.selectCategoryId === -1 ? noFolderIcon.url : noFolderIcon.dUrl
          "
        />
        <span class="box-item-content unselectable">
          未分类
        </span>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { iconMap } from '@renderer/composables/iconUtils'
import { useRoute, useRouter } from 'vue-router'

const allIcon = iconMap['all']
const noFolderIcon = iconMap['noFolder']
const snippetsStore = useSnippetsStore()
const route = useRoute()
const router = useRouter()

function choiceCategory(cid: number) {
  snippetsStore.choiceCategory(cid)
  router.push({
    name: 'folder',
    params: {
      tid: route.params.tid,
      cid
    },
    query: {
      t: Date.now()
    }
  })
}
</script>

<style scoped></style>
