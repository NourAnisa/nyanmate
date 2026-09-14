import { createApp } from 'vue'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import App from './App.vue'
import PresenterView from './components/PresenterView.vue'
import ClassReportDashboard from './components/ClassReportDashboard.vue'
import SmartAgendaDashboard from './components/SmartAgendaDashboard.vue'
import FileAssistantDashboard from './components/FileAssistantDashboard.vue'
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
import './v16.css'
import './v17.css'
import './v18.css'
import './v19.css'
import './v20.css'
import './v21.css'
import './v22.css'
import './v23.css'
import './v24.css'
import './v25.css'
import './v26.css'
import './v27.css'
import './v28.css'

type NativeInputEvent = {
  kind: 'key' | 'mouseMove' | 'wheel'
  x?: number | null
  y?: number | null
  deltaX?: number | null
  deltaY?: number | null
}

const label = getCurrentWindow().label
const Root = label === 'presenter'
  ? PresenterView
  : label === 'reports'
    ? ClassReportDashboard
    : label === 'agenda'
      ? SmartAgendaDashboard
      : label === 'assistant'
        ? FileAssistantDashboard
        : App

createApp(Root).mount('#app')

// v0.31: Native input feedback is applied at the root document level so
// keyboard/mouse/scroll reactions remain visible even while Pomodoro puts the
// mascot in the `coding` state. The Rust bridge emits only event type and
// pointer coordinates; typed characters are never sent to the frontend.
if (label === 'main') {
  const root = document.documentElement
  const timers = new Map<string, number>()
  let keyHits: number[] = []
  let lastPointer = { x: 0, y: 0, t: performance.now() }

  const pulse = (className: string, duration: number) => {
    root.classList.add(className)
    const old = timers.get(className)
    if (old) window.clearTimeout(old)
    timers.set(className, window.setTimeout(() => {
      root.classList.remove(className)
      timers.delete(className)
    }, duration))
  }

  void listen<NativeInputEvent>('native-input-event', ({ payload }) => {
    if (payload.kind === 'key') {
      const now = Date.now()
      keyHits = keyHits.filter(time => now - time < 1800)
      keyHits.push(now)
      pulse('native-key-active', 260)
      if (keyHits.length >= 11) {
        pulse('native-overheat-active', 2300)
      }
      return
    }

    if (payload.kind === 'wheel') {
      pulse('native-scroll-active', 800)
      return
    }

    if (payload.kind === 'mouseMove' && typeof payload.x === 'number' && typeof payload.y === 'number') {
      const now = performance.now()
      const dt = Math.max(8, now - lastPointer.t)
      const speed = Math.hypot(payload.x - lastPointer.x, payload.y - lastPointer.y) / dt * 1000
      lastPointer = { x: payload.x, y: payload.y, t: now }
      if (speed > 1100) pulse('native-hunt-active', 720)
    }
  })
}
