import { createApp } from 'vue'
import App from './App.vue'
import router from './route'
import { createPinia } from 'pinia'
import { useSettingStore } from '@renderer/store/settingStore'
import ContextMenu from '@imengyu/vue3-context-menu'
import '@renderer/assets/styles/global.scss'
import '@renderer/assets/styles/tailwind.css'
import '@renderer/assets/styles/components.scss'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.use(ContextMenu)

// 初始化设置 Store 并加载所有设置
const settingStore = useSettingStore()
settingStore.loadSettings()

app.mount('#app')
