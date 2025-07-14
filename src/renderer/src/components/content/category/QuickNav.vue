<template>
  <main class="quick-nav category-section">
    <div class="quick-nav-title">快捷操作</div>
    <div class="quick-nav-content">
      <div
        class="quick-nav-item"
        :class="{ active: snippetsStore.content.selectCategoryId === 0 }"
        @click="choiceCategory(0)"
      >
        <img :src="snippetsStore.content.selectCategoryId === 0 ? allIcon.url : allIcon.dUrl" />
        所有片段
      </div>
      <div
        class="quick-nav-item"
        :class="{ active: snippetsStore.content.selectCategoryId === -1 }"
        @click="choiceCategory(-1)"
      >
        <img
          :src="
            snippetsStore.content.selectCategoryId === -1 ? noFolderIcon.url : noFolderIcon.dUrl
          "
        />
        未分类
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { iconMap } from '@renderer/composables/iconUtils'

const allIcon = iconMap['all']
const noFolderIcon = iconMap['noFolder']
const snippetsStore = useSnippetsStore()

function choiceCategory(id: number) {
  snippetsStore.choiceCategory(id)
}
</script>

<style scoped></style>
