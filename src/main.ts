import { createApp } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import App from './App.vue'
import PresenterView from './components/PresenterView.vue'
import './style.css'
import './presentation.css'
import './v05.css'
import './v06.css'
import './v07.css'
import './v08.css'
import './v09.css'

const Root = getCurrentWindow().label === 'presenter' ? PresenterView : App
createApp(Root).mount('#app')
