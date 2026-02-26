<template>
  <main class="setting-page">
    <section class="setting-menu box">
      <div class="box-title unselectable">设置</div>
      <div class="setting-menu-content box-content">
        <div
          v-for="item in menuConfig"
          :key="item.id"
          class="setting-menu-item box-item unselectable"
          :class="{ active: activeMenuId === item.id }"
          @click="activeMenuId = item.id"
        >
          <span class="box-item-content unselectable">{{ item.label }}</span>
        </div>
      </div>
    </section>
    <section class="setting-content">
      <component :is="currentComponent" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import GeneralSettings from './setting/GeneralSettings.vue'
import ShortcutSettings from './setting/ShortcutSettings.vue'
import NoteSettings from './setting/NoteSettings.vue'
import ArticleSettings from './setting/ArticleSettings.vue'

interface MenuConfig {
  id: string
  label: string
  component: Component
}

const menuConfig: MenuConfig[] = [
  { id: 'general', label: '通用配置', component: GeneralSettings },
  { id: 'shortcut', label: '快捷键', component: ShortcutSettings },
  { id: 'note', label: '随手记', component: NoteSettings },
  { id: 'article', label: '知识库', component: ArticleSettings }
]

const activeMenuId = ref<string>('general')

const currentComponent = computed(() => {
  const menu = menuConfig.find((item) => item.id === activeMenuId.value)
  return menu?.component || menuConfig[0].component
})
</script>

<style scoped>
.setting-page {
  @apply w-full h-full;
  display: grid;
  grid-template: 'menu content' 100% / 150px auto;
}

.setting-menu {
  grid-area: menu;
  @apply flex flex-col;
}

.setting-menu-content {
  @apply flex-1;
}

.setting-menu-item {
  @apply cursor-pointer;
}

.setting-content {
  grid-area: content;
  @apply overflow-auto bg-white mx-2 rounded-lg shadow-lg;
}
</style>
