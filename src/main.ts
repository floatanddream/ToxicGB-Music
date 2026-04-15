import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'
import './styles/dark-mode.css'
import { registerEvents } from '@/utils/eventBusHandler'

registerEvents(router)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
