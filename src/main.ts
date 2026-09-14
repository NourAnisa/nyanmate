import { createApp } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import App from './App.vue'
import PresenterView from './components/PresenterView.vue'
import ClassReportDashboard from './components/ClassReportDashboard.vue'
import './style.css'
import './presentation.css'
import './v05.css'
import './v06.css'
import './v07.css'
import './v08.css'
import './v09.css'
import './v10.css'
import './v11.css'
import './v12.css'
import './v13.css'
import './v14.css'
import './v15.css'

const label = getCurrentWindow().label
const Root = label === 'presenter' ? PresenterView : label === 'reports' ? ClassReportDashboard : App
createApp(Root).mount('#app')
