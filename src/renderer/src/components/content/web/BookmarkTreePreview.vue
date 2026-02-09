<template>
  <div class="bookmark-tree-preview">
    <ul class="tree-list">
      <li v-for="(node, index) in nodes" :key="index" class="tree-item">
        <div class="tree-node" :class="{ 'is-folder': node.children }">
          <!-- 文件夹图标 -->
          <svg
            v-if="node.children"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            class="node-icon folder-icon"
          >
            <path
              fill="currentColor"
              d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
            />
          </svg>
          <!-- 链接图标 -->
          <svg v-else viewBox="0 0 24 24" width="14" height="14" class="node-icon link-icon">
            <path
              fill="currentColor"
              d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
            />
          </svg>
          <span class="node-title" :title="node.url">{{ node.title }}</span>
        </div>
        <!-- 递归渲染子节点 -->
        <BookmarkTreePreview
          v-if="node.children && node.children.length > 0"
          :nodes="node.children"
          class="nested-tree"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/**
 * @file BookmarkTreePreview.vue
 * @description 书签树预览组件
 *
 * 功能说明：
 * - 递归显示书签节点树
 * - 区分文件夹和链接节点
 * - 简洁的预览样式
 */
import type { BookmarkNode } from '@renderer/composables/bookmarkParserUtils'

defineProps<{
  nodes: BookmarkNode[]
}>()
</script>

<style scoped>
.bookmark-tree-preview {
  font-size: 12px;
}

.tree-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-item {
  margin: 0;
  padding: 0;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  color: #595959;
}

.tree-node.is-folder {
  color: #262626;
  font-weight: 500;
}

.node-icon {
  flex-shrink: 0;
}

.folder-icon {
  color: #faad14;
}

.link-icon {
  color: #4096ff;
}

.node-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nested-tree {
  padding-left: 20px;
}
</style>
