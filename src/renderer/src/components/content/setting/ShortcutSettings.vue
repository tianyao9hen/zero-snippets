<template>
  <div class="shortcut-settings bg-white rounded-lg">
    <header class="px-4 py-3 border-b border-slate-200">
      <h2 class="settings-title">快捷键</h2>
    </header>
    <div class="p-4">
      <p class="text-slate-500">快捷键配置内容区域</p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.shortcut-settings {
  @apply flex flex-col;
}

.settings-title {
  @apply text-lg font-medium text-slate-700;
}
</style>
