import { createApp } from 'vue'
import App from './App.vue'
import router from './route'
import { createPinia } from 'pinia'
import '@renderer/assets/styles/global.scss'
import '@renderer/assets/styles/tailwind.css'
import '@renderer/assets/styles/components.scss'

const app = createApp(App)
const pinia = createPinia();
app.use(router)
app.use(pinia)
app.mount('#app')
