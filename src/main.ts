import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'
import './styles/dark-mode.css'
import { registerEvents } from '@/utils/eventBusHandler'
import { useUserStore } from './stores/user'
import { usePlayerStore } from './stores/playerStore'

registerEvents(router);

const app = createApp(App);

app.use(createPinia());
app.use(router);

const userStore = useUserStore();
const player = usePlayerStore();
player.init();
userStore.init();

app.mount('#app');
