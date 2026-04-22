import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import './styles/dark-mode.css'
import { registerClickEvents } from '@/utils/eventBusHandler/clickEventHandler'
import { registerPlayEvents } from '@/utils/eventBusHandler/playEventHandler'
import { registerToastMessages } from '@/utils/eventBusHandler/toastEventHandler'
import { useUserStore } from './stores/user'
import { usePlayerStore } from './stores/playerStore'


const app = createApp(App);

app.use(createPinia());
app.use(router);

const userStore = useUserStore();
const player = usePlayerStore();
player.init();
userStore.init();

registerClickEvents(router);
registerPlayEvents(player);
registerToastMessages();

app.mount('#app');
