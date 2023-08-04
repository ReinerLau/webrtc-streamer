import './assets/main.css'

import { log } from 'rtc-streamer'
import { createApp } from 'vue'
import App from './App.vue'

log()

createApp(App).mount('#app')
