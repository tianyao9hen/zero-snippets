import { createApp } from 'vue'
import App from './App.vue'
import router from './route'
import { createPinia } from 'pinia'
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
app.mount('#app')
