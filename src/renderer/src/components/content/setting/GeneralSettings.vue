<template>
  <div class="general-settings h-full">
    <header class="px-4 py-3 border-b border-slate-200">
      <h2 class="settings-title">通用配置</h2>
    </header>
    <div class="p-4">
      <div class="flex items-center justify-between py-3 border-b border-slate-100">
        <div class="flex flex-col">
          <span class="text-sm font-medium text-slate-700">开机自启动</span>
          <span class="text-xs text-slate-400 mt-1">开机后自动运行应用</span>
        </div>
        <a-switch :checked="isAutoLaunch" :loading="loading" @change="toggleAutoLaunch" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, Switch as ASwitch } from 'ant-design-vue'

const isAutoLaunch = ref(false)
const loading = ref(false)

/**
 * 获取当前开机自启动状态
 * 通过IPC调用主进程接口查询状态
 */
const getAutoLaunchStatus = async () => {
  try {
    // 调用IPC通道获取自启动状态
    const status = await window.api.getAutoLaunchStatus()
    isAutoLaunch.value = status
  } catch (error) {
    console.error('Failed to get auto launch status:', error)
  }
}

/**
 * 切换开机自启动开关
 * @param checkedValue 开关的新状态，可能为 boolean | string | number
 */
const toggleAutoLaunch = async (checkedValue: boolean | string | number) => {
  const checked = checkedValue as boolean
  loading.value = true
  try {
    // 调用IPC通道设置自启动状态
    const result = await window.api.toggleAutoLaunch(checked)
    if (result.success) {
      // 设置成功，显示提示并更新状态
      message.success(checked ? '已开启开机自启动' : '已关闭开机自启动')
      isAutoLaunch.value = checked
    } else {
      // 设置失败，显示错误信息并回滚开关状态
      message.error(`设置失败: ${result.error}`)
      isAutoLaunch.value = !checked
    }
  } catch (error) {
    // 发生异常，显示错误提示并回滚状态
    message.error('设置发生错误')
    isAutoLaunch.value = !checked
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getAutoLaunchStatus()
})
</script>

<style scoped>
.general-settings {
  @apply flex flex-col;
}

.settings-title {
  @apply text-lg font-medium text-slate-700;
}
</style>
