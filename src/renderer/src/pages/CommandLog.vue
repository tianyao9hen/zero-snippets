<template>
  <main class="command-log-page">
    <section class="header">
      <div class="title">命令执行日志</div>
      <div class="subtitle">展示当前正在执行命令的输出内容</div>
    </section>
    <section class="content">
      <command-log-tabs />
    </section>
  </main>
</template>

<script setup lang="ts">
/**
 * @description 命令执行日志窗口入口页面
 * 仅负责整体布局，具体日志展示交由子组件实现。
 */
import CommandLogTabs from '@renderer/components/commandLog/CommandLogTabs.vue'
</script>

<style scoped>
.command-log-page {
  @apply w-full h-screen flex flex-col bg-slate-50;
}

.header {
  @apply px-4 py-3 border-b border-slate-200 bg-white;
}

.title {
  @apply text-base font-semibold text-slate-800;
}

.subtitle {
  @apply text-xs text-slate-500 mt-1;
}

.content {
  @apply flex-1 min-h-0 overflow-hidden p-3;
}
</style>
