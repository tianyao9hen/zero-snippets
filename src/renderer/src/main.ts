import { createApp } from 'vue'
import App from './App.vue'
import router from './route'
import '@renderer/assets/styles/global.scss'
import '@renderer/assets/styles/tailwind.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
